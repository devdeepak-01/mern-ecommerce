const DEFAULT_PERMISSIONS = [
  // Users module
  { key: 'users.read', name: 'View Users', module: 'Users', description: 'View user accounts and profiles' },
  { key: 'users.create', name: 'Create Users', module: 'Users', description: 'Create new user accounts' },
  { key: 'users.update', name: 'Update Users', module: 'Users', description: 'Update user profiles and status' },
  { key: 'users.delete', name: 'Delete Users', module: 'Users', description: 'Delete user accounts' },
  { key: 'users.manage_roles', name: 'Assign User Roles', module: 'Users', description: 'Change user roles and custom permissions' },

  // Products module
  { key: 'products.read', name: 'View Products', module: 'Products', description: 'View product catalog and details' },
  { key: 'products.create', name: 'Create Products', module: 'Products', description: 'Create new product listings' },
  { key: 'products.update', name: 'Update Products', module: 'Products', description: 'Modify existing product listings' },
  { key: 'products.delete', name: 'Delete Products', module: 'Products', description: 'Delete or deactivate products' },

  // Categories module
  { key: 'categories.read', name: 'View Categories', module: 'Categories', description: 'View product categories' },
  { key: 'categories.create', name: 'Create Categories', module: 'Categories', description: 'Create new categories' },
  { key: 'categories.update', name: 'Update Categories', module: 'Categories', description: 'Modify categories' },
  { key: 'categories.delete', name: 'Delete Categories', module: 'Categories', description: 'Delete categories' },

  // Orders module
  { key: 'orders.read', name: 'View Orders', module: 'Orders', description: 'View all customer orders' },
  { key: 'orders.update', name: 'Update Orders', module: 'Orders', description: 'Change order status and details' },
  { key: 'orders.delete', name: 'Delete Orders', module: 'Orders', description: 'Cancel or remove orders' },

  // Roles module
  { key: 'roles.read', name: 'View Roles', module: 'Roles', description: 'View system and custom roles' },
  { key: 'roles.create', name: 'Create Roles', module: 'Roles', description: 'Create new custom roles' },
  { key: 'roles.update', name: 'Update Roles', module: 'Roles', description: 'Modify role names and descriptions' },
  { key: 'roles.delete', name: 'Delete Roles', module: 'Roles', description: 'Delete custom roles' },

  // Permissions module
  { key: 'permissions.read', name: 'View Permissions', module: 'Permissions', description: 'View list of all permissions' },
  { key: 'permissions.create', name: 'Create Permissions', module: 'Permissions', description: 'Create custom permissions' },
  { key: 'permissions.update', name: 'Assign Permissions', module: 'Permissions', description: 'Assign permissions to roles' },
  { key: 'permissions.delete', name: 'Delete Permissions', module: 'Permissions', description: 'Remove custom permissions' },
];

const DEFAULT_ROLES = [
  {
    name: 'superadmin',
    displayName: 'Super Administrator',
    description: 'Full system access with user, role, and permission governance',
    isSystem: true,
    permissions: DEFAULT_PERMISSIONS.map((p) => p.key),
  },
  {
    name: 'admin',
    displayName: 'Store Administrator',
    description: 'Store operations including products, inventory, orders, and customer listings',
    isSystem: true,
    permissions: [
      'users.read',
      'products.read',
      'products.create',
      'products.update',
      'products.delete',
      'categories.read',
      'categories.create',
      'categories.update',
      'categories.delete',
      'orders.read',
      'orders.update',
    ],
  },
  {
    name: 'seller',
    displayName: 'Seller / Vendor',
    description: 'Seller operations for managing own catalog items, orders, and customer buyers',
    isSystem: true,
    permissions: [
      'products.read',
      'products.create',
      'products.update',
      'orders.read',
    ],
  },
  {
    name: 'customer',
    displayName: 'Customer',
    description: 'Default customer role for browsing and shopping',
    isSystem: true,
    permissions: ['products.read', 'categories.read'],
  },
];

module.exports = {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
};
