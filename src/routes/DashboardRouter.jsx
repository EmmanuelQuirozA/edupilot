import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } 							 from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminDashboard   from '../pages/admin/Dashboard';
import SchoolAdminDashboard from '../pages/school_admin/Dashboard';
import FinanceDashboard from '../pages/finance/Dashboard';
import StudentDashboard from '../pages/student/Dashboard';

export default function DashboardRouter() {
  function RoleBasedDashboard() {
    const { role } = useAuth();
    switch ((role ).toUpperCase()) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'SCHOOL_ADMIN':
        return <SchoolAdminDashboard />;
      case 'FINANCE':
        return <FinanceDashboard />;
      case 'STUDENT':
        return <StudentDashboard />;
      default:
        // Should never happen if you guard correctly, but just in case:
        return <Navigate to="/unauthorized" replace />;
    }
  }
  return (
    <Routes>
      {/* 1) A wrapper route that applies the guard */}
      <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN','ADMIN', 'FINANCE', 'STUDENT']} />}>
        {/* 2) Nested route(s) that will render inside that guard */}
        <Route
          path="/"
          element={<RoleBasedDashboard />}
        />
      </Route>
    </Routes>
  );
}
