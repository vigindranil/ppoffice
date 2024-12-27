import React from 'react';
import { FaTimes } from 'react-icons/fa';

const CaseDetailsModal = ({ caseData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{caseData.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Description:</h3>
          <p>{caseData.description}</p>
        </div>
        {/* Add more case details here */}
      </div>
    </div>
  );
};

export default CaseDetailsModal;

