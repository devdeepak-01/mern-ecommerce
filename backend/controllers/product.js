const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Product = require('../models/product');
const { Order } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');

// Helper to extract first values from formidable v3 array structures
const getFirstValues = (fields) => {
  const result = {};
  for (const key in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      result[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
    }
  }
  return result;
};

// Get product by ID middleware
exports.productById = async (req, res, next, id) => {
  try {
    const product = await Product.findById(id)
      .populate('category')
      .populate('user', '_id name email role')
      .exec();
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }
    req.product = product;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Product not found' });
  }
};

// Read product details
exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

// Create a new product
exports.create = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Image could not be processed' });
    }

    const parsedFields = getFirstValues(fields);
    const { name, description, price, category, quantity, shipping, imageUrl } = parsedFields;

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(400).json({ error: 'All product fields are required' });
    }

    let product = new Product(parsedFields);
    if (req.profile && req.profile._id) {
      product.user = req.profile._id;
    }

    // If imageUrl is provided, ensure it is set
    if (imageUrl && imageUrl.trim() !== '') {
      product.imageUrl = imageUrl.trim();
    }

    const photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;
    if (photo && photo.size > 0) {
      if (photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: 'Image should be less than 1MB in size' });
      }
      product.photo.data = fs.readFileSync(photo.filepath || photo.path);
      product.photo.contentType = photo.mimetype || photo.type;
    }

    try {
      const result = await product.save();
      result.photo = undefined; // Do not send back binary in JSON
      res.json(result);
    } catch (error) {
      return res.status(400).json({ error: errorHandler(error) });
    }
  });
};

// Delete a product (soft delete if in orders)
exports.remove = async (req, res) => {
  try {
    let product = req.product;
    const count = await Order.countDocuments({ 'products.product': product._id });
    if (count > 0) {
      product.isActive = false;
      await product.save();
      return res.json({ message: 'Product is referenced by orders. Deactivated (soft deleted) successfully.' });
    } else {
      await Product.deleteOne({ _id: product._id });
      return res.json({ message: 'Product deleted successfully' });
    }
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err) });
  }
};

// Update a product
exports.update = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Image could not be processed' });
    }

    const parsedFields = getFirstValues(fields);
    let product = req.product;
    product = _.extend(product, parsedFields);

    if (parsedFields.imageUrl !== undefined) {
      product.imageUrl = parsedFields.imageUrl.trim();
    }

    const photo = Array.isArray(files.photo) ? files.photo[0] : files.photo;
    if (photo && photo.size > 0) {
      if (photo.size > 1000000) {
        return res
          .status(400)
          .json({ error: 'Image should be less than 1MB in size' });
      }
      product.photo.data = fs.readFileSync(photo.filepath || photo.path);
      product.photo.contentType = photo.mimetype || photo.type;
    }

    try {
      const result = await product.save();
      result.photo = undefined;
      res.json(result);
    } catch (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }
  });
};

// List products with filters and pagination
exports.list = async (req, res) => {
  const order = req.query.order || 'asc';
  const sortBy = req.query.sortBy || '_id';
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;

  const query = {};
  if (req.query.all !== 'true') {
    query.isActive = true;
  }

  try {
    const products = await Product.find(query)
      .select('-photo')
      .populate('category')
      .populate('user', '_id name email role')
      .sort([[sortBy, order]])
      .limit(limit)
      .exec();
    res.json(products);
  } catch (error) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

// List related products based on category
exports.listRelated = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;

  try {
    const products = await Product.find({
      _id: { $ne: req.product._id },
      category: req.product.category,
    })
      .limit(limit)
      .populate('category', '_id name')
      .populate('user', '_id name email role')
      .exec();
    res.json(products);
  } catch (error) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

// List categories used in products
exports.listCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', {}).exec();
    res.json(categories);
  } catch (error) {
    return res.status(400).json({ error: 'Categories not found' });
  }
};

// List products by search
exports.listBySearch = async (req, res) => {
  const order = req.body.order || 'desc';
  const sortBy = req.body.sortBy || '_id';
  const limit = req.body.limit ? parseInt(req.body.limit) : 100;
  const skip = parseInt(req.body.skip);

  const findArgs = {};
  if (req.body.all !== 'true') {
    findArgs.isActive = true;
  }

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === 'price') {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  try {
    const products = await Product.find(findArgs)
      .select('-photo')
      .populate('category')
      .populate('user', '_id name email role')
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec();
    res.json({ size: products.length, data: products });
  } catch (error) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

// Product photo handler
exports.photo = (req, res, next) => {
  if (req.product.photo && req.product.photo.data && req.product.photo.data.length > 0) {
    res.set('Content-Type', req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  if (req.product.imageUrl) {
    return res.redirect(req.product.imageUrl);
  }
  // No photo or imageUrl — send 404 so the frontend onError fires and shows placeholder
  return res.status(404).end();
};


// List products by search (query-based)
exports.listSearch = async (req, res) => {
  const query = { isActive: true };

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };

    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    try {
      const products = await Product.find(query).select('-photo').exec();
      res.json(products);
    } catch (error) {
      return res.status(400).json({ error: errorHandler(error) });
    }
  }
};

// Decrease product quantity after purchase with concurrent stock checking
exports.decreaseQuantity = async (req, res, next) => {
  const updatedProducts = [];
  try {
    for (const item of req.body.order.products) {
      // Find product to check stock first
      const prod = await Product.findById(item._id);
      if (!prod) {
        throw new Error(`Product ${item.name || 'item'} not found`);
      }
      if (prod.quantity < item.count) {
        throw new Error(`Insufficient stock for product: ${prod.name}`);
      }

      // Atomically update stock checking if quantity >= item.count
      const result = await Product.updateOne(
        { _id: item._id, quantity: { $gte: item.count } },
        { $inc: { quantity: -item.count, sold: item.count } }
      );

      if (result.modifiedCount === 0) {
        // Concurrent update race condition
        throw new Error(`Insufficient stock for product: ${prod.name}`);
      }

      updatedProducts.push({ _id: item._id, count: item.count });
    }
    next();
  } catch (error) {
    // Rollback already modified products
    for (const rolledBack of updatedProducts) {
      await Product.updateOne(
        { _id: rolledBack._id },
        { $inc: { quantity: rolledBack.count, sold: -rolledBack.count } }
      );
    }
    return res.status(400).json({ error: error.message || 'Could not update product stock' });
  }
};
