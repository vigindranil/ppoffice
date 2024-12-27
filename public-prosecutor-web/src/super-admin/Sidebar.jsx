import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaUserPlus, FaUsers, FaUserTie, FaUserShield } from 'react-icons/fa';

const Sidebar = ({ sidebarOpen, toggleSidebar, handleLogout }) => {
  return (
    <div className={`bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
      <div className="p-4 flex-grow">
        <h1 className={`text-2xl font-bold mb-6 ${sidebarOpen ? '' : 'hidden'}`}>Super Admin Dashboard</h1>
        <nav className="space-y-2">
          <SidebarLink to="/add-pp-office-admin" icon={FaUserPlus} text="Add PP Office Admin" sidebarOpen={sidebarOpen} />
          <SidebarLink to="/pp-office-admin-list" icon={FaUsers} text="PP Office Admin List" sidebarOpen={sidebarOpen} />
          <SidebarLink to="/add-pp-head" icon={FaUserTie} text="Add PP Head" sidebarOpen={sidebarOpen} />
          <SidebarLink to="/pp-head-list" icon={FaUsers} text="PP Head List" sidebarOpen={sidebarOpen} />
          <SidebarLink to="/add-sp" icon={FaUserShield} text="Add SP" sidebarOpen={sidebarOpen} />
          <SidebarLink to="/sp-list" icon={FaUsers} text="SP List" sidebarOpen={sidebarOpen} />
        </nav>
      </div>
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <FaSignOutAlt className={`${sidebarOpen ? 'mr-2' : 'mx-auto'}`} />
          <span className={sidebarOpen ? '' : 'hidden'}>Logout</span>
        </button>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon: Icon, text, sidebarOpen }) => (
  <Link
    to={to}
    className="flex items-center px-2 py-2 rounded-lg hover:bg-blue-800 transition-colors"
  >
    <Icon className={`${sidebarOpen ? 'mr-2' : 'mx-auto'}`} />
    <span className={sidebarOpen ? '' : 'hidden'}>{text}</span>
  </Link>
);

export default Sidebar;
