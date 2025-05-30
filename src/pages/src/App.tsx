import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import HireUsPage from './components/HireUsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hire-us" element={<HireUsPage />} />
        <Route path="/hire-us.html" element={<HireUsPage />} />
      </Routes>
    </Router>
  );
}

export default App;