const { Order } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.orderById = async (req, res, next, id) => {
  try {
    const order = await Order.findById(id)
      .populate('products.product', 'name price')
      .populate('user', '_id name email address')
      .exec();
    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
      });
    }
    req.order = order;
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

exports.create = async (req, res) => {
  try {
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    const data = await order.save();
    res.json(data);
  } catch (error) {
    return res.status(400).json({
      error: errorHandler(error),
    });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', '_id name email address')
      .sort('-createdAt -created')
      .exec();
    res.json(orders);
  } catch (error) {
    return res.status(400).json({
      error: errorHandler(error),
    });
  }
};

exports.getStatusValues = (req, res) => {
  res.json(Order.schema.path('status').enumValues);
};

const getValidNextStatuses = (currentStatus) => {
  switch (currentStatus) {
    case 'Not processed':
      return ['Confirmed', 'Cancelled'];
    case 'Confirmed':
      return ['Processing', 'Cancelled'];
    case 'Processing':
      return ['Shipped', 'Cancelled'];
    case 'Shipped':
      return ['Delivered', 'Cancelled'];
    case 'Cancelled':
      return ['Refunded'];
    default:
      return [];
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.body.orderId);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    const validNext = getValidNextStatuses(order.status);
    if (!validNext.includes(req.body.status)) {
      return res.status(400).json({
        error: `Invalid status transition from "${order.status}" to "${req.body.status}". Allowed next steps: ${validNext.join(', ')}`,
      });
    }

    order.status = req.body.status;
    order.updated = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

exports.getOrderDetails = (req, res) => {
  const orderUserId = req.order.user && req.order.user._id
    ? req.order.user._id.toString()
    : req.order.user
    ? req.order.user.toString()
    : null;

  if (req.profile.role === 'customer' && orderUserId !== req.profile._id.toString()) {
    return res.status(403).json({
      error: 'Access denied. You can only view your own orders.',
    });
  }
  return res.json(req.order);
};
