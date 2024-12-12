import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NewCaseEntryForm from './NewCaseEntryForm';
import Home from './pages/Home';
import Login from './auth/Login';
import Ppoadmindashboard from './ppadmindashboard/ModernPPOfficeAdminDashboard';
import Ppstaffdashboard from './Ppstaffdashboard/Ppstaffdashboard';

function App() {
  return (
    <Router>  
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />  
          <Route path="/login" element={<Login />} />
          <Route path="/ppoadmin" element={<Ppoadmindashboard />} />
          <Route path="/caseentry" element={<NewCaseEntryForm />} />
          <Route path="/ppostaff" element={<Ppstaffdashboard />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

