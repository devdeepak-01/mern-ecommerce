const User = require('../models/user');
const Role = require('../models/role');
const Permission = require('../models/permission');
const { DEFAULT_PERMISSIONS, DEFAULT_ROLES } = require('../helpers/permissions');
const { errorHandler } = require('../helpers/dbErrorHandler');

// ========================
// ROLES MANAGEMENT (SuperAdmin Only)
// ========================

exports.listRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ isSystem: -1, name: 1 });
    res.json(roles);
  } catch (error) {
    return res.status(400).json({ error: 'Could not fetch roles' });
  }
};

exports.createRole = async (req, res) => {
  const { name, displayName, description, permissions } = req.body;
  const caller = req.profile;

  if (!caller || caller.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: Only SuperAdmin can create custom roles.' });
  }

  if (!name || !displayName) {
    return res.status(400).json({ error: 'Role name and display name are required' });
  }

  const cleanName = name.trim().toLowerCase();
  if (['superadmin', 'admin', 'seller', 'customer'].includes(cleanName)) {
    return res.status(400).json({ error: 'System role names cannot be reused' });
  }

  try {
    const existing = await Role.findOne({ name: cleanName });
    if (existing) {
      return res.status(400).json({ error: `Role '${cleanName}' already exists` });
    }

    const newRole = new Role({
      name: cleanName,
      displayName: displayName.trim(),
      description: description || '',
      permissions: Array.isArray(permissions) ? permissions : [],
      isSystem: false,
    });

    const saved = await newRole.save();
    res.json(saved);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.updateRole = async (req, res) => {
  const { roleId } = req.params;
  const { displayName, description, permissions } = req.body;
  const caller = req.profile;

  if (!caller || caller.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: Only SuperAdmin can modify roles.' });
  }

  try {
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (displayName) role.displayName = displayName.trim();
    if (description !== undefined) role.description = description.trim();
    if (Array.isArray(permissions)) {
      if (role.name === 'superadmin') {
        const allPermKeys = DEFAULT_PERMISSIONS.map((p) => p.key);
        role.permissions = allPermKeys;
      } else {
        role.permissions = permissions;
      }
    }

    const updated = await role.save();
    res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.deleteRole = async (req, res) => {
  const { roleId } = req.params;
  const caller = req.profile;

  if (!caller || caller.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: Only SuperAdmin can delete roles.' });
  }

  try {
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.isSystem || ['superadmin', 'admin', 'seller', 'customer'].includes(role.name)) {
      return res.status(400).json({ error: 'System roles cannot be deleted' });
    }

    const assignedUsersCount = await User.countDocuments({ role: role.name });
    if (assignedUsersCount > 0) {
      return res.status(400).json({
        error: `Cannot delete role. ${assignedUsersCount} user(s) are currently assigned this role. Reassign their roles first.`,
      });
    }

    await Role.deleteOne({ _id: roleId });
    res.json({ message: `Role '${role.displayName}' deleted successfully` });
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

// ========================
// PERMISSIONS MANAGEMENT (SuperAdmin Only)
// ========================

exports.listPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ module: 1, key: 1 });
    res.json(permissions);
  } catch (error) {
    return res.status(400).json({ error: 'Could not fetch permissions' });
  }
};

exports.updateRolePermissions = async (req, res) => {
  const { roleId } = req.params;
  const { permissions } = req.body;
  const caller = req.profile;

  if (!caller || caller.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: Only SuperAdmin can assign permissions.' });
  }

  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: 'Permissions must be an array of permission keys' });
  }

  try {
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (role.name === 'superadmin') {
      return res.status(400).json({ error: 'SuperAdmin retains all permissions unconditionally' });
    }

    role.permissions = permissions;
    const updated = await role.save();
    res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

// ========================
// USER GOVERNANCE & SAFEGUARDS
// ========================

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
    return res.status(400).json({ error: 'Could not retrieve users' });
  }
};

