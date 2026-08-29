const express = require('express');
const router = express.Router();

const { requireSignin, isAuth, isAdmin, isSuperAdmin, hasPermission } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const {
  dashboardStats,
  listAllUsers,
  updateUserRole,
  listSellerCustomers,
} = require('../controllers/admin');

const {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  listPermissions,
  updateRolePermissions,
  createUserByAdmin,
  updateUserDetails,
  deleteUserByAdmin,
} = require('../controllers/rbac');

// Admin Dashboard stats
router.get('/admin/dashboard-stats/:userId', requireSignin, isAuth, isAdmin, dashboardStats);

// Seller customers endpoint (restricted to products owned by seller)
router.get('/seller/customers/:userId', requireSignin, isAuth, listSellerCustomers);

// ========================
// USER MANAGEMENT
// ========================
// List all users (Admin & SuperAdmin)

router.get('/superadmin/users/:userId', requireSignin, isAuth, isAdmin, listAllUsers);
router.get('/users/:userId', requireSignin, isAuth, isAdmin, listAllUsers);

// Create user (SuperAdmin)
router.post('/superadmin/users/:userId', requireSignin, isAuth, isSuperAdmin, createUserByAdmin);

// Update full user details including role/permissions/status (SuperAdmin)
router.put('/superadmin/users/:targetUserId/:userId', requireSignin, isAuth, isSuperAdmin, updateUserDetails);

// Delete user (SuperAdmin)
router.delete('/superadmin/users/:targetUserId/:userId', requireSignin, isAuth, isSuperAdmin, deleteUserByAdmin);

// Legacy role update route (with safeguards)
router.put('/superadmin/user/role/:targetUserId/:userId', requireSignin, isAuth, isAdmin, updateUserRole);

// ========================
// ROLE MANAGEMENT
// ========================

router.get('/superadmin/roles/:userId', requireSignin, isAuth, isSuperAdmin, listRoles);
router.post('/superadmin/roles/:userId', requireSignin, isAuth, isSuperAdmin, createRole);
router.put('/superadmin/roles/:roleId/:userId', requireSignin, isAuth, isSuperAdmin, updateRole);
router.delete('/superadmin/roles/:roleId/:userId', requireSignin, isAuth, isSuperAdmin, deleteRole);

// ========================
// PERMISSION MANAGEMENT
// ========================

router.get('/superadmin/permissions/:userId', requireSignin, isAuth, isSuperAdmin, listPermissions);
router.put('/superadmin/roles/:roleId/permissions/:userId', requireSignin, isAuth, isSuperAdmin, updateRolePermissions);

router.param('userId', userById);

module.exports = router;
