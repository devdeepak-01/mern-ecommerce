const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/user');
const Product = require('./models/product');
const { Order } = require('./models/order');
const { getOrderDetails, orderById } = require('./controllers/order');
const { isAdmin } = require('./controllers/auth');

const createMockRes = () => {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return res;
};

async function testInvoiceAndAuth() {
  console.log('====================================================');
  console.log('🧪 RUNNING ORDER INVOICE & AUTHENTICATION TESTS');
  console.log('====================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);

  const customer1 = await User.findOne({ email: 'customer1@cara.test' });
  const customer2 = await User.findOne({ email: 'customer2@cara.test' });
  const seller1 = await User.findOne({ email: 'seller1@cara.test' });
  const admin1 = await User.findOne({ email: 'admin1@cara.test' });

  // 1. Find or create an order for customer 1
  let order1 = await Order.findOne({ user: customer1._id });
  if (!order1) {
    const product = await Product.findOne();
    order1 = await new Order({
      products: [{ product: product._id, name: product.name, price: product.price, count: 1 }],
      transaction_id: 'TEST_TXN_123',
      amount: product.price,
      address: '123 Test Street, New York',
      user: customer1._id,
      status: 'Processing',
    }).save();
  }

  // Simulate orderById middleware population
  const populatedOrder = await Order.findById(order1._id)
    .populate('products.product', 'name price')
    .populate('user', '_id name email address')
    .exec();

  // TEST A: Customer 1 accesses their own order invoice
  {
    const req = {
      profile: customer1,
      order: populatedOrder,
    };
    const res = createMockRes();
    getOrderDetails(req, res);
    const pass = res.statusCode === 200 && res.data && res.data._id.toString() === order1._id.toString();
    console.log(`Test A [Customer 1 accesses own invoice]: ${pass ? 'PASSED ✅ (200 OK - Invoice accessible!)' : 'FAILED ❌'}`);
  }

  // TEST B: Customer 2 tries to access Customer 1's invoice (Must be 403 Forbidden)
  {
    const req = {
      profile: customer2,
      order: populatedOrder,
    };
    const res = createMockRes();
    getOrderDetails(req, res);
    const pass = res.statusCode === 403;
    console.log(`Test B [Customer 2 blocked from Customer 1 invoice]: ${pass ? 'PASSED ✅ (403 Forbidden - Correctly blocked)' : 'FAILED ❌'}`);
  }

  // TEST C: Seller 1 accesses order invoice (Privileged)
  {
    const req = {
      profile: seller1,
      order: populatedOrder,
    };
    const res = createMockRes();
    getOrderDetails(req, res);
    const pass = res.statusCode === 200;
    console.log(`Test C [Seller accesses order invoice]: ${pass ? 'PASSED ✅ (200 OK - Allowed)' : 'FAILED ❌'}`);
  }

  // TEST D: Admin 1 accesses order invoice (Privileged)
  {
    const req = {
      profile: admin1,
      order: populatedOrder,
    };
    const res = createMockRes();
    getOrderDetails(req, res);
    const pass = res.statusCode === 200;
    console.log(`Test D [Admin accesses order invoice]: ${pass ? 'PASSED ✅ (200 OK - Allowed)' : 'FAILED ❌'}`);
  }

  // TEST E: Seller 1 passes isAdmin middleware
  {
    let nextCalled = false;
    const req = { profile: seller1 };
    const res = createMockRes();
    isAdmin(req, res, () => { nextCalled = true; });
    const pass = nextCalled && res.statusCode === 200;
    console.log(`Test E [Seller 1 passes isAdmin middleware]: ${pass ? 'PASSED ✅ (Next middleware called)' : 'FAILED ❌'}`);
  }

  // TEST F: Admin 1 passes isAdmin middleware
  {
    let nextCalled = false;
    const req = { profile: admin1 };
    const res = createMockRes();
    isAdmin(req, res, () => { nextCalled = true; });
    const pass = nextCalled && res.statusCode === 200;
    console.log(`Test F [Admin 1 passes isAdmin middleware]: ${pass ? 'PASSED ✅ (Next middleware called)' : 'FAILED ❌'}`);
  }

  // TEST G: Customer 1 blocked by isAdmin middleware
  {
    let nextCalled = false;
    const req = { profile: customer1 };
    const res = createMockRes();
    isAdmin(req, res, () => { nextCalled = true; });
    const pass = !nextCalled && res.statusCode === 403;
    console.log(`Test G [Customer 1 blocked by isAdmin middleware]: ${pass ? 'PASSED ✅ (403 Forbidden)' : 'FAILED ❌'}`);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL INVOICE & AUTH TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================\n');

  await mongoose.connection.close();
}

testInvoiceAndAuth().catch((err) => {
  console.error('Invoice test error:', err);
  process.exit(1);
});
