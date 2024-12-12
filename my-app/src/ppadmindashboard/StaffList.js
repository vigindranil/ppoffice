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
        <h2 className="text-xl font-bold text-gray-800">Staff List</h2>
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

      <div className="grid grid-cols-1 gap-1">
        {filteredStaff.map(staff => (
          <div
            key={staff.pp_id}
            className="bg-white  border-gray-300 rounded-md p-3 flex items-center justify-between"
          >
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-900">{staff.pp_name}</h3>
              <span className="text-xs text-gray-600">{staff.pp_licensenumber}</span>
            </div>
            <button
              onClick={() => setSelectedStaff(staff)}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              <FaUsers className="mr-1" /> View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffList;
