import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import StudDash from './StudDash'; // Import your StudDash component

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const isAuthenticated = token !== null;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, show the protected component
  return children;
};

const ProtectedRouteStudent = ({ children }) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = token !== null; // Check only for token

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Example of setting the token and role in localStorage after a successful login
const handleLogin = (response) => {
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('role', response.data.role);
  navigate('/studentdashboard');
};

export { ProtectedRoute, ProtectedRouteStudent };

<Route
  path="/studentdashboard"
  element={
    <ProtectedRouteStudent>
      <StudDash />
    </ProtectedRouteStudent>
  }
/>
