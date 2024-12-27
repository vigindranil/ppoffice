import React from 'react';
import { FaBars } from 'react-icons/fa';

const Header = ({ toggleSidebar, userName }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 mr-4">
            <FaBars size={24} />
          </button>
          <img src={('./images/file.png')} alt="Logo" className="h-8 w-auto" />
          {/* <h1 className="ml-3 text-2xl font-bold text-gray-900 text-center">PPOM</h1> */}
        </div>
        <h2 className="text-gray-800">
          {userName ? `Welcome, ${userName}` : 'Welcome Super Admin'}
        </h2>
      </div>
    </header>
  );
};

export default Header;

