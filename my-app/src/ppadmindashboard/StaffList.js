import React, { useState } from 'react';
import { FaSearch, FaUsers } from 'react-icons/fa';

const StaffList = ({ ppStaff, setSelectedStaff }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStaff = ppStaff.filter(staff =>
    staff.pp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Staff List</h2>
        <div className="relative w-1/2">
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredStaff.map(staff => (
          <div key={staff.pp_id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900">{staff.pp_name}</h3>
              <span className="text-sm text-gray-600">{staff.pp_licensenumber}</span>
            </div>
            <button
              onClick={() => setSelectedStaff(staff)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              <FaUsers className="mr-2" /> View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffList;

