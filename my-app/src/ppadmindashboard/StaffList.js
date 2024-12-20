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
        <h2 className="text-xl font-semibold text-gray-900">User List</h2>
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-700"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full table-auto">
          <thead className="bg-blue-100 text-left text-sm font-semibold text-gray-700">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">License Number</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((staff) => (
              <tr key={staff.pp_id} className="border-t border-gray-200 hover:bg-blue-50">
                <td className="px-6 py-4 text-sm text-gray-800">{staff.pp_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{staff.pp_licensenumber}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => setSelectedStaff(staff)}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                  >
                    <FaUsers className="mr-2" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffList;
