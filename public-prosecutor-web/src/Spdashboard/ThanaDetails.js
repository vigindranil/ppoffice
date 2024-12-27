import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserCog, FaClipboardList } from 'react-icons/fa';

const ThanaDetails = () => {
  const { thanaId } = useParams();
  const navigate = useNavigate();

  const handleViewDetails = (type) => {
    console.log(`Viewing ${type} for Thana ID: ${thanaId}`);
    // Navigate to specific details page or open a modal
    // For now, we'll just log the action
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Thana Details</h1>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Thana ID: {thanaId}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaClipboardList className="mr-2" /> Case Details
            </h3>
            <p className="mb-4">View and manage case information for this thana.</p>
            <button
              onClick={() => handleViewDetails('case-details')}
              className="bg-white text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors duration-200"
            >
              View
            </button>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaUserCog className="mr-2" /> User Management
            </h3>
            <p className="mb-4">Manage users and permissions for this thana.</p>
            <button
              onClick={() => handleViewDetails('user-management')}
              className="bg-white text-green-600 py-2 px-4 rounded-md hover:bg-green-100 transition-colors duration-200"
            >
              View
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default ThanaDetails;

