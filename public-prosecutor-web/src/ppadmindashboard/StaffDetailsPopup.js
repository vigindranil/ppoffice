import React, { useState } from 'react';
import { FaTimes, FaUserLock } from 'react-icons/fa';
import ResetPasswordModal from './ResetPasswordModal';

const StaffDetailsPopup = ({ staff, onClose }) => {
  const [showResetPassword, setShowResetPassword] = useState(false);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Staff Details</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        <div className="space-y-4">
          <p><strong>Name:</strong> {staff.pp_name}</p>
          <p><strong>License Number:</strong> {staff.pp_licensenumber}</p>
          <p><strong>Email:</strong> {staff.pp_email}</p>
          <p><strong>Contact Number:</strong> {staff.pp_contactnumber}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowResetPassword(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <FaUserLock className="mr-2" /> Reset Password
          </button>
        </div>
        {showResetPassword && (
          <ResetPasswordModal
            userId={staff.pp_id}
            onClose={() => setShowResetPassword(false)}
          />
        )}
      </div>
    </div>
  );
};

export default StaffDetailsPopup;

