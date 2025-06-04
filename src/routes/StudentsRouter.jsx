import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Students from '../pages/Students';

export default function StudentsRouter() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          // <ProtectedRoute allowedRoles={['ADMIN','SCHOOL_ADMIN','TEACHERS']}>
            <Students />
          // </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
