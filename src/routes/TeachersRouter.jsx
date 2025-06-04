// src/routes/TeachersRouter.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import Teachers from '../pages/Teachers'

export default function TeachersRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          // <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
            <Teachers />
          // </ProtectedRoute>
        }
      />
    </Routes>
  )
}
