import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Layouts
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { PublicLayout } from './components/layouts/PublicLayout';

import { Suspense, lazy } from 'react';

// Auth Pages
const Login = lazy(() => import('./pages/Auth/Login'));
const SignupPatient = lazy(() => import('./pages/Auth/SignupPatient'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));

// Dashboards
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));

// Shared
const Profile = lazy(() => import('./pages/Common/Profile'));

// Doctor & Patient
const MedicalRecords = lazy(() => import('./pages/Doctor/MedicalRecords'));

// Admin / SuperAdmin
const Accounts = lazy(() => import('./pages/Admin/Accounts'));
const Hospitals = lazy(() => import('./pages/Admin/Hospitals'));
const Doctors = lazy(() => import('./pages/Admin/Doctors'));

const AssignPatient = lazy(() => import('./pages/Receptionist/AssignPatient'));
const Receptionists = lazy(() => import('./pages/HospitalAdmin/Receptionists'));

// Common
const NotFound = () => <div className="flex h-full items-center justify-center text-slate-500 font-medium">404 - Page Not Found</div>;

// ============================================================================
// Protected Route Guard
// Checks authentication state and allowed roles for the component.
// ============================================================================
const RequireAuth = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Strict role check if roles are provided
  if (allowedRoles && !allowedRoles.includes(user?.role?.toUpperCase())) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Render children inside the DashboardLayout for all protected pages
  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>}>
          <Routes>
            {/* ======================= Public Routes ======================= */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/signup/patient" element={<PublicLayout><SignupPatient /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
            <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

            {/* ====================== Protected Routes ===================== */}
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

            {/* Clinical Operations */}
            <Route path="/records" element={
              <RequireAuth allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ADMIN_HOSPITAL', 'DOCTOR', 'PATIENT']}>
                <MedicalRecords />
              </RequireAuth>
            } />

            {/* Admin Hospital & Receptionist */}
            <Route path="/patients" element={
              <RequireAuth allowedRoles={['ADMIN_HOSPITAL', 'RECEPTIONIST']}>
                <AssignPatient />
              </RequireAuth>
            } />
            
            <Route path="/receptionists" element={
              <RequireAuth allowedRoles={['ADMIN_HOSPITAL']}>
                <Receptionists />
              </RequireAuth>
            } />

            {/* SuperAdmin & Admin */}
            <Route path="/admins" element={
              <RequireAuth allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <Accounts />
              </RequireAuth>
            } />
            
            <Route path="/doctors" element={
              <RequireAuth allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <Doctors />
              </RequireAuth>
            } />
            
            <Route path="/hospitals" element={
              <RequireAuth allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                <Hospitals />
              </RequireAuth>
            } />

            {/* Catch-all 404 */}
            <Route path="*" element={<RequireAuth><NotFound /></RequireAuth>} />
          </Routes>
        </Suspense>
    </BrowserRouter>
  );
}

export default App;
