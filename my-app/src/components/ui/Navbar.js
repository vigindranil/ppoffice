import React, { useState } from 'react';
import { FaUser, FaBell, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const Navbar = ({ onLogout, onViewProfile, onViewNotifications }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    onLogout();
    setIsDropdownOpen(false);
  };

  const handleViewProfile = () => {
    onViewProfile();
    setIsDropdownOpen(false);
  };

  const handleViewNotifications = () => {
    onViewNotifications();
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-10">
      <div className="mx-auto flex justify-between items-center">
        <div className="text-gray-600 text-xl font-bold">Case tracking system</div>
        <div className="flex items-center">
          <button
            onClick={handleViewNotifications}
            className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2"
          >
            <FaBell className="text-xl" />
          </button>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <FaUser className="text-xl" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={handleViewProfile}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                >
                  <FaUserCircle className="mr-2" /> View Profile
                </button>
                <button
                  onClick={handleViewNotifications}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                >
                  <FaBell className="mr-2" /> Notifications
                </button>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
