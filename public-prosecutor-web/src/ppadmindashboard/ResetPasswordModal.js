import React, { useState } from 'react';
import { FaTimes, FaUserLock } from 'react-icons/fa';

const ResetPasswordModal = ({ userId, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      userId: userId,
      newPassword: newPassword,
    };

    try {
      const token = localStorage.getItem('authToken');
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

      setNewPassword('');
      alert('Password reset successfully!');
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
          >
            {loading ? 'Resetting...' : <><FaUserLock className="mr-2" /> Reset Password</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;

