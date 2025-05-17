// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const user = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is non-empty, ensure user.role is in it
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
