import React, { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

const CreatePPUser = ({ onClose, fetchStaffList }) => {
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    userName: '',
    email: '',
    contactNumber: '',
    licenseNo: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      Username: newStaff.userName,
      UserPassword: newStaff.password,
      EntryUserID: 1,
      FullName: newStaff.fullName,
      ContractNo: newStaff.contactNumber,
      Email: newStaff.email,
      LicenseNumber: newStaff.licenseNo
    };

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/addppUser', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create new PP user');
      }

      setNewStaff({
        fullName: '',
        userName: '',
        email: '',
        contactNumber: '',
        licenseNo: '',
        password: ''
      });

      alert('New PP user created successfully!');
      fetchStaffList();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-gray-800 font-bold">Create PP User</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleCreateStaff} className="space-y-3">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm" role="alert">
              <strong className="font-bold">Error:</strong> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fullName" className="block text-xs font-medium text-gray-700">Full Name</label>
              <input
                id="fullName"
                value={newStaff.fullName}
                onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="userName" className="block text-xs font-medium text-gray-700">Username</label>
              <input
                id="userName"
                value={newStaff.userName}
                onChange={(e) => setNewStaff({ ...newStaff, userName: e.target.value })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="contactNumber" className="block text-xs font-medium text-gray-700">Contact Number</label>
              <input
                id="contactNumber"
                value={newStaff.contactNumber}
                onChange={(e) => setNewStaff({ ...newStaff, contactNumber: e.target.value })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="licenseNo" className="block text-xs font-medium text-gray-700">License No.</label>
              <input
                id="licenseNo"
                value={newStaff.licenseNo}
                onChange={(e) => setNewStaff({ ...newStaff, licenseNo: e.target.value })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
            >
              {loading ? 'Creating...' : <><FaPlus className="mr-2" /> Create User</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePPUser;

