import React, { useState, useEffect } from 'react';
import { FaBars, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import NewCaseEntry from './NewCaseEntry';

const Ppstaffdashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ppStaffName, setPpStaffName] = useState('');
  const [showNewCaseEntry, setShowNewCaseEntry] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Retrieve PPStaffName from sessionStorage
  useEffect(() => {
    const storedName = sessionStorage.getItem('AuthorityName');
    if (storedName && storedName !== 'undefined' && storedName !== 'null') {
      setPpStaffName(storedName);
    } else {
      console.error('PPStaffName not found in sessionStorage');
    }
  }, []);

  // Logout Functionality
  const handleLogout = () => {
    sessionStorage.removeItem('AuthorityName');
    sessionStorage.removeItem('AuthorityUserID');
    localStorage.removeItem('authToken');
    // Redirect to login page or handle logout as needed
  };

  // Toggle New Case Entry
  const toggleNewCaseEntry = () => {
    setShowNewCaseEntry(!showNewCaseEntry);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-48' : 'w-16'} flex flex-col`}>
        <div className="p-4 flex-grow">
          <h1 className={`text-2xl font-bold mb-6 ${sidebarOpen ? '' : 'hidden'}`}>PP Dashboard</h1>
          <nav className="space-y-2">
            <button 
              onClick={toggleNewCaseEntry}
              className="w-full flex items-center px-2 py-2 rounded-lg bg-blue-500 hover:bg-blue-800 transition-colors"
            >
              <FaPlus className="mr-2" />
              <span className={sidebarOpen ? '' : 'hidden'}>Add New Case</span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="mt-auto p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
              <FaBars size={24} />
            </button>
            <h2 className="text-gray-800">
              {ppStaffName ? `Welcome PPStaff, ${ppStaffName}` : 'Welcome PPOffice'}
            </h2>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {showNewCaseEntry ? (
            <NewCaseEntry onBack={toggleNewCaseEntry} />
          ) : (
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Dashboard Content</h2>
              <p>Welcome to the PP Staff Dashboard. Click on "Add New Case" to create a new case entry.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Ppstaffdashboard;
