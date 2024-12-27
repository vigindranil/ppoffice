import React, { useState, useEffect } from 'react';
import { FaPlus, FaUserLock, FaUsers, FaClipboardList, FaHome, FaChartBar, FaArrowRight } from 'react-icons/fa';
import Navbar from '../components/ui/Navbar';
import StaffList from './StaffList';
import CreateStaff from './CreateStaff';
import ResetPassword from './ResetPassword';
import AssignedCases from './AssignedCases';
import PendingCases from './PendingCases';
import StaffDetailsPopup from './StaffDetailsPopup';
import CreatePPUser from './CreatePPUser';

const ModernPPOfficeAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [ppStaff, setPPStaff] = useState([]);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalCases: 0,
    pendingCases: 0,
    assignedCases: 0,
    totalStaff: 0
  });
  const [caseListCategory, setCaseListCategory] = useState('assigned');

  useEffect(() => {
    fetchStaffList();
    fetchDashboardData();
  }, []);

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

  const fetchDashboardData = async () => {
    setDashboardData({
      totalCases: 150,
      pendingCases: 50,
      assignedCases: 100,
      totalStaff: 20
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';  // Redirect to home page or login page
  };

  const handleViewProfile = () => {
    console.log('Viewing profile');
  };

  const handleViewNotifications = () => {
    console.log('Viewing notifications');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
            <InfoCard 
              title="Total Cases" 
              value={dashboardData.totalCases} 
              icon={FaClipboardList} 
              gradient="from-blue-400 to-blue-600"
              description="All cases in the system" 
            />
            <ClickableInfoCard 
              title="Pending Cases" 
              value={dashboardData.pendingCases} 
              icon={FaChartBar} 
              gradient="from-purple-400 to-purple-600"
              description="Cases awaiting action" 
              onClick={() => {
                setActiveTab('pendingCases');
              }}
            />
            <ClickableInfoCard 
              title="Assigned Cases" 
              value={dashboardData.assignedCases} 
              icon={FaUsers} 
              gradient="from-green-400 to-green-600"
              description="Cases currently assigned" 
              onClick={() => {
                setActiveTab('assignedCases');
              }}
            />
            <InfoCard 
              title="Total Staff" 
              value={dashboardData.totalStaff} 
              icon={FaUserLock} 
              gradient="from-pink-400 to-pink-600"
              description="Active PP users" 
            />
          </div>
        );
      case 'staffList':
        return <StaffList ppStaff={ppStaff} setSelectedStaff={setSelectedStaff} fetchStaffList={fetchStaffList} />;
      case 'createStaff':
        return <CreateStaff fetchStaffList={fetchStaffList} />;
      case 'resetPassword':
        return <ResetPassword ppStaff={ppStaff} />;
      case 'assignedCases':
        return <AssignedCases ppStaff={ppStaff} />;
      case 'pendingCases':
        return <PendingCases ppStaff={ppStaff} />;
      default:
        return null;
    }
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
              <SidebarButton icon={FaHome} label="Home Dashboard" onClick={() => setActiveTab('home')} isActive={activeTab === 'home'} />
              <SidebarButton icon={FaUsers} label="PP User" onClick={() => setActiveTab('staffList')} isActive={activeTab === 'staffList'} />
              <SidebarButton icon={FaClipboardList} label="Pending Cases" onClick={() => setActiveTab('pendingCases')} isActive={activeTab === 'pendingCases'} />
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64">
          <main className="p-2">
            <div className="container mx-auto">
              {/* Updated Heading for Home Dashboard */}
              <h1 >
                {activeTab === 'home' ? 'Home Dashboard' : ''
                 }
              </h1>
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 md:p-4 mb-4 rounded-md text-sm md:text-base" role="alert">
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              )}
              <div className="">
              <h1 className="text-4xl font-bold text-center pb-4 bg-gradient-to-r from-green-700 to-gray-600 text-transparent bg-clip-text">
  Home Dashboard
</h1>

                {renderContent()}
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

const SidebarButton = ({ icon: Icon, label, onClick, isActive }) => (
  <button
    className={`w-full text-left px-4 py-3 rounded-md mb-2 flex items-center transition-colors duration-200 ${isActive ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
    onClick={onClick}
  >
    <Icon className="mr-3" /> {label}
  </button>
);

const InfoCard = ({ title, value, icon: Icon, gradient, description }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-xl shadow-lg`}>
    <div className="px-4 py-6 sm:p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <div className="text-white/90 text-2xl">
            <Icon />
          </div>
        </div>
        <p className="text-white/80 text-xs">{description}</p>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const ClickableInfoCard = ({ title, value, icon: Icon, gradient, description, onClick }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-xl shadow-lg cursor-pointer relative`} onClick={onClick}>
    <div className="px-4 py-6 sm:p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <div className="text-white/90 text-2xl">
            <Icon />
          </div>
        </div>
        <p className="text-white/80 text-xs">{description}</p>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
    <div className="absolute bottom-2 right-2 text-white/90">
      <FaArrowRight />
    </div>
  </div>
);

export default ModernPPOfficeAdminDashboard;
