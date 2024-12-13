import React, { useState, useEffect } from 'react';
import { FaPlus, FaUserLock, FaClipboardCheck, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import StaffList from './StaffList';
import CreateStaff from './CreateStaff';
import ResetPassword from './ResetPassword';
import AllocateCase from './AllocateCase';
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
      const response = await fetch('http://localhost:8000/api/getppstaff', {
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
        setError(result.message || 'Failed to fetch staff list');
      }
    } catch (error) {
      setError(error.message || 'Error fetching staff list');
      setPPStaff([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';  // Redirect to home page or login page
  };

  return (
    <div className="flex h-screen bg-cover bg-center" style={{ backgroundImage: "url('images/court3.webp')" }}>
      {/* Sidebar */}
      <div className="w-64 bg-white bg-opacity-60 backdrop-filter backdrop-blur-lg shadow-lg flex flex-col relative">
        <div className="p-6 flex-grow overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">PP Office Admin</h1>
          <nav>
          <button
              className={`w-full text-left px-4 py-2 rounded-md mb-2 flex items-center ${activeTab === 'staffList' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('staffList')}
            >
              <FaUsers className="mr-3" /> Staff List
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-md mb-2 flex items-center ${activeTab === 'createStaff' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('createStaff')}
            >
              <FaPlus className="mr-3" /> Create PP Staff
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-md mb-2 flex items-center ${activeTab === 'resetPassword' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('resetPassword')}
            >
              <FaUserLock className="mr-3" /> Reset Password
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-md mb-2 flex items-center ${activeTab === 'allocateCase' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveTab('allocateCase')}
            >
              <FaClipboardCheck className="mr-3" /> Allocate Case
            </button>
          
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded-md flex items-center justify-center bg-red-600 bg-opacity-80 hover:bg-opacity-100 text-white backdrop-blur-lg transition-all duration-300 ease-in-out"
            >
              <FaSignOutAlt className="mr-3" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-10 bg-black bg-opacity-20 overflow-auto">
        <div className="max-w-3xl mx-auto bg-opacity-40 backdrop-blur-lg bg-white rounded-lg shadow-xl p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          {activeTab === 'staffList' && <StaffList ppStaff={ppStaff} setSelectedStaff={setSelectedStaff} />}
          {activeTab === 'createStaff' && <CreateStaff fetchStaffList={fetchStaffList} />}
          {activeTab === 'resetPassword' && <ResetPassword ppStaff={ppStaff} />}
          {activeTab === 'allocateCase' && <AllocateCase ppStaff={ppStaff} />}
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
