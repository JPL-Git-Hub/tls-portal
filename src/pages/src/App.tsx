import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import { ClientProvider, useClient } from './contexts/ClientContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './components/DashboardPage';
import DocumentsPage from './components/DocumentsPage';
import BillingPage from './components/BillingPage';
import { isClientPortal } from './utils/subdomain';

// Lazy load the HireUs page for better initial load performance
const HireUsPage = lazy(() => import('./components/HireUsPage'));

// Component to handle routing based on subdomain
function AppRouter() {
  const { client, isValidPortal } = useClient();
  const isPortal = isClientPortal();

  // If we're on a subdomain, only show portal routes
  if (isPortal) {
    // Invalid subdomain/client
    if (!isValidPortal) {
      return null; // Error is handled by ClientProvider
    }

    return (
      <Router>
        <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
          <Routes>
            {/* Portal routes only - no public routes on subdomains */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected portal routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    );
  }

  // Main app routes (no subdomain)
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/hire-us" element={<HireUsPage />} />
          <Route path="/hire-us.html" element={<HireUsPage />} />
          
          {/* Redirect portal routes to home on main domain */}
          <Route path="/portal/*" element={<Navigate to="/" replace />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ClientProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ClientProvider>
    </ErrorBoundary>
  );
}

export default App;