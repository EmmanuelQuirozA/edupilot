import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Schools from '../pages/Schools';

export default function StudentDetailsRouter() {
  return (
    <Routes>
      {/* 1) A wrapper route that applies the guard */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SCHOOL_ADMIN', 'FINANCE', 'STUDENT']} />}>
        {/* 2) Nested route(s) that will render inside that guard */}
        <Route
          path="/"
          element={<Schools />}
        />
      </Route>
    </Routes>
  );
}
