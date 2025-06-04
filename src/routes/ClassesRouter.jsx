// src/routes/ClassesRouter.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import Classes from '../pages/Classes'

export default function ClassesRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          // <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
            <Classes />
          // </ProtectedRoute>
        }
      />
    </Routes>
  )
}
