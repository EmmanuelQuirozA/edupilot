// src/routes/PaymentDetailsRouter.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/common/ProtectedRoute'
import PaymentDetails from '../pages/PaymentDetails'

export default function PaymentDetailsRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          // <ProtectedRoute allowedRoles={['SCHOOL_ADMIN']}>
            <PaymentDetails />
          // </ProtectedRoute>
        }
      />
    </Routes>
  )
}
