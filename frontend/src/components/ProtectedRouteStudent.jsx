import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRouteStudent = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isAuthenticated = token && Number(role) === 0;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRouteStudent;
