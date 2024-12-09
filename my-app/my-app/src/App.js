import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NewCaseEntryForm from './NewCaseEntryForm';
import Home from './pages/Home';
import Login from './auth/Login';
import Ppoadmindashboard from './dashboard/ModernPPOfficeAdminDashboard';

function App() {
  return (
    <Router>  
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />  
          <Route path="/login" element={<Login />} />
          <Route path="/ppoadmin" element={<Ppoadmindashboard />} />
          <Route path="/caseentry" element={<NewCaseEntryForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