exports.createUserByAdmin = async (req, res) => {
  const { name, email, password, role, permissions } = req.body;
  const caller = req.profile;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const assignedRole = (role || 'customer').trim().toLowerCase();

  // CORE RULE: Only SuperAdmin can assign non-customer roles
  if (assignedRole !== 'customer' && (!caller || caller.role !== 'superadmin')) {
    return res.status(403).json({
      error: 'Forbidden: Only SuperAdmin can assign Admin, Seller, or SuperAdmin roles.',
    });
  }

  // Validate that the role exists in Role collection or system roles
  const validRole = await Role.findOne({ name: assignedRole });
  if (!validRole && !['superadmin', 'admin', 'seller', 'customer'].includes(assignedRole)) {
    return res.status(400).json({ error: `Invalid role: '${assignedRole}'` });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'A user with that email already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role: assignedRole,
      permissions: Array.isArray(permissions) ? permissions : [],
      isActive: true,
    });

    const saved = await user.save();
    saved.hashed_password = undefined;
    saved.salt = undefined;
    res.json(saved);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.updateUserDetails = async (req, res) => {
  const { targetUserId } = req.params;
  const { name, email, role, permissions, isActive } = req.body;
  const callerUser = req.profile;

  try {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // SAFEGUARD: Normal Admin cannot modify a SuperAdmin in any way
    if (targetUser.role === 'superadmin' && (!callerUser || callerUser.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden: Access denied. You cannot modify a SuperAdmin account.' });
    }

    // CORE RULE: Only SuperAdmin can change roles or assign permissions
    if (role && role.trim().toLowerCase() !== targetUser.role && (!callerUser || callerUser.role !== 'superadmin')) {
      return res.status(403).json({
        error: 'Forbidden: Only SuperAdmin can assign or modify user roles.',
      });
    }

    if (Array.isArray(permissions) && (!callerUser || callerUser.role !== 'superadmin')) {
      return res.status(403).json({
        error: 'Forbidden: Only SuperAdmin can modify user permissions.',
      });
    }

    // SAFEGUARD: If modifying role/active status of a SuperAdmin, ensure at least one active SuperAdmin remains
    if (targetUser.role === 'superadmin') {
      if ((role && role !== 'superadmin') || isActive === false) {
        const totalSuperAdmins = await User.countDocuments({ role: 'superadmin', isActive: true });
        if (totalSuperAdmins <= 1) {
          return res.status(400).json({
            error: 'Safety restriction: Cannot demote or deactivate the only active SuperAdmin account.',
          });
        }
      }
    }

    if (name) targetUser.name = name.trim();
    if (email) targetUser.email = email.trim();
    if (typeof isActive === 'boolean') targetUser.isActive = isActive;
    if (role && callerUser && callerUser.role === 'superadmin') {
      targetUser.role = role.trim().toLowerCase();
    }
    if (Array.isArray(permissions) && callerUser && callerUser.role === 'superadmin') {
      targetUser.permissions = permissions;
    }

    const updated = await targetUser.save();
    updated.hashed_password = undefined;
    updated.salt = undefined;
    res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
  const { targetUserId } = req.params;
  const callerUser = req.profile;

  try {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // SAFEGUARD: Normal Admin cannot delete a SuperAdmin
    if (targetUser.role === 'superadmin' && (!callerUser || callerUser.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Forbidden: Access denied. You cannot delete a SuperAdmin account.' });
    }

    // SAFEGUARD: Cannot delete the last SuperAdmin
    if (targetUser.role === 'superadmin') {
      const totalSuperAdmins = await User.countDocuments({ role: 'superadmin' });
      if (totalSuperAdmins <= 1) {
        return res.status(400).json({
          error: 'Safety restriction: Cannot delete the only SuperAdmin account in the system.',
        });
      }
    }

    // SAFEGUARD: Cannot delete oneself
    if (targetUser._id.toString() === callerUser._id.toString()) {
      return res.status(400).json({ error: 'Safety precaution: You cannot delete your own active account.' });
    }

    await User.deleteOne({ _id: targetUserId });
    res.json({ message: `User '${targetUser.name}' (${targetUser.email}) was deleted successfully.` });
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};
