// AllocateCase.js

import React, { useState } from 'react';
import { FaClipboardCheck } from 'react-icons/fa';
import { assignCase } from './api/assignCase';

const AllocateCase = ({ ppStaff }) => {
  const [caseAllocation, setCaseAllocation] = useState({ staffId: '', caseNumber: '', caseDate: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleCaseAllocation = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);


    const result = await assignCase(
      parseInt(caseAllocation.staffId),
      caseAllocation.caseNumber,
      caseAllocation.caseDate
    );

    if (result.success) {
      setSuccess(result.message);
      setCaseAllocation({ staffId: '', caseNumber: '', caseDate: '' });
    } else {
      setError(result.message);
    }
  };

  return (
    <div>
    {/* Title Section with Rounded Background */}
    <div className="flex justify-center items-center mb-6">
      <div className="text-center bg-opacity-80 backdrop-blur-md rounded-xl inline-block px-6 py-2">
        <h2 className="text-2xl text-gray-800 font-bold text-center">
          Allocate Case
        </h2>
      </div>
    </div>
  
    {/* Error and Success Messages */}
    {error && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )}
    {success && (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Success:</strong>
        <span className="block sm:inline"> {success}</span>
      </div>
    )}
  
    {/* Case Allocation Form */}
    <form onSubmit={handleCaseAllocation} className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700">
            Case Number
          </label>
          <input
            id="caseNumber"
            type="text"
            value={caseAllocation.caseNumber}
            onChange={(e) => setCaseAllocation({ ...caseAllocation, caseNumber: e.target.value })}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="caseDate" className="block text-sm font-medium text-gray-700">
            Case Date
          </label>
          <input
            id="caseDate"
            type="date"
            value={caseAllocation.caseDate}
            onChange={(e) => setCaseAllocation({ ...caseAllocation, caseDate: e.target.value })}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
  
      <div>
        <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">
          Assign to PP Staff
        </label>
        <select
          id="staffId"
          value={caseAllocation.staffId}
          onChange={(e) => setCaseAllocation({ ...caseAllocation, staffId: e.target.value })}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a staff member</option>
          {ppStaff.map(staff => (
            <option key={staff.pp_id} value={staff.pp_id.toString()}>
              {staff.pp_name}
            </option>
          ))}
        </select>
      </div>
  
      <button
        type="submit"
        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
      >
        <FaClipboardCheck className="mr-2" /> Allocate Case
      </button>
    </form>
  </div>
  
  );
};

export default AllocateCase;