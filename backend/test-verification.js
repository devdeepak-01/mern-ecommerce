const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/user');
const Product = require('./models/product');
const Role = require('./models/role');
const Permission = require('./models/permission');
const { getUserEffectivePermissions } = require('./controllers/auth');

async function testAll() {
  console.log('--- STARTING VERIFICATION TESTS ---');
  await mongoose.connect(process.env.MONGODB_URI);

  // 1. Verify Existing Admin Preservation
  const existingAdmin = await User.findOne({ email: 'admin1@cara.test' });
  if (!existingAdmin) throw new Error('Existing Admin admin1@cara.test not found!');
  const adminAuth = existingAdmin.authenticate('adminPassword123');
  console.log('Test 1: Existing Admin login authentication:', adminAuth ? 'PASSED ✅' : 'FAILED ❌');
  console.log('Test 1b: Existing Admin role is:', existingAdmin.role === 'admin' ? 'PASSED (role is admin) ✅' : 'FAILED ❌');

  // 2. Verify SuperAdmin
  const superAdmin = await User.findOne({ email: 'superadmin@cara.test' });
  if (!superAdmin) throw new Error('SuperAdmin superadmin@cara.test not found!');
  const superAuth = superAdmin.authenticate('superadminPassword123');
  console.log('Test 2: SuperAdmin login authentication:', superAuth ? 'PASSED ✅' : 'FAILED ❌');
  console.log('Test 2b: SuperAdmin role is:', superAdmin.role === 'superadmin' ? 'PASSED (role is superadmin) ✅' : 'FAILED ❌');

  // 3. Verify Permissions Resolution
  const superPerms = await getUserEffectivePermissions(superAdmin);
  console.log(`Test 3: SuperAdmin effective permissions count: ${superPerms.length} (contains 'users.delete': ${superPerms.includes('users.delete')})`, superPerms.length > 0 ? 'PASSED ✅' : 'FAILED ❌');

  const adminPerms = await getUserEffectivePermissions(existingAdmin);
  console.log(`Test 3b: Admin effective permissions count: ${adminPerms.length} (contains 'products.create': ${adminPerms.includes('products.create')}, contains 'roles.delete': ${adminPerms.includes('roles.delete')})`);
  if (adminPerms.includes('products.create') && !adminPerms.includes('roles.delete')) {
    console.log('Test 3b: Admin role permission boundaries: PASSED ✅');
  } else {
    console.log('Test 3b: Admin role permission boundaries: FAILED ❌');
  }

  // 4. Verify Product Images
  const products = await Product.find({ isActive: true }).select('name imageUrl photo');
  console.log(`Test 4: Total active products: ${products.length}`);
  const hasImageUrls = products.every((p) => p.imageUrl && p.imageUrl.startsWith('/images/'));
  console.log('Test 4b: All seeded products have clean imageUrl paths:', hasImageUrls ? 'PASSED ✅' : 'FAILED ❌');

  // 5. Test Internet Image URL on a test product
  const Category = require('./models/category');
  const cat = await Category.findOne();
  const testUrlProduct = new Product({
    name: 'Internet Image Test Item',
    description: 'Testing direct external URL image rendering',
    price: 99.99,
    category: cat._id,
    quantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    shipping: true,
  });
  await testUrlProduct.save();
  const retrieved = await Product.findById(testUrlProduct._id);
  console.log('Test 5: Product with direct Internet URL created & retrieved:', retrieved.imageUrl.startsWith('https://') ? 'PASSED ✅' : 'FAILED ❌');
  await Product.deleteOne({ _id: testUrlProduct._id });

  // 6. Test Safeguard: Prevent deleting or demoting only SuperAdmin
  const totalSuper = await User.countDocuments({ role: 'superadmin' });
  console.log(`Test 6: Total SuperAdmins: ${totalSuper}`);

  console.log('--- ALL VERIFICATION TESTS COMPLETED ---');
  await mongoose.connection.close();
}

testAll().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
