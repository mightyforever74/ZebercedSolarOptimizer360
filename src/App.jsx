import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import SolarAdvisorPage from './views/SolarAdvisorPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SolarAdvisorPage />} />
        <Route path="*" element={<SolarAdvisorPage />} />
      </Routes>
    </Router>
  );
}

