// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './auth/Login';
import Ppoadmindashboard from './ppadmindashboard/ModernPPOfficeAdminDashboard';
import Ppstaffdashboard from './Ppstaffdashboard/Ppstaffdashboard';
import SPCPDashboard from './Spdashboard/SPCPDashboard';
import PrivateRoute from './PrivateRoute';
import PSDashboard from './ps/PSDashboard';
import PPOfficeDashboard from './Ppoffice/ppodash'; 
import PPUserDashboard from './ppuser/ppuserdashboard'; // Import the new component

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
          <Route
            path="/psdash"
            element={<PrivateRoute element={<PSDashboard />} />}
          />
          <Route
            path="/ppodash"
            element={<PrivateRoute element={<PPOfficeDashboard />} />}
          />
          {/* New route for PP User Dashboard */}
          <Route
            path="/ppuser"
            element={<PrivateRoute element={<PPUserDashboard />} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;