import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticatedAdmin as isAuthenticated } from './index';

const SuperAdminRoute = ({ children }) => {
  const auth = isAuthenticated();
  return auth && auth.user && auth.user.role === 'superadmin' ? (
    children
  ) : (
    <Navigate to="/admin/dashboard" replace />
  );
};

export default SuperAdminRoute;
