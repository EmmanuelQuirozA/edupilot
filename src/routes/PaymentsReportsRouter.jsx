// src/routes/PaymentsReportsRouter.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import PaymentsReportPage from '../pages/PaymentsReports'

export default function PaymentsReportsRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          // <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
            <PaymentsReportPage />
          // </ProtectedRoute>
        }
      />
    </Routes>
  )
}
