const User = require('../models/user');
const Role = require('../models/role');
const { DEFAULT_PERMISSIONS } = require('../helpers/permissions');
const jwt = require('jsonwebtoken'); // to generate signed token
const { expressjwt } = require('express-jwt'); // for auth check
const { errorHandler } = require('../helpers/dbErrorHandler');

require('dotenv').config();

// Helper to resolve all effective permissions for a user
const getUserEffectivePermissions = async (user) => {
  if (!user) return [];
  if (user.role === 'superadmin') {
    return DEFAULT_PERMISSIONS.map((p) => p.key);
  }

  const roleDoc = await Role.findOne({ name: user.role });
  const rolePermissions = roleDoc && Array.isArray(roleDoc.permissions) ? roleDoc.permissions : [];
  const customPermissions = Array.isArray(user.permissions) ? user.permissions : [];

  // Merge unique
  return Array.from(new Set([...rolePermissions, ...customPermissions]));
};

exports.signup = async (req, res) => {
  const user = new User({ ...req.body, role: 'customer', isActive: true });
  try {
    const data = await user.save();
    if (!data) {
      return res.status(400).json({
        error: 'Signup failed',
      });
    }

    user.salt = undefined;
    user.hashed_password = undefined;
    res.json({
      user,
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user based on email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "User with that email doesn't exist. Please signup.",
      });
    }

    // Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({
        error: 'Your account has been deactivated. Please contact support.',
      });
    }

    // If user found, check if the password matches
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password didn't match",
      });
    }

    // Generate a signed token with user ID and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Persist the token as 't' in cookie with expiry date
    res.cookie('t', token, { expire: new Date() + 9999 });

    // Fetch user permissions
    const permissions = await getUserEffectivePermissions(user);

    // Return the token and user details to the frontend client
    const { _id, name, email: userEmail, role, isActive } = user;
    return res.json({
      token,
      user: { _id, email: userEmail, name, role, isActive: isActive !== false, permissions },
    });
  } catch (err) {
    return res.status(400).json({
      error: 'Signin failed. Please try again later.',
    });
  }
};

exports.signout = (req, res) => {
  res.clearCookie('t');
  res.json({ message: 'Signout success' });
};

exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  userProperty: 'auth',
});

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id.toString() === req.auth._id.toString();
  if (!user) {
    return res.status(403).json({
      error: 'Access denied',
    });
  }
  next();
};

// Allows Admin, Seller, and SuperAdmin (and custom roles with store management access)
exports.isAdmin = (req, res, next) => {
  if (!req.profile || (!['admin', 'seller', 'superadmin'].includes(req.profile.role))) {
    return res.status(403).json({
      error: 'Admin resource! Access denied',
    });
  }
  next();
};

// Strictly allows SuperAdmin
exports.isSuperAdmin = (req, res, next) => {
  if (!req.profile || req.profile.role !== 'superadmin') {
    return res.status(403).json({
      error: 'Super Admin resource! Access denied',
    });
  }
  next();
};

// Dynamic permission-based authorization middleware factory
exports.hasPermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      if (!req.profile) {
        return res.status(403).json({ error: 'User profile not found. Access denied.' });
      }

      if (req.profile.role === 'superadmin') {
        return next();
      }

      const permissions = await getUserEffectivePermissions(req.profile);
      if (permissions.includes('*') || permissions.includes(permissionKey)) {
        return next();
      }

      return res.status(403).json({
        error: `Forbidden! Insufficient permissions (Requires: ${permissionKey})`,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Permission verification failed.' });
    }
  };
};

exports.getUserEffectivePermissions = getUserEffectivePermissions;
