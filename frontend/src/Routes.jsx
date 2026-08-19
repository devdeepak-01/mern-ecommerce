import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './user/Signup';
import Signin from './user/Signin';
import Home from './core/Home';
import PrivateRoute from './auth/PrivateRoute';
import Dashboard from './user/UserDashboard';
import AdminRoute from './auth/AdminRoute';
import SuperAdminRoute from './auth/SuperAdminRoute';
import AdminDashboard from './user/AdminDashboard';
import AdminLogin from './user/AdminLogin';
import AddCategory from './admin/AddCategory';
import AddProduct from './admin/AddProduct';
import Shop from './core/Shop';
import Product from './core/Product';
import Cart from './core/Cart';
import Orders from './admin/Orders';
import Profile from './user/Profile';
import ManageProducts from './admin/ManageProducts';
import UpdateProduct from './admin/UpdateProduct';
import ManageInventory from './admin/ManageInventory';
import ManageBilling from './admin/ManageBilling';
import AdminProfile from './admin/AdminProfile';
import CategoryList from './admin/CategoryList';
import UsersList from './admin/UsersList';
import ManageRoles from './admin/ManageRoles';
import ManageSuperUsers from './admin/ManageSuperUsers';
import Invoice from './core/Invoice';
import NotFound from './core/NotFound';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/shop' element={<Shop />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />

        {/* Private Customer Routes */}
        <Route
          path='/user/dashboard'
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path='/profile/:userId'
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path='/order/invoice/:orderId'
          element={
            <PrivateRoute>
              <Invoice />
            </PrivateRoute>
          }
        />

        {/* Admin Login Route */}
        <Route path='/admin/login' element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path='/admin/dashboard'
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path='/create/category'
          element={
            <AdminRoute>
              <AddCategory />
            </AdminRoute>
          }
        />
        <Route
          path='/create/product'
          element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/orders'
          element={
            <AdminRoute>
              <Orders />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/products'
          element={
            <AdminRoute>
              <ManageProducts />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/product/update/:productId'
          element={
            <AdminRoute>
              <UpdateProduct />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/categories'
          element={
            <AdminRoute>
              <CategoryList />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/inventory'
          element={
            <AdminRoute>
              <ManageInventory />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/billing'
          element={
            <AdminRoute>
              <ManageBilling />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/profile'
          element={
            <AdminRoute>
              <AdminProfile />
            </AdminRoute>
          }
        />

        {/* Admin customers and users listings */}
        <Route
          path='/admin/customers'
          element={
            <AdminRoute>
              <UsersList />
            </AdminRoute>
          }
        />
        {/* Keep old route fallback for users path but route to admin customers */}
        <Route
          path='/admin/users'
          element={
            <AdminRoute>
              <UsersList />
            </AdminRoute>
          }
        />

        {/* SuperAdmin Governance Routes */}
        <Route
          path='/superadmin/roles'
          element={
            <SuperAdminRoute>
              <ManageRoles />
            </SuperAdminRoute>
          }
        />
        <Route
          path='/superadmin/users'
          element={
            <SuperAdminRoute>
              <ManageSuperUsers />
            </SuperAdminRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
