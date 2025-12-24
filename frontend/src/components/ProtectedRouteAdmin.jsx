import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRouteAdmin = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      // If no token/role locally, not authenticated
      if (!token || Number(role) !== 1) {
        setIsAuthenticated(false);
        return;
      }

      // Validate session with backend
      try {
        const response = await fetch('http://localhost:5000/api/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Session expired on server
          localStorage.clear();
          sessionStorage.clear();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session validation error:', error);
        localStorage.clear();
        sessionStorage.clear();
        setIsAuthenticated(false);
      }
    };

    validateSession();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRouteAdmin;
