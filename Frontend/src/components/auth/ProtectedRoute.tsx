// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // If no token is found, redirect to the auth page
    return <Navigate to="/auth" replace />;
  }

  // If a token exists, show the protected content
  return children;
};

export default ProtectedRoute;