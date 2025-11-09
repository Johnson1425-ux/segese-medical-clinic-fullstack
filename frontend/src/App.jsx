import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Components
import Sidebar from './components/Sidebar.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';
import ErrorFallback from './components/common/ErrorFallback.jsx';
import UnauthorizedPage from './components/common/UnauthorizedPage.jsx';

// Auth Components
import LoginForm from './components/auth/LoginForm.jsx';
import RegisterForm from './components/auth/RegisterForm.jsx';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm.jsx';
import ResetPasswordForm from './components/auth/ResetPasswordForm.jsx';
import VerifyEmail from './components/auth/VerifyEmail.jsx';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Patients from './pages/Patients.jsx';
import PatientSearch from './pages/PatientSearch.jsx';
import PatientForm from './pages/PatientForm.jsx';
import Doctors from './pages/Doctors.jsx';
import DoctorSchedule from './pages/DoctorSchedule.jsx';
import DoctorQueue from './pages/DoctorQueue.jsx';
import Appointments from './pages/Appointments.jsx';
import AppointmentForm from './pages/AppointmentForm.jsx';
import Visits from './pages/Visits.jsx';
import VisitForm from './pages/VisitForm.jsx';
import VisitDetail from './pages/VisitDetail.jsx';
import Users from './pages/Users.jsx';
import UserForm from './pages/UserForm.jsx';
import Profile from './components/profile/Profile.jsx';
import Settings from './components/settings/Settings.jsx';
import NotFound from './components/common/NotFound.jsx';
import BillingDashboard from './pages/BillingDashboard.jsx';
import Services from './pages/Services.jsx';
import ServiceForm from './pages/ServiceForm.jsx';
import Invoices from './pages/Invoices.jsx';
import InvoiceDetail from './pages/InvoiceDetail.jsx';
import InvoiceForm from './pages/InvoiceForm.jsx';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermissions = [], requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, hasAnyPermission, hasAnyRole } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check roles if required
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Layout Component
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return children;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

// Main App Component
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* User Management Routes */}
          <Route path="/users" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/users/new" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <UserForm />
            </ProtectedRoute>
          } />
          <Route path="/users/:id/edit" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <UserForm />
            </ProtectedRoute>
          } />

          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />
          } />
          <Route path="/forgot-password" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordForm />
          } />
          <Route path="/reset-password/:token" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPasswordForm />
          } />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Patient Routes */}
          <Route path="/patients" element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <Patients />
            </ProtectedRoute>
          } />
          <Route path="/patients/search" element={
            <ProtectedRoute requiredRoles={['admin', 'receptionist']}>
              <PatientSearch />
            </ProtectedRoute>
          } />
          <Route path="/patients/new" element={
            <ProtectedRoute requiredPermissions={['write:patients']}>
              <PatientForm />
            </ProtectedRoute>
          } />
          <Route path="/patients/:id/edit" element={
            <ProtectedRoute requiredPermissions={['write:patients']}>
              <PatientForm />
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctors" element={
            <ProtectedRoute requiredPermissions={['read:doctors']}>
              <Doctors />
            </ProtectedRoute>
          } />
          {/* 2. Add the new independent route for the doctor's queue */}
          <Route path="/doctors/my-queue" element={
            <ProtectedRoute roles={['doctor']}>
              <DoctorQueue />
            </ProtectedRoute>
          } />
          <Route path="/doctors/schedule/:id" element={
            <ProtectedRoute requiredPermissions={['write:doctors']}>
              <DoctorSchedule />
            </ProtectedRoute>
          } />

          {/* Appointment Routes */}
          <Route path="/appointments" element={
            <ProtectedRoute requiredPermissions={['read:appointments']}>
              <Appointments />
            </ProtectedRoute>
          } />
          <Route path="/appointments/new" element={
            <ProtectedRoute requiredPermissions={['write:appointments']}>
              <AppointmentForm />
            </ProtectedRoute>
          } />
          <Route path="/appointments/:id/edit" element={
            <ProtectedRoute requiredPermissions={['write:appointments']}>
              <AppointmentForm />
            </ProtectedRoute>
          } />

          {/* Visit Routes */}
          <Route path="/visits" element={
            <ProtectedRoute requiredPermissions={['read:visits', 'view:visits']}>
              <Visits />
            </ProtectedRoute>
          } />
          <Route path="/visits/new" element={
            <ProtectedRoute requiredPermissions={['write:visits', 'start:visits']}>
              <VisitForm />
            </ProtectedRoute>
          } />
          <Route path="/visits/:id" element={
            <ProtectedRoute requiredPermissions={['read:visits']}>
              <VisitDetail />
            </ProtectedRoute>
          } />

          {/* Add this new route for the billing dashboard */}
          <Route path="/billing" element={
            <ProtectedRoute roles={['admin', 'receptionist']}>
              <BillingDashboard />
            </ProtectedRoute>
          } />
          <Route path="/billing/invoices" element={
            <ProtectedRoute roles={['admin', 'receptionist']}>
              <Invoices />
            </ProtectedRoute>
          } />
          <Route path="/billing/invoices/new" element={
            <ProtectedRoute roles={['admin', 'receptionist']}>
              <InvoiceForm />
            </ProtectedRoute>
          } />

          <Route path="/billing/invoices/:id" element={
            <ProtectedRoute roles={['admin', 'receptionist']}>
              <InvoiceDetail />
            </ProtectedRoute>
          } />

          {/* 2. Add the new routes for service management */}
          <Route path="services" element={
            <ProtectedRoute roles={['admin']}>
              <Services />
            </ProtectedRoute>
          } />
          <Route path="services/new" element={
            <ProtectedRoute roles={['admin']}>
              <ServiceForm />
            </ProtectedRoute>
          } />
          <Route path="services/edit/:id" element={
            <ProtectedRoute roles={['admin']}>
              <ServiceForm />
            </ProtectedRoute>
          } />

          {/* User Profile Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* User Management Routes */}
          <Route path="/users/new" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <UserForm />
            </ProtectedRoute>
          } />
          <Route path="/users/:id/edit" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <UserForm />
            </ProtectedRoute>
          } />

          {/* Settings Routes */}
          <Route path="/settings" element={
            <ProtectedRoute requiredRoles={['admin', 'doctor', 'receptionist']}>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/404" element={<NotFound />} />

          {/* Default Routes */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

// Main App Component with Providers
const App = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {/* REMOVED: <DataProvider> */}
              <AppContent />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            {/* REMOVED: </DataProvider> */}
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;