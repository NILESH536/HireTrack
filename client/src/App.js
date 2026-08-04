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
const CompanyWorkflowBuilder = lazy(() => import('./pages/CompanyWorkflowBuilder'));
const CompanyKanbanBoard = lazy(() => import('./pages/CompanyKanbanBoard'));
const VerificationCenter = lazy(() => import('./pages/VerificationCenter'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const AssessmentBuilder = lazy(() => import('./pages/AssessmentBuilder'));
const MockInterviewRoom = lazy(() => import('./pages/MockInterviewRoom'));
const LearningRoadmap = lazy(() => import('./pages/LearningRoadmap'));

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
              <Route path="/student/mock-interview" element={
                <ProtectedRoute allowedRoles={['STUDENT']}><MockInterviewRoom /></ProtectedRoute>
              } />
              <Route path="/student/roadmap" element={
                <ProtectedRoute allowedRoles={['STUDENT']}><LearningRoadmap /></ProtectedRoute>
              } />

              <Route path="/company/dashboard" element={
                <ProtectedRoute allowedRoles={['COMPANY']}><CompanyDashboard /></ProtectedRoute>
              } />
              <Route path="/company/workflows" element={
                <ProtectedRoute allowedRoles={['COMPANY']}><CompanyWorkflowBuilder /></ProtectedRoute>
              } />
              <Route path="/company/drive/:driveId/kanban" element={
                <ProtectedRoute allowedRoles={['COMPANY']}><CompanyKanbanBoard /></ProtectedRoute>
              } />
              <Route path="/company/assessments" element={
                <ProtectedRoute allowedRoles={['COMPANY']}><AssessmentBuilder /></ProtectedRoute>
              } />

              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/admin/verification" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><VerificationCenter /></ProtectedRoute>
              } />
              <Route path="/admin/audit" element={
                <ProtectedRoute allowedRoles={['ADMIN']}><AuditLogs /></ProtectedRoute>
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
