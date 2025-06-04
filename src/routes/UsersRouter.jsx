import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Users from '../pages/Users';

export default function UsersRouter() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          // <ProtectedRoute allowedRoles={['ADMIN','SCHOOL_ADMIN','TEACHERS']}>
            <Users />
          // </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
