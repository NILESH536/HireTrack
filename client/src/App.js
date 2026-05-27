import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const CompanyDashboard = lazy(() => import('./pages/CompanyDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BrowseDrivesPage = lazy(() => import('./pages/BrowseDrivesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/student/dashboard" element={
                <ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>
              } />
              <Route path="/student/browse" element={
                <ProtectedRoute allowedRoles={['STUDENT']}><BrowseDrivesPage /></ProtectedRoute>
              } />
              <Route path="/student/profile" element={
                <ProtectedRoute allowedRoles={['STUDENT']}><ProfilePage /></ProtectedRoute>
              } />

              <Route path="/company/dashboard" element={
                <ProtectedRoute allowedRoles={['COMPANY']}><CompanyDashboard /></ProtectedRoute>
              } />

              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
              } />
            </Routes>
          </Suspense>
          <Toaster position="top-right" toastOptions={{
            style: { background: '#162033', color: '#fff', border: '1px solid rgba(59,130,246,0.2)' },
          }} />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
