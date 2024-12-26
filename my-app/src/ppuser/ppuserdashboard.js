// ppuserdashboard.js
import React, { useState, useEffect } from 'react';
import { FaKey, FaClipboardList, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const PPUserDashboard = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({
    totalCases: 0,
    pendingCases: 0,
    completedCases: 0,
  });
  const [cases, setCases] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCaseDetails();
  }, []);

  const fetchCaseDetails = async () => {
    try {
      const ppuserID = sessionStorage.getItem('AuthorityUserID');
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/caseDetailsByPPuserId?ppuserID=${ppuserID}`, {
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
        setCases(result.data);
        updateDashboardData(result.data);
      } else {
        setError(result.message || 'Failed to fetch case details');
      }
    } catch (error) {
      setError(error.message || 'Error fetching case details');
      setCases([]);
    }
  };

  const updateDashboardData = (caseData) => {
    const totalCases = caseData.length;
    const pendingCases = caseData.filter(c => c.CaseHearingDate > new Date().toISOString()).length;
    const completedCases = totalCases - pendingCases;

    setDashboardData({
      totalCases,
      pendingCases,
      completedCases,
    });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    // Implement password reset logic here
    console.log('Password reset requested');
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logout requested');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <InfoCard 
              title="Total Cases" 
              value={dashboardData.totalCases} 
              icon={FaClipboardList} 
              gradient="from-blue-400 to-blue-600"
            />
            <InfoCard 
              title="Pending Cases" 
              value={dashboardData.pendingCases} 
              icon={FaExclamationTriangle} 
              gradient="from-yellow-400 to-yellow-600"
            />
            <InfoCard 
              title="Completed Cases" 
              value={dashboardData.completedCases} 
              icon={FaCheckCircle} 
              gradient="from-green-400 to-green-600"
            />
          </div>
        );
      case 'cases':
        return (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SP Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PS Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hearing Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.map((case_) => (
                  <tr key={case_.CaseId}>
                    <td className="px-6 py-4 whitespace-nowrap">{case_.CaseNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{case_.SpName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{case_.PsName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(case_.CaseDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(case_.CaseHearingDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'resetPassword':
        return (
          <form onSubmit={handleResetPassword} className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200">
              Reset Password
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-teal-800 text-white w-64 py-6 flex-shrink-0">
        <div className="px-6">
          <h1 className="text-2xl font-semibold mb-6">PP User Dashboard</h1>
          <nav>
            <SidebarButton icon={FaClipboardList} label="Dashboard" onClick={() => setActiveTab('dashboard')} isActive={activeTab === 'dashboard'} />
            <SidebarButton icon={FaClipboardList} label="Cases" onClick={() => setActiveTab('cases')} isActive={activeTab === 'cases'} />
            <SidebarButton icon={FaKey} label="Reset Password" onClick={() => setActiveTab('resetPassword')} isActive={activeTab === 'resetPassword'} />
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              {activeTab === 'dashboard' ? 'Dashboard' : 
               activeTab === 'cases' ? 'Your Cases' : 
               'Reset Password'}
            </h2>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200">
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const SidebarButton = ({ icon: Icon, label, onClick, isActive }) => (
  <button
    className={`w-full text-left px-4 py-2 rounded-md mb-2 flex items-center transition-colors duration-200 ${isActive ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
    onClick={onClick}
  >
    <Icon className="mr-3" /> {label}
  </button>
);

const InfoCard = ({ title, value, icon: Icon, gradient }) => (
  <div className={`bg-gradient-to-r ${gradient} rounded-xl shadow-lg`}>
    <div className="px-4 py-6 sm:p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <div className="text-white text-2xl">
          <Icon />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);

export default PPUserDashboard;