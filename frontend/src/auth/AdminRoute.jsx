import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticatedAdmin as isAuthenticated } from './index';

const AdminRoute = ({ children }) => {
  const auth = isAuthenticated();
  return auth && auth.user && ['admin', 'seller', 'superadmin'].includes(auth.user.role) ? (
    children
  ) : (
    <Navigate to='/admin/login' replace />
  );
};

export default AdminRoute;
