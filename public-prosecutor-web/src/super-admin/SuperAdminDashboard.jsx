import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { FaUserPlus, FaUsers, FaUserTie, FaUserShield } from 'react-icons/fa';
import { useIsMobile } from '../hooks/use-mobile';

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const storedName = sessionStorage.getItem('AuthorityName');
    if (storedName && storedName !== 'undefined' && storedName !== 'null') {
      setUserName(storedName);
    } else {
      console.error('AuthorityName not found in sessionStorage');
    }
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('AuthorityName');
    sessionStorage.removeItem('AuthorityUserID');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const cards = [
    { title: 'Add PP Office Admin', icon: FaUserPlus, link: '/add-pp-office-admin' },
    { title: 'PP Office Admin List', icon: FaUsers, link: '/pp-office-admin-list' },
    { title: 'Add PP Head', icon: FaUserTie, link: '/add-pp-head' },
    { title: 'PP Head List', icon: FaUsers, link: '/pp-head-list' },
    { title: 'Add SP', icon: FaUserShield, link: '/add-sp' },
    { title: 'SP List', icon: FaUsers, link: '/sp-list' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} handleLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} userName={userName} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <Breadcrumbs />
          {location.pathname === '/' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card, index) => (
                <Card key={index} {...card} navigate={navigate} />
              ))}
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

const Card = ({ title, icon: Icon, link, navigate }) => (
  <div 
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    onClick={() => navigate(link)}
  >
    <Icon className="text-4xl text-blue-500 mb-4" />
    <h3 className="text-xl font-semibold">{title}</h3>
  </div>
);

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="text-gray-500 mb-4">
      <ol className="list-none p-0 inline-flex">
        <li className="flex items-center">
          <a>Home</a>
        </li>
        {/* {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          return (
            <li key={to} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-gray-700">{value}</span>
              ) : (
                <a href={to}>{value}</a>
              )}
            </li>
          );
        })} */}
      </ol>
    </nav>
  );
};

export default SuperAdminDashboard;

