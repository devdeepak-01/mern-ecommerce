# System Seeded Credentials & Account Directory

This document contains all seeded user accounts, roles, access permissions, test credentials, and associated product catalog assignments for the **Cara** e-commerce platform.

---

## 1. Administrative & Privileged Accounts

### 👑 SuperAdmin Account (Highest Authority)
* **Name**: Global SuperAdmin
* **Email**: `superadmin@cara.test`
* **Password**: `superadminPassword123`
* **Role**: `superadmin`
* **Login URL**: `http://localhost:5173/admin/login`
* **Access Scope**:
  - Full store management (Dashboard, Products, Orders, Inventory, Billing)
  - **User Governance & Role Assignment** (`/superadmin/users`): Only SuperAdmin can promote/demote users between Customer, Seller, Admin, and SuperAdmin.
  - **Roles & Granular RBAC Permissions** (`/superadmin/roles`): Create/edit system and custom roles with 24 modular permissions.

---

### 🛡️ Store Administrator Accounts (Preserved Admins)
* **Admin 1**:
  - **Name**: Seller Admin 1
  - **Email**: `admin1@cara.test`
  - **Password**: `adminPassword123`
  - **Role**: `admin`
  - **Login URL**: `http://localhost:5173/admin/login`
* **Admin 2**:
  - **Name**: Seller Admin 2
  - **Email**: `admin2@cara.test`
  - **Password**: `adminPassword123`
  - **Role**: `admin`
  - **Login URL**: `http://localhost:5173/admin/login`
* **Admin 3**:
  - **Name**: Seller Admin 3
  - **Email**: `admin3@cara.test`
  - **Password**: `adminPassword123`
  - **Role**: `admin`
  - **Login URL**: `http://localhost:5173/admin/login`
* **Admin Access Scope**:
  - Store operations: Products (`/admin/products`), Categories, Inventory (`/admin/inventory`), Orders (`/admin/orders`), Customers list (`/admin/customers`), Billing stats.
  - **Restrictions**: Cannot assign or modify roles, cannot delete/modify SuperAdmins, cannot see SuperAdmin in user listings.

---

## 2. Seller Accounts (Vendor Management)

### 🏷️ TechMart Seller
* **Name**: TechMart Seller
* **Email**: `seller1@cara.test`
* **Password**: `sellerPassword123`
* **Role**: `seller`
* **Login URL**: `http://localhost:5173/admin/login`
* **Assigned Catalog**:
  - Electronics (Sony 4K Smart LED TV, JBL Bluetooth Speaker, Philips Air Purifier)
  - Mobiles (Samsung Galaxy A55, OnePlus Nord, Redmi Note Series)
  - Laptops (HP Pavilion, Lenovo IdeaPad, ASUS Vivobook)
  - Headphones (Sony Wireless Headphones, JBL Tune, boAt Wireless Headphones)
  - Accessories (Laptop Backpack, USB-C Hub)
* **Customer Visibility**:
  - Only sees customers who purchased TechMart products (e.g. `Customer One`).
  - Does **NOT** see customers from other sellers.

### 👗 FashionHub Seller
* **Name**: FashionHub Seller
* **Email**: `seller2@cara.test`
* **Password**: `sellerPassword123`
* **Role**: `seller`
* **Login URL**: `http://localhost:5173/admin/login`
* **Assigned Catalog**:
  - Men's Fashion (Casual Cotton Shirt, Denim Jacket, Casual T-Shirt)
  - Women's Fashion (Women's Kurti, Casual Dress, Handbag)
  - Footwear (Running Shoes, Casual Sneakers, Walking Shoes)
  - Home & Kitchen (Electric Kettle, Mixer Grinder, Non-Stick Cookware Set)
  - Beauty (Face Care Kit, Hair Dryer)
  - Books (Programming Fundamentals, Computer Networks)
* **Customer Visibility**:
  - Only sees customers who purchased FashionHub products (e.g. `Customer Two`).

---

## 3. Customer Accounts (Shoppers)

### 🛒 Customer One
* **Name**: Customer One
* **Email**: `customer1@cara.test`
* **Password**: `customerPassword123`
* **Role**: `customer`
* **Login URL**: `http://localhost:5173/signin`
* **Order History**: Has purchased TechMart product (Sony 4K Smart LED TV).

### 🛒 Customer Two
* **Name**: Customer Two
* **Email**: `customer2@cara.test`
* **Password**: `customerPassword123`
* **Role**: `customer`
* **Login URL**: `http://localhost:5173/signin`
* **Order History**: Has purchased FashionHub product (Casual Cotton Shirt).

### 🛒 Customer Three
* **Name**: Customer Three
* **Email**: `customer3@cara.test`
* **Password**: `customerPassword123`
* **Role**: `customer`
* **Login URL**: `http://localhost:5173/signin`

---

## 4. Environment Variables Reference

Located in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-ecommerce
JWT_SECRET=8f5b8c9d2a4e1f7a0b3c6d9e8f5a2b1c4d7e0f3a6b9c2d5e8f1a4b7c0d3e6f9a

# SuperAdmin Default Configuration
SUPERADMIN_NAME=Global SuperAdmin
SUPERADMIN_EMAIL=superadmin@cara.test
SUPERADMIN_PASSWORD=superadminPassword123

# Braintree sandbox credentials
BRAINTREE_MERCHANT_ID=your_merchant_id
BRAINTREE_PUBLIC_KEY=your_public_key
BRAINTREE_PRIVATE_KEY=your_private_key
```

---

## 5. Summary Matrix of Roles & Permissions

| Feature / Capability | SuperAdmin | Admin | Seller | Customer |
| :--- | :---: | :---: | :---: | :---: |
| Storefront & Shopping | ✅ | ✅ | ✅ | ✅ |
| Own Profile & Orders | ✅ | ✅ | ✅ | ✅ |
| Store Operations (Orders/Inventory) | ✅ | ✅ | Own items | ❌ |
| Create / Edit Products | ✅ | ✅ | Own items | ❌ |
| View Platform Customers | ✅ | ✅ (Excl. SuperAdmin) | Own buyers only | ❌ |
| Assign Roles (`Customer`, `Seller`, `Admin`) | ✅ | ❌ (403 Forbidden) | ❌ | ❌ |
| Manage Roles & Permissions | ✅ | ❌ | ❌ | ❌ |
| Modify / Delete SuperAdmins | ✅ (If > 1 active) | ❌ (403 Forbidden) | ❌ | ❌ |
