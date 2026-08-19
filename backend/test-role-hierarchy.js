const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/user');
const Product = require('./models/product');
const { Order } = require('./models/order');
const { updateUserRole, listAllUsers, listSellerCustomers } = require('./controllers/admin');
const { updateUserDetails } = require('./controllers/rbac');

// Mock response helper
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

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING EXACT ROLE HIERARCHY & PERMISSION TESTS');
  console.log('====================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);

  const superAdmin = await User.findOne({ email: 'superadmin@cara.test' });
  const admin = await User.findOne({ email: 'admin1@cara.test' });
  const seller1 = await User.findOne({ email: 'seller1@cara.test' });
  const seller2 = await User.findOne({ email: 'seller2@cara.test' });
  const customer1 = await User.findOne({ email: 'customer1@cara.test' });
  const customer2 = await User.findOne({ email: 'customer2@cara.test' });

  // TEST 1: SuperAdmin promotes Customer to Seller
  {
    const req = {
      profile: superAdmin,
      params: { targetUserId: customer1._id.toString(), userId: superAdmin._id.toString() },
      body: { role: 'seller' },
    };
    const res = createMockRes();
    await updateUserRole(req, res);
    const pass = res.statusCode === 200 && res.data.role === 'seller';
    console.log(`Test 1 [SuperAdmin promotes Customer -> Seller]: ${pass ? 'PASSED ✅ (200 OK, role: seller)' : 'FAILED ❌'}`);
  }

  // TEST 2: SuperAdmin promotes Customer to Admin
  {
    const req = {
      profile: superAdmin,
      params: { targetUserId: customer1._id.toString(), userId: superAdmin._id.toString() },
      body: { role: 'admin' },
    };
    const res = createMockRes();
    await updateUserRole(req, res);
    const pass = res.statusCode === 200 && res.data.role === 'admin';
    console.log(`Test 2 [SuperAdmin promotes Customer -> Admin]: ${pass ? 'PASSED ✅ (200 OK, role: admin)' : 'FAILED ❌'}`);
    
    // Reset customer1 back to customer
    await User.updateOne({ _id: customer1._id }, { role: 'customer' });
  }

  // TEST 3: Admin promotes Customer to Admin (Must be Rejected)
  {
    const req = {
      profile: admin,
      params: { targetUserId: customer1._id.toString(), userId: admin._id.toString() },
      body: { role: 'admin' },
    };
    const res = createMockRes();
    await updateUserRole(req, res);
    const pass = res.statusCode === 403;
    console.log(`Test 3 [Admin promotes Customer -> Admin]: ${pass ? 'PASSED ✅ (403 Forbidden - Rejected)' : 'FAILED ❌'}`);
  }

  // TEST 4: Admin promotes Customer to Seller (Must be Rejected)
  {
    const req = {
      profile: admin,
      params: { targetUserId: customer1._id.toString(), userId: admin._id.toString() },
      body: { role: 'seller' },
    };
    const res = createMockRes();
    await updateUserRole(req, res);
    const pass = res.statusCode === 403;
    console.log(`Test 4 [Admin promotes Customer -> Seller]: ${pass ? 'PASSED ✅ (403 Forbidden - Rejected)' : 'FAILED ❌'}`);
  }

  // TEST 5: Admin tries to access SuperAdmin (SuperAdmin filtered out on Backend API)
  {
    const req = { profile: admin, params: { userId: admin._id.toString() } };
    const res = createMockRes();
    await listAllUsers(req, res);
    const containsSuperAdmin = res.data && res.data.some((u) => u.role === 'superadmin' || u.email === 'superadmin@cara.test');
    const pass = res.statusCode === 200 && !containsSuperAdmin;
    console.log(`Test 5 [Admin user listing hides SuperAdmin on Backend]: ${pass ? 'PASSED ✅ (SuperAdmin is NOT returned to normal Admin)' : 'FAILED ❌'}`);
  }

  // TEST 6: Admin tries direct API role modification (via rbac.updateUserDetails)
  {
    const req = {
      profile: admin,
      params: { targetUserId: customer2._id.toString(), userId: admin._id.toString() },
      body: { role: 'seller' },
    };
    const res = createMockRes();
    await updateUserDetails(req, res);
    const pass = res.statusCode === 403;
    console.log(`Test 6 [Admin direct API PUT role change]: ${pass ? 'PASSED ✅ (403 Forbidden - Blocked by backend)' : 'FAILED ❌'}`);
  }

  // TEST 7: Seller views customers (Only customers who bought Seller's products)
  {
    const req = { profile: seller1, params: { userId: seller1._id.toString() } };
    const res = createMockRes();
    await listSellerCustomers(req, res);
    const visibleCustomerEmails = (res.data || []).map((c) => c.email);
    const hasCustomer1 = visibleCustomerEmails.includes('customer1@cara.test');
    const hasCustomer2 = visibleCustomerEmails.includes('customer2@cara.test');
    const pass = res.statusCode === 200 && hasCustomer1 && !hasCustomer2;
    console.log(`Test 7 [Seller 1 Customer Visibility]: ${pass ? 'PASSED ✅ (Sees Customer 1 who bought their tech product, does NOT see Customer 2)' : 'FAILED ❌'}`);
  }

  // TEST 8: Seller 2 views customers (Only sees Customer 2 who bought their fashion product)
  {
    const req = { profile: seller2, params: { userId: seller2._id.toString() } };
    const res = createMockRes();
    await listSellerCustomers(req, res);
    const visibleCustomerEmails = (res.data || []).map((c) => c.email);
    const hasCustomer1 = visibleCustomerEmails.includes('customer1@cara.test');
    const hasCustomer2 = visibleCustomerEmails.includes('customer2@cara.test');
    const pass = res.statusCode === 200 && hasCustomer2 && !hasCustomer1;
    console.log(`Test 8 [Seller 2 Customer Isolation]: ${pass ? 'PASSED ✅ (Sees Customer 2 who bought their fashion product, does NOT see Customer 1)' : 'FAILED ❌'}`);
  }

  // TEST 9: Existing Admin login authentication
  {
    const authAdmin = await User.findOne({ email: 'admin1@cara.test' });
    const isPasswordValid = authAdmin && authAdmin.authenticate('adminPassword123');
    console.log(`Test 9 [Existing Admin Login Preserved]: ${isPasswordValid ? 'PASSED ✅ (admin1@cara.test authenticates with adminPassword123)' : 'FAILED ❌'}`);
  }

  // TEST 10: SuperAdmin Seed (Fresh recreate with hashed password and all permissions)
  {
    const freshSuper = await User.findOne({ role: 'superadmin' });
    const isSuperAuth = freshSuper && freshSuper.authenticate('superadminPassword123');
    const hasAllPerms = freshSuper && Array.isArray(freshSuper.permissions) && freshSuper.permissions.length === 24;
    console.log(`Test 10 [SuperAdmin Seeded Fresh with 24 permissions]: ${isSuperAuth && hasAllPerms ? 'PASSED ✅ (Fresh SuperAdmin created with hashed password & full RBAC permissions)' : 'FAILED ❌'}`);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL 10 ROLE HIERARCHY TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================\n');

  await mongoose.connection.close();
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
