import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa';

const StaffDetailsPopup = ({ staff, onClose }) => {
  if (!staff) return null;

  const iconColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full m-4 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
        >
          ×
        </button>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">{staff.pp_name}</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <FaUser style={{ color: iconColor }} className="mr-3 text-3xl" />
            <div>
              <p className="font-semibold text-gray-700">Username</p>
              <p className="text-gray-600">{staff.pp_username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <FaEnvelope style={{ color: iconColor }} className="mr-3 text-3xl" />
            <div>
              <p className="font-semibold text-gray-700">Email</p>
              <p className="text-gray-600">{staff.pp_email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <FaPhone style={{ color: iconColor }} className="mr-3 text-3xl" />
            <div>
              <p className="font-semibold text-gray-700">Contact Number</p>
              <p className="text-gray-600">{staff.pp_contactnumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <FaIdCard style={{ color: iconColor }} className="mr-3 text-3xl" />
            <div>
              <p className="font-semibold text-gray-700">License Number</p>
              <p className="text-gray-600">{staff.pp_licensenumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsPopup;
