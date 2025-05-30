import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './components/DashboardPage';
import DocumentsPage from './components/DocumentsPage';

// Lazy load the HireUs page for better initial load performance
const HireUsPage = lazy(() => import('./components/HireUsPage'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/hire-us" element={<HireUsPage />} />
              <Route path="/hire-us.html" element={<HireUsPage />} />
              
              {/* Portal auth routes */}
              <Route path="/portal/login" element={<LoginPage />} />
              <Route path="/portal/register" element={<RegisterPage />} />
              
              {/* Protected portal routes */}
              <Route
                path="/portal"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/portal/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                {/* Future routes: messages, profile */}
              </Route>
              
              {/* Redirect /portal to /portal/dashboard */}
              <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;