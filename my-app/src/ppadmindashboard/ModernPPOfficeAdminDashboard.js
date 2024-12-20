import React, { useState, useEffect } from 'react';
import { FaPlus, FaUserLock, FaClipboardCheck, FaUsers, FaSignOutAlt, FaClipboardList, FaBars } from 'react-icons/fa';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'staffList') {
      setError(null);
      fetchStaffList();
    }
  }, [activeTab]);

  const fetchStaffList = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/getppuser', {
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}>
      {/* Sidebar */}
      <div className={`bg-blue-900 text-white w-64 min-h-screen fixed lg:static lg:translate-x-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-30`}>
        <div className="p-4 flex flex-col h-full">
          <h1 className="text-2xl font-bold mb-8">PP Office Head</h1>
          <nav className="flex-grow">
            <button
              className={`w-full text-left px-4 py-2 rounded-md mb-2 flex items-center ${activeTab === 'staffList' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
              onClick={() => setActiveTab('staffList')}
            >
              <FaUsers className="mr-3" /> PP User
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-md mb-2 flex items-center ${activeTab === 'createStaff' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
              onClick={() => setActiveTab('createStaff')}
            >
              <FaPlus className="mr-3" /> Create PP User
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-md mb-2 flex items-center ${activeTab === 'resetPassword' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
              onClick={() => setActiveTab('resetPassword')}
            >
              <FaUserLock className="mr-3" /> Reset Password
            </button>
            <button
              className={`w-full text-left px-4 py-2 rounded-md mb-2 flex items-center ${activeTab === 'caseList' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
              onClick={() => setActiveTab('caseList')}
            >
              <FaClipboardList className="mr-3" /> Case List
            </button>
          </nav>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-md flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors duration-300"
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <button onClick={toggleSidebar} className="lg:hidden text-blue-900">
            <FaBars size={24} />
          </button>
          <h2 className="text-2xl font-semibold text-blue-900">
            {activeTab === 'staffList' && 'User List'}
            {activeTab === 'createStaff' && 'Create PP User'}
            {activeTab === 'resetPassword' && 'Reset Password'}
            {activeTab === 'caseList' && 'Case List'}
          </h2>
          <div></div> {/* Placeholder for potential header actions */}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 md:p-4 mb-4 rounded text-sm md:text-base" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              {activeTab === 'staffList' && <StaffList ppStaff={ppStaff} setSelectedStaff={setSelectedStaff} />}
              {activeTab === 'createStaff' && <CreateStaff fetchStaffList={fetchStaffList} />}
              {activeTab === 'resetPassword' && <ResetPassword ppStaff={ppStaff} />}
              {activeTab === 'caseList' && <CaseList ppStaff={ppStaff} />}
            </div>
          </div>
        </main>
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

