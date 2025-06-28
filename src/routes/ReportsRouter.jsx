// src/routes/ReportsRouter.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import ReportPage from '../pages/Reports';

export default function ReportsRouter() {
  return (
    <Routes>
      {/* 1) A wrapper route that applies the guard */}
      <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN','ADMIN']} />}>
        {/* 2) Nested route(s) that will render inside that guard */}
        <Route
          path="/"
          element={<ReportPage />}
        />
      </Route>
    </Routes>
  );
}