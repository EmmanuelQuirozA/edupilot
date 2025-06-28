// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingComponent from './LoadingComponent'

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  // 1) Still checking token?  Don’t redirect yet.
  if (loading) {
    return <LoadingComponent />;
  }

  // 2) No user → kick to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3) Role‐based check (if you ever need it)
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // passed all checks → render the nested routes
  return <Outlet />;
}
