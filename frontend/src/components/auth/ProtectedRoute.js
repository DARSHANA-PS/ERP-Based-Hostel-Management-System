import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to={`/login/${role}`} replace />;
  }
  
  // Check if user role matches required role
  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
