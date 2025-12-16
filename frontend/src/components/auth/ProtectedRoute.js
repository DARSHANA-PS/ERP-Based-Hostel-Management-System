// frontend/src/components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole, mustHaveYear = false }) => {
  const authContext = useAuth(); 

  if (!authContext) {
    console.error('ProtectedRoute: AuthContext is null. Component is not wrapped by AuthProvider.');
    return <div>Error: Authentication context not available.</div>;
  }

  const { user, isAuthenticated, loading: authGlobalLoading } = authContext;

  if (authGlobalLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/role-selection" replace />;
  }

  // Check role
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/role-selection" replace />; 
  }

  // NEW: Specific logic for students and year selection
  if (user?.role === 'student') {
    if (mustHaveYear && !user.year) {
      // If student is trying to access a dashboard route but hasn't selected year,
      // redirect them to the year selection page.
      return <Navigate to="/student/select-year" replace />;
    }
    if (!mustHaveYear && user.year) {
      // If student has a year and is trying to access the year selection page,
      // redirect them to the dashboard home.
      return <Navigate to="/student/home" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
