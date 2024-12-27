import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useCaseFetching, renderCaseList, renderCaseDetails } from './utils';

const AssignedCases = ({ ppStaff }) => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 5;

  const { cases: assignedCases, error } = useCaseFetching(true);

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= Math.ceil(assignedCases.length / casesPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Heading Section */}
      <h1 className="text-3xl text-center font-bold text-gray-800">Assigned Cases</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search cases..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {renderCaseList(assignedCases, currentPage, casesPerPage, handleCaseClick)}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-xl">
        <div className="flex justify-between items-center">
          <button
            className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {Math.ceil(assignedCases.length / casesPerPage)}
          </span>
          <button
            className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage * casesPerPage >= assignedCases.length}
          >
            Next
          </button>
        </div>
      </div>

      {selectedCase && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Case Details</h2>
          {renderCaseDetails(selectedCase, ppStaff)}
        </div>
      )}
    </div>
  );
};

export default AssignedCases;
