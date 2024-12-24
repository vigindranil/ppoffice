import React, { useState } from 'react';
import { FaSearch, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useCaseFetching, renderCaseDetails } from './utils';

const PendingCases = ({ ppStaff }) => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState('');
  const [remarks, setRemarks] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 5;
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const { cases: pendingCases, fetchCases } = useCaseFetching(false);

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    setAssignedStaff('');
    setRemarks('');
    setAssignmentSuccess(null);
    setShowDetails(true);
  };

  const handleAssignCase = async () => {
    if (!assignedStaff || !selectedCase || !selectedCase.CaseId) {
      setError('All fields are required: PPUserID, EntryUserID, CaseID.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const entryUserID = sessionStorage.getItem('AuthorityUserID');

      if (!token) {
        setError('Authorization token missing. Please login again.');
        return;
      }

      if (!entryUserID) {
        setError('User is not authenticated. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:8000/api/assigncase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          PPUserID: parseInt(assignedStaff),
          EntryUserID: parseInt(entryUserID),
          CaseID: selectedCase.CaseId,
          Remarks: remarks
        })
      });

      const result = await response.json();
      if (result.status === 0) {
        setAssignmentSuccess('Case assigned successfully.');
        setSelectedCase(null);
        fetchCases();
        setShowDetails(false);
      } else {
        setError(result.message || 'Failed to assign case');
      }
    } catch (error) {
      setError(error.message || 'Error assigning case');
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= Math.ceil(pendingCases.length / casesPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const renderCaseList = (cases, currentPage, casesPerPage, onCaseClick) => {
    const indexOfLastCase = currentPage * casesPerPage;
    const indexOfFirstCase = indexOfLastCase - casesPerPage;
    const currentCases = cases.slice(indexOfFirstCase, indexOfLastCase);

    return (
        <table className="min-w-full divide-y divide-gray-200 table-auto rounded-lg overflow-hidden shadow-lg">
        <thead className="bg-emerald-600 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Case ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Case Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Case Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {currentCases.map((caseItem, index) => (
            <tr
              key={caseItem.CaseId}
              className={`hover:bg-emerald-50 ${index % 2 === 0 ? 'bg-gray-100' : ''}`}
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{caseItem.CaseId}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{caseItem.CaseType}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{caseItem.CaseDate}</td>
              <td className="px-6 py-4 text-sm text-green-500">{/* Display Pending Status */}
                Pending
              </td>
              <td className="px-6 py-4 text-sm text-emerald-600">
                <button
                  onClick={() => onCaseClick(caseItem)}
                  className="hover:text-emerald-800"
                >
                  <FaArrowRight />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      
      
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {assignmentSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Success:</strong>
          <span className="block sm:inline"> {assignmentSuccess}</span>
        </div>
      )}

      {!showDetails ? (
        <>
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
              {renderCaseList(pendingCases, currentPage, casesPerPage, handleCaseClick)}
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
                Page {currentPage} of {Math.ceil(pendingCases.length / casesPerPage)}
              </span>
              <button
                className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage * casesPerPage >= pendingCases.length}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <button
            onClick={() => setShowDetails(false)}
            className="mb-4 flex items-center text-emerald-600 hover:text-emerald-900"
          >
            <FaArrowLeft className="mr-2" /> Back to Case List
          </button>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Case Details</h2>
          {selectedCase && renderCaseDetails(selectedCase, ppStaff, assignedStaff, setAssignedStaff, remarks, setRemarks, handleAssignCase)}
        </div>
      )}
    </div>
  );
};

export default PendingCases;
