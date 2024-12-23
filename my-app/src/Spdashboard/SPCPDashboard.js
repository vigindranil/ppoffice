import React, { useState, useEffect } from 'react';
import { FaBell, FaEye, FaTimes, FaSignOutAlt, FaMapMarkedAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SPCPDashboard = () => {
  const [thanas, setThanas] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const ppStaffID = sessionStorage.getItem('AuthorityUserID');
    const boundaryID = sessionStorage.getItem('BoundaryID');

    if (!authToken || !ppStaffID || !boundaryID) {
      console.error('Missing authentication or boundary information');
      navigate('/login');
      return;
    }

    fetchThanas(boundaryID, authToken);
    fetchNotifications();
  }, [navigate]);

  const fetchThanas = async (boundaryID, authToken) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/showpoliceBydistrict?districtId=${boundaryID}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.status === 0) {
        setThanas(response.data.data);
      } else {
        setError('Failed to fetch thanas');
      }
    } catch (error) {
      setError('An error occurred while fetching thanas');
      console.error('Error fetching thanas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = () => {
    // Implement notification fetching logic here
    // For now, we'll use dummy data
    setNotifications([
      {
        id: 1,
        message: 'New notification about Thana 1',
        timestamp: '2024-12-16 10:00 AM',
        isNew: true,
      },
      {
        id: 2,
        message: 'Urgent: Action required for Thana 2',
        timestamp: '2024-12-15 02:30 PM',
        isNew: false,
      },
      {
        id: 3,
        message: 'Reminder: Pending case review at Thana 3',
        timestamp: '2024-12-14 09:15 AM',
        isNew: true,
      },
    ]);
  };

  const dismissNotification = (notificationId) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('AuthorityUserID');
    sessionStorage.removeItem('BoundaryID');
    navigate('/login');
  };

  const handleViewThana = (thanaId) => {
    console.log(`Viewing details for Thana ID: ${thanaId}`);
    navigate(`/thana/${thanaId}`);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
          <div className="space-y-4">
            <button
              onClick={() => setShowNotifications(false)}
              className="w-full text-left p-2 rounded-md hover:bg-gray-700"
            >
              <FaMapMarkedAlt className="inline mr-2" /> Thanas Under Jurisdiction
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full text-left p-2 rounded-md mt-auto bg-red-600 hover:bg-red-700 text-white flex items-center justify-start"
        >
          <FaSignOutAlt className="inline mr-2" /> Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 relative">
        {/* Notification Bell */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleNotifications}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
          >
            <FaBell />
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">SP/CP Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and monitor thana activities</p>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute top-16 right-4 w-80 bg-white rounded-lg shadow-xl z-10">
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative p-4 rounded-lg shadow-sm border-l-4 ${
                      notification.isNew ? 'bg-white border-blue-500' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                    <div className="pr-6">
                      <p className="text-gray-800">{notification.message}</p>
                      <p className="text-sm text-gray-500 mt-1">{notification.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Thanas Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Thanas Under Jurisdiction</h2>
          {loading ? (
            <div className="text-center py-8">Loading thanas...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {thanas.map((thana) => (
                <div
                  key={thana.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:transform hover:scale-105"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{thana.ps_name}</h3>
                    <div className="flex justify-between mb-4">
                      <div className="text-blue-600">
                        <p className="font-semibold">Active Cases</p>
                        <p className="text-2xl">{thana.activeCases || 0}</p>
                      </div>
                      <div className="text-orange-600">
                        <p className="font-semibold">Pending Cases</p>
                        <p className="text-2xl">{thana.pendingCases || 0}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewThana(thana.id)}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                    >
                      <FaEye className="mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SPCPDashboard;

