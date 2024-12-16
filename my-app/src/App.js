import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './auth/Login';
import Ppoadmindashboard from './ppadmindashboard/ModernPPOfficeAdminDashboard';
import Ppstaffdashboard from './Ppstaffdashboard/Ppstaffdashboard';
import SPCPDashboard from './Spdashboard/SPCPDashboard';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/ppoadmin"
            element={<PrivateRoute element={<Ppoadmindashboard />} />}
          />
          <Route
            path="/ppostaff"
            element={<PrivateRoute element={<Ppstaffdashboard />} />}
          />
          <Route
            path="/SPCPDashboard"
            element={<PrivateRoute element={<SPCPDashboard />} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

