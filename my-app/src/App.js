import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import NewCaseEntryForm from './NewCaseEntryForm';
import Home from './pages/Home';
import Login from './auth/Login';
import Ppoadmindashboard from './ppadmindashboard/ModernPPOfficeAdminDashboard';
import Ppstaffdashboard from './Ppstaffdashboard/Ppstaffdashboard';
import PrivateRoute from './PrivateRoute';  // Import PrivateRoute

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/ppoadmin"
            element={<PrivateRoute element={<Ppoadmindashboard />} />}
          />
          {/* <Route
            path="/caseentry"
            element={<PrivateRoute element={<NewCaseEntryForm />} />}
          /> */}
          <Route
            path="/ppostaff"
            element={<PrivateRoute element={<Ppstaffdashboard />} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
