import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import HireUsPage from './components/HireUsPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hire-us" element={<HireUsPage />} />
          <Route path="/hire-us.html" element={<HireUsPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;