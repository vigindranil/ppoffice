import React, { useState, useEffect } from 'react';
import { FaPlus, FaUserLock, FaUsers, FaClipboardList } from 'react-icons/fa';
import Navbar from '../components/ui/Navbar';
import StaffList from './StaffList';
import CreateStaff from './CreateStaff';
import ResetPassword from './ResetPassword';
import CaseList from './CaseList';
import StaffDetailsPopup from './StaffDetailsPopup';

const ModernPPOfficeAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('staffList');
  const [ppStaff, setPPStaff] = useState([]);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    if (activeTab === 'staffList') {
      setError(null);
      fetchStaffList();
    }
  }, [activeTab]);

  const fetchStaffList = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const authorityUserID = sessionStorage.getItem('AuthorityUserID');
      const response = await fetch(`http://localhost:8000/api/getppuser?EntryuserID=${authorityUserID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 0 && result.data) {
        setPPStaff(result.data);
      } else {
        setError(result.message || 'Failed to fetch PP User');
      }
    } catch (error) {
      setError(error.message || 'Error fetching PP User');
      setPPStaff([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';  // Redirect to home page or login page
  };

  const handleViewProfile = () => {
    // Implement view profile logic here
    console.log('Viewing profile');
  };

  const handleViewNotifications = () => {
    // Implement view notifications logic here
    console.log('Viewing notifications');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar
        onLogout={handleLogout}
        onViewProfile={handleViewProfile}
        onViewNotifications={handleViewNotifications}
      />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="bg-teal-800 text-white w-64 fixed h-full shadow-lg">
          <div className="p-4 flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-8 text-teal-100">PP Office Head</h1>
            <nav className="flex-grow">
              <button
                className={`w-full text-left px-4 py-3 rounded-none mb-2 flex items-center ${activeTab === 'staffList' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
                onClick={() => setActiveTab('staffList')}
              >
                <FaUsers className="mr-3" /> PP User
              </button>
              <button
                className={`w-full text-left px-4 py-3 rounded-none mb-2 flex items-center ${activeTab === 'createStaff' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
                onClick={() => setActiveTab('createStaff')}
              >
                <FaPlus className="mr-3" /> Create PP User
              </button>
              <button
                className={`w-full text-left px-4 py-3 rounded-none mb-2 flex items-center ${activeTab === 'resetPassword' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
                onClick={() => setActiveTab('resetPassword')}
              >
                <FaUserLock className="mr-3" /> Reset Password
              </button>
              <button
                className={`w-full text-left px-4 py-3 rounded-none mb-2 flex items-center ${activeTab === 'caseList' ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
                onClick={() => setActiveTab('caseList')}
              >
                <FaClipboardList className="mr-3" /> Case List
              </button>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64">
          <main className="p-6">
            <div className="container mx-auto">
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 md:p-4 mb-4 rounded-none text-sm md:text-base" role="alert">
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              )}
              <div className="bg-white rounded-none shadow-lg p-4 md:p-6 border border-gray-200">
                {activeTab === 'staffList' && <StaffList ppStaff={ppStaff} setSelectedStaff={setSelectedStaff} />}
                {activeTab === 'createStaff' && <CreateStaff fetchStaffList={fetchStaffList} />}
                {activeTab === 'resetPassword' && <ResetPassword ppStaff={ppStaff} />}
                {activeTab === 'caseList' && <CaseList ppStaff={ppStaff} />}
              </div>
            </div>
          </main>
        </div>
      </div>

      {selectedStaff && (
        <StaffDetailsPopup
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </div>
  );
};

export default ModernPPOfficeAdminDashboard;

