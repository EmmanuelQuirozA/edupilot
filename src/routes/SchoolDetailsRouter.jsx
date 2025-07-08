import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import SchoolDetails from '../pages/SchoolDetails';

export default function StudentDetailsRouter() {
  return (
    <Routes>
      {/* 1) A wrapper route that applies the guard */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SCHOOL_ADMIN']} />}>
        {/* 2) Nested route(s) that will render inside that guard */}
        <Route
          path="/"
          element={<SchoolDetails />}
        />
      </Route>
    </Routes>
  );
}
