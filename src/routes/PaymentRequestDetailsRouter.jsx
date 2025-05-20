// src/routes/PaymentsReportsRouter.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import PaymentRequestDetailsPage from '../pages/PaymentRequestDetails'

export default function PaymentRequestDetailssRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          // <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
            <PaymentRequestDetailsPage />
          // </ProtectedRoute>
        }
      />
    </Routes>
  )
}
