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
import SuperDash from './super-admin/SuperAdminDashboard';
import AddPPOfficeAdmin from './super-admin/AddPPOfficeAdmin';
import PPOfficeAdminList from './super-admin/PPOfficeAdminList';
import AddPPHead from './super-admin/AddPPHead';
import PPHeadList from './super-admin/PPHeadList';
import AddSP from './super-admin/AddSP';
import SPList from './super-admin/SPList';

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


          <Route path="super-admin" element={<PrivateRoute element={<SuperDash />} />} />
          <Route path="add-pp-office-admin" element={<PrivateRoute element={<AddPPOfficeAdmin />} />} />
          <Route path="pp-office-admin-list" element={<PrivateRoute element={<PPOfficeAdminList />} />} />
          <Route path="add-pp-head" element={<PrivateRoute element={<AddPPHead />} />} />
          <Route path="pp-head-list" element={<PrivateRoute element={<PPHeadList />} />} />
          <Route path="add-sp" element={<PrivateRoute element={<AddSP />} />} />
          <Route path="sp-list" element={<PrivateRoute element={<SPList />} />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;

