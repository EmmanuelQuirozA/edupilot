import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Dashboard from '../pages/Dashboard';

export default function DashboardRouter() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Dashboard />
        } 
      />
      <Route 
        path="list" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN','SCHOOL_ADMIN','TEACHERS']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
