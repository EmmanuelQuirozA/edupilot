import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Students from '../pages/Students';

export default function StudentsRouter() {
  return (
    <Routes>
      {/* 1) A wrapper route that applies the guard */}
      <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN','ADMIN']} />}>
        {/* 2) Nested route(s) that will render inside that guard */}
        <Route
          path="/"
          element={<Students />}
        />
      </Route>
    </Routes>
  );
}
