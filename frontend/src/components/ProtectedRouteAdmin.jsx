import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRouteAdmin = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isAuthenticated = token && Number(role) === 1;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRouteAdmin;
