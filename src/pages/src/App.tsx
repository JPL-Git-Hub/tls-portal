import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load the HireUs page for better initial load performance
const HireUsPage = lazy(() => import('./components/HireUsPage'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hire-us" element={<HireUsPage />} />
            <Route path="/hire-us.html" element={<HireUsPage />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;