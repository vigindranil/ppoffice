import React, { useState } from 'react';
import { FaUserLock } from 'react-icons/fa';

const ResetPassword = ({ ppStaff }) => {
  const [passwordReset, setPasswordReset] = useState({ userId: '', newPassword: '' });
  const [error, setError] = useState(null); // To track errors
  const [loading, setLoading] = useState(false); // To track loading state

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Show loading state
    setLoading(true);
    setError(null);

    // Prepare the data
    const data = {
      userId: passwordReset.userId,
      newPassword: passwordReset.newPassword,
    };

    // Fetch API request
    try {
      const token = localStorage.getItem('authToken'); // Get auth token from localStorage

      const response = await fetch('http://localhost:8000/api/changepassword', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Password reset failed');
      }

      // Reset form fields and show success message
      setPasswordReset({ userId: '', newPassword: '' });
      alert('Password reset successfully!');
    } catch (error) {
      setError(error.message); // Set the error message if something goes wrong
    } finally {
      setLoading(false); // Hide the loading spinner
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="">
        <div className="mb-6 text-center">
          <h2 className="text-xl text-gray-800 font-bold">Reset Password</h2>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-4">
          {/* Error handling */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Select User</label>
            <select
              id="userId"
              value={passwordReset.userId}
              onChange={(e) => setPasswordReset({...passwordReset, userId: e.target.value})}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a user</option>
              <option value="admin">Admin (You)</option>
              {ppStaff.map(staff => (
                <option key={staff.pp_id} value={staff.pp_id.toString()}>{staff.pp_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={passwordReset.newPassword}
              onChange={(e) => setPasswordReset({...passwordReset, newPassword: e.target.value})}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading} // Disable button when loading
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
          >
            {loading ? 'Resetting...' : <><FaUserLock className="mr-2" /> Reset Password</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
