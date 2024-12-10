import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

const CreateStaff = ({ fetchStaffList }) => {
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    userName: '',
    email: '',
    contactNumber: '',
    licenseNo: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);  // Track loading state
  const [error, setError] = useState(null);  // Track any errors during the API call

  const handleCreateStaff = async (e) => {
    e.preventDefault();

    // Start loading
    setLoading(true);
    setError(null);

    // Prepare the data for the API request
    const data = {
      Username: newStaff.userName,
      UserPassword: newStaff.password,
      EntryUserID: 1,  // Assuming EntryUserID is static or can be dynamic as needed
      FullName: newStaff.fullName,
      ContractNo: newStaff.contactNumber,
      Email: newStaff.email,
      LicenseNumber: newStaff.licenseNo
    };

    try {
      const token = localStorage.getItem('authToken');  // Retrieve auth token from localStorage

      // Send the API request
      const response = await fetch('http://localhost:8000/api/addppstaff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create new staff member');
      }

      // Reset form fields
      setNewStaff({
        fullName: '',
        userName: '',
        email: '',
        contactNumber: '',
        licenseNo: '',
        password: ''
      });

      alert('New PP staff created successfully!');
      fetchStaffList();  // Refresh the staff list after creation
    } catch (error) {
      setError(error.message);  // Handle any errors
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl text-gray-800 font-bold bg-opacity-80 backdrop-blur-md rounded-xl px-6 py-2 inline-block text-center">
          Create PP Staff
        </h2>
      </div>
      <div className="bg-white rounded-lg shadow-xl p-8">
        <form onSubmit={handleCreateStaff} className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="fullName"
                value={newStaff.fullName}
                onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="userName"
                value={newStaff.userName}
                onChange={(e) => setNewStaff({ ...newStaff, userName: e.target.value })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              id="contactNumber"
              value={newStaff.contactNumber}
              onChange={(e) => setNewStaff({ ...newStaff, contactNumber: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="licenseNo" className="block text-sm font-medium text-gray-700">License No.</label>
            <input
              id="licenseNo"
              value={newStaff.licenseNo}
              onChange={(e) => setNewStaff({ ...newStaff, licenseNo: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={newStaff.password}
              onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}  // Disable button when loading
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            {loading ? 'Creating...' : <><FaPlus className="mr-2" /> Create Staff</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStaff;
