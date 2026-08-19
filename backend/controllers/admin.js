const Product = require('../models/product');
const User = require('../models/user');
const { Order } = require('../models/order');

exports.dashboardStats = async (req, res) => {
  try {
    // 1. Core aggregates
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
    const totalOrders = await Order.countDocuments();

    // 2. Order status segmentation
    const orders = await Order.find().select('status amount');
    const orderStats = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    let totalSales = 0;

    orders.forEach((order) => {
      const status = (order.status || '').toLowerCase();
      if (status.includes('not processed') || status.includes('pending')) {
        orderStats.pending++;
      } else if (status.includes('processing')) {
        orderStats.processing++;
      } else if (status.includes('shipped')) {
        orderStats.shipped++;
      } else if (status.includes('delivered')) {
        orderStats.delivered++;
      } else if (status.includes('cancelled')) {
        orderStats.cancelled++;
      }

      if (status !== 'cancelled') {
        totalSales += order.amount || 0;
      }
    });

    // 3. Inventory details
    const activeProducts = await Product.find().select('name quantity lowStockThreshold sku sold imageUrl');
    let totalInventory = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockProductsList = [];
    const outOfStockProductsList = [];

    activeProducts.forEach((p) => {
      const stock = p.quantity || 0;
      const threshold = p.lowStockThreshold || 5;
      totalInventory += stock;

      if (stock === 0) {
        outOfStockCount++;
        outOfStockProductsList.push(p);
      } else if (stock <= threshold) {
        lowStockCount++;
        lowStockProductsList.push(p);
      }
    });

    // 4. Recent orders list
    const recentOrders = await Order.find()
      .populate('user', '_id name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    res.json({
      totalProducts,
      totalCustomers,
      totalSellers,
      totalAdmins,
      totalOrders,
      orderStats,
      totalSales,
      totalInventory,
      lowStockCount,
      outOfStockCount,
      lowStockProducts: lowStockProductsList,
      outOfStockProducts: outOfStockProductsList,
      recentOrders,
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Could not fetch admin dashboard stats',
    });
  }
};

// Users listing for Admin/SuperAdmin: NEVER exposes SuperAdmin to normal Admin
exports.listAllUsers = async (req, res) => {
  try {
    const caller = req.profile;
    const filter = {};

    // CRITICAL: Normal Admin must NEVER see SuperAdmin in user listing
    if (!caller || caller.role !== 'superadmin') {
      filter.role = { $ne: 'superadmin' };
    }

    const users = await User.find(filter)
      .select('-hashed_password -salt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    return res.status(400).json({
      error: 'Could not retrieve users',
    });
  }
};

// Update user role: STRICTLY ONLY SuperAdmin
exports.updateUserRole = async (req, res) => {
  const { targetUserId } = req.params;
  const { role } = req.body;
  const caller = req.profile;

  // CORE RULE: ONLY SUPERADMIN CAN ASSIGN/MODIFY ROLES
  if (!caller || caller.role !== 'superadmin') {
    return res.status(403).json({
      error: 'Forbidden: Only SuperAdmin can assign or modify user roles.',
    });
  }

  if (typeof role === 'undefined' || !role.trim()) {
    return res.status(400).json({
      error: 'Invalid role assignment',
    });
  }

  const cleanRole = role.trim().toLowerCase();

  try {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // SAFEGUARD: Prevent demoting the last SuperAdmin
    if (targetUser.role === 'superadmin' && cleanRole !== 'superadmin') {
      const superAdminCount = await User.countDocuments({ role: 'superadmin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          error: 'Safety restriction: Cannot demote the only SuperAdmin account in the system.',
        });
      }
    }

    targetUser.role = cleanRole;
    await targetUser.save();

    targetUser.hashed_password = undefined;
    targetUser.salt = undefined;
    res.json(targetUser);
  } catch (error) {
    return res.status(400).json({
      error: 'Could not update user role',
    });
  }
};

// Seller customer visibility: returns ONLY customers who purchased that seller's products
exports.listSellerCustomers = async (req, res) => {
  const caller = req.profile;

  if (!caller || !['seller', 'admin', 'superadmin'].includes(caller.role)) {
    return res.status(403).json({ error: 'Access denied: Seller resource.' });
  }

  try {
    let productQuery = {};
    if (caller.role === 'seller') {
      productQuery = { user: caller._id };
    }

    const sellerProducts = await Product.find(productQuery).select('_id name price');
    const sellerProductIds = sellerProducts.map((p) => p._id);

    if (sellerProductIds.length === 0) {
      return res.json([]);
    }

    const orders = await Order.find({ 'products.product': { $in: sellerProductIds } })
      .populate('user', '_id name email createdAt')
      .populate('products.product', '_id name price')
      .sort({ createdAt: -1 });

    const customerMap = {};

    orders.forEach((order) => {
      if (!order.user) return;
      const customerId = order.user._id.toString();

      const matchingItems = (order.products || []).filter(
        (item) => item.product && sellerProductIds.some((spId) => spId.toString() === (item.product._id || item.product).toString())
      );

      if (matchingItems.length === 0) return;

      const orderSellerTotal = matchingItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.count || 1),
        0
      );

      if (!customerMap[customerId]) {
        customerMap[customerId] = {
          _id: order.user._id,
          name: order.user.name,
          email: order.user.email,
          createdAt: order.user.createdAt,
          ordersCount: 1,
          totalSpent: orderSellerTotal,
          productsPurchased: matchingItems.map((it) => it.name || it.product?.name || 'Product'),
          latestOrderDate: order.createdAt,
          latestOrderStatus: order.status,
        };
      } else {
        customerMap[customerId].ordersCount += 1;
        customerMap[customerId].totalSpent += orderSellerTotal;
        matchingItems.forEach((it) => {
          const pName = it.name || it.product?.name;
          if (pName && !customerMap[customerId].productsPurchased.includes(pName)) {
            customerMap[customerId].productsPurchased.push(pName);
          }
        });
      }
    });

    res.json(Object.values(customerMap));
  } catch (error) {
    return res.status(400).json({ error: 'Could not fetch seller customers' });
  }
};
