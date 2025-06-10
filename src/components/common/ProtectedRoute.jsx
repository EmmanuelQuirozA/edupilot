// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const user = useAuth();

  if (!user || !user.role) {
    // not logged in
    return <Navigate to="/login" replace />;
  }

  const role = user.role.toUpperCase();
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // forbidden
    return <Navigate to="/unauthorized" replace />;
  }

  // passed all checks → render the nested routes
  return <Outlet />;
}
