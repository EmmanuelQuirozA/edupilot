// src/App.js

import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import useAuth from './hooks/useAuth';

import './styles/custom.css';

// Public pages
import LoginPage       from './pages/Login'

// Common components
import NotFound         from './components/common/NotFound'
// import Unauthorized     from './components/common/Unauthorized'
import ProtectedRoute   from './components/common/ProtectedRoute'

// // Layout wrapper (with Header, Sidebar, Footer inside)
// import Layout          from './components/Layout'

// // “Router” bundles
import ProtectedFilePage from './pages/ProtectedFilePage';
import DashboardRouter from './routes/DashboardRouter'
// import UsersRouter     from './routes/UsersRouter'
import ReportsRouter   from './routes/ReportsRouter'
// import SchoolsRouter   from './routes/SchoolsRouter'
// import TeachersRouter   from './routes/TeachersRouter'
// import StudentsRouter   from './routes/StudentsRouter'
// import CoffeeRouter  from './routes/CoffeeRouter'
import PaymentsReportsRouter  from './routes/PaymentsReportsRouter'
import PaymentDetailsRouter  from './routes/PaymentDetailsRouter'
// import ClassesRouter  from './routes/ClassesRouter'
// import StudentDetailsRouter  from './routes/StudentDetailsRouter'
import PaymentRequestDetailsRouter  from './routes/PaymentRequestDetailsRouter'
// import SettingsRouter  from './routes/SettingsRouter'

// import PrintDemo from './components/PrintDemo';

function AppRoutes() {
  const user = useAuth();
  const home = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
      case 'SCHOOL_ADMIN':
      case 'FINANCE':
      case 'TEACHER':
      case 'STUDENT':
        return '/dashboard'
      default:
        return '/unauthorized'
    }
  };

  
  return (
    <Routes>

      {/* 
        Dashboard     --| School Admin | Teachers | Students | Finance | Admin |           
        Settings      --| School Admin | Teachers | Students | Finance | Admin |

        Finance       --| School Admin |          |          | Finance |       |  

        Schools       --| School Admin |          |          |         | Admin |           
        Users         --| School Admin |          |          |         | Admin |    

        Teachers      --| School Admin |          |          |         |       | 

        Students      --| School Admin | Teachers |          | Finance |       |  

        Parents       --| School Admin | Teachers |          |         |       |   

        Subjects      --| School Admin | Teachers | Students |         |       |      
        Classes       --| School Admin | Teachers | Students |         |       |      
        Lessons       --| School Admin | Teachers | Students |         |       |      
        Examns        --| School Admin | Teachers | Students |         |       |      
        Assignments   --| School Admin | Teachers | Students |         |       |      
        Results       --| School Admin | Teachers | Students |         |       |      
        Attendance    --| School Admin | Teachers | Students |         |       |      
        Events        --| School Admin | Teachers | Students |         |       |      
        Messages      --| School Admin | Teachers | Students |         |       |      
        Announcements --| School Admin | Teachers | Students |         |       |      

        Kitchen       --| School Admin |          |          |         | Admin | Kitchen
      */}


      {/* Public */}
      <Route
        path="/login"
        element={ user
          ? <Navigate to={home()} replace />
          : <LoginPage />
        }
      />

      

      {/* All secured pages */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SCHOOL_ADMIN', 'FINANCE']} />}>
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/paymentreports" element={<PaymentsReportsRouter />} />
        <Route path="/paymentreports/paymentdetails/:payment_id/" element={<PaymentDetailsRouter />} />
        {/* <Route path="/studentdetails/:studentId/*" element={<StudentDetailsRouter />} /> */}
        <Route path="/paymentreports/paymentrequestdetails/:payment_request_id/" element={<PaymentRequestDetailsRouter />} />
        <Route path="/protectedfiles/:filename" element={<ProtectedFilePage />} />

        {/* <Route path="/schools/*" element={<SchoolsRouter />} /> */}
        {/* <Route path="/classes/*" element={<ClassesRouter />} /> */}
        {/* <Route path="/users/*" element={<UsersRouter />} /> */}
        {/* <Route path="/teachers/*" element={<TeachersRouter />} /> */}
        {/* <Route path="/students/*" element={<StudentsRouter />} /> */}

      </Route>
      
      {/* Fallbacks */}
      {/* <Route path="unauthorized" element={<Unauthorized />} /> */}
      <Route path="*"            element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}
