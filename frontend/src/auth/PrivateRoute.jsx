import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAuthenticatedAdmin } from './index';

const PrivateRoute = ({ children }) => {
  const auth = isAuthenticated() || isAuthenticatedAdmin();
  return auth ? children : <Navigate to='/signin' replace />;
};

export default PrivateRoute;
