import React, { useState, useEffect } from 'react';
import { FaSearch, FaChevronRight } from 'react-icons/fa';

const CaseList = ({ ppStaff, initialCategory = 'assigned' }) => {
  const [pendingCases, setPendingCases] = useState([]);
  const [assignedCases, setAssignedCases] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCase, setSelectedCase] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState('');
  const [remarks, setRemarks] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [casesPerPage, setCasesPerPage] = useState(5);


  useEffect(() => {
    fetchCases();
  }, [selectedCategory, currentPage]);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const isAssigned = selectedCategory === 'assigned' ? 1 : 0;
      const response = await fetch(`http://localhost:8000/api/showallCase?is_Assigned=${isAssigned}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 0 && result.data) {
        if (selectedCategory === 'assigned') {
          setAssignedCases(result.data);
        } else {
          setPendingCases(result.data);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch cases');
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      setError(error.message || 'Error fetching cases');
    }
  };

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    setAssignedStaff('');
    setRemarks('');
    setAssignmentSuccess(null);
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
      } else {
        setError(result.message || 'Failed to assign case');
      }
    } catch (error) {
      setError(error.message || 'Error assigning case');
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= Math.ceil( (selectedCategory === 'pending' ? pendingCases.length : assignedCases.length) / casesPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const renderCaseList = (cases) => {
    const indexOfLastCase = currentPage * casesPerPage;
    const indexOfFirstCase = indexOfLastCase - casesPerPage;
    const currentCases = cases.slice(indexOfFirstCase, indexOfLastCase);

    return (
      <div className="overflow-x-auto relative rounded-xl shadow-lg">
        <div className="min-w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-800 text-white">
                <th className="py-4 px-6 text-left font-semibold rounded-tl-xl">Case Number</th>
                <th className="py-4 px-6 text-left font-semibold">Type</th>
                <th className="py-4 px-6 text-left font-semibold">Date</th>
                <th className="py-4 px-6 text-left font-semibold">Status</th>
                <th className="py-4 px-6 text-left font-semibold rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentCases.map((caseItem, index) => (
                <tr 
                  key={caseItem.CaseId} 
                  className={`
                    border-b border-gray-100 hover:bg-emerald-50 cursor-pointer transition-colors
                    ${index === currentCases.length - 1 ? 'last:border-b-0' : ''}
                  `}
                  onClick={() => handleCaseClick(caseItem)}
                >
                  <td className="py-4 px-6 text-gray-700">{caseItem.CaseNumber}</td>
                  <td className="py-4 px-6 text-gray-700">{caseItem.CaseType}</td>
                  <td className="py-4 px-6 text-gray-700">
                    {new Date(caseItem.CaseDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      caseItem.IsAssigned 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {caseItem.IsAssigned ? 'Assigned' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-emerald-600 hover:text-emerald-800 transition-colors">
                      <FaChevronRight />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
                Page {currentPage} of {Math.ceil(cases.length / casesPerPage)}
              </span>
              <button
                className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage * casesPerPage >= cases.length}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCaseDetails = (caseItem) => {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-2xl mb-4 text-gray-800">{caseItem.CaseNumber}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-gray-700"><span className="font-semibold">Type:</span> {caseItem.CaseType}</p>
            <p className="text-gray-700"><span className="font-semibold">Date:</span> {new Date(caseItem.CaseDate).toLocaleDateString()}</p>
            <p className="text-gray-700"><span className="font-semibold">Hearing Date:</span> {new Date(caseItem.CaseHearingDate).toLocaleDateString()}</p>
            <p className="text-gray-700"><span className="font-semibold">PP User Name:</span> {caseItem.PPuserName || 'Not Assigned'}</p>
            <p className="text-gray-700"><span className="font-semibold">SP Name:</span> {caseItem.SpName}</p>
            <p className="text-gray-700"><span className="font-semibold">PS Name:</span> {caseItem.PsName}</p>
            <p className="text-gray-700"><span className="font-semibold">Status:</span> {caseItem.IsAssigned ? 'Assigned' : 'Pending'}</p>
          </div>
        </div>
        {!caseItem.IsAssigned && (
          <div className="p-6 bg-gray-50">
            <select
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select PP User member</option>
              {ppStaff.map((staff) => (
                <option key={staff.pp_id} value={staff.pp_id}>
                  {staff.pp_name}
                </option>
              ))}
            </select>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks"
              className="mt-4 w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows="3"
            />
            <button
              className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white text-base font-medium rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
              onClick={handleAssignCase}
            >
              Assign Case
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="">
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl text-center font-bold text-gray-800">Case List</h1>
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

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {selectedCategory === 'pending' ? 'Pending Cases' : 'Assigned Cases'}
            </h2>
            <div className="mb-6 relative">
              <input
                type="text"
                placeholder="Search cases..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {selectedCategory === 'pending' 
              ? renderCaseList(pendingCases) 
              : renderCaseList(assignedCases)}
          </div>
        </div>

        {selectedCase && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Case Details</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-2xl mb-4 text-gray-800">{selectedCase.CaseNumber}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p className="text-gray-700"><span className="font-semibold">Type:</span> {selectedCase.CaseType}</p>
                  <p className="text-gray-700"><span className="font-semibold">Date:</span> {new Date(selectedCase.CaseDate).toLocaleDateString()}</p>
                  <p className="text-gray-700"><span className="font-semibold">Hearing Date:</span> {new Date(selectedCase.CaseHearingDate).toLocaleDateString()}</p>
                  <p className="text-gray-700"><span className="font-semibold">PP User Name:</span> {selectedCase.PPuserName || 'Not Assigned'}</p>
                  <p className="text-gray-700"><span className="font-semibold">SP Name:</span> {selectedCase.SpName}</p>
                  <p className="text-gray-700"><span className="font-semibold">PS Name:</span> {selectedCase.PsName}</p>
                  <p className="text-gray-700"><span className="font-semibold">Status:</span> {selectedCase.IsAssigned ? 'Assigned' : 'Pending'}</p>
                </div>
              </div>
              {!selectedCase.IsAssigned && (
                <div className="p-6 bg-gray-50">
                  <select
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select PP User member</option>
                    {ppStaff.map((staff) => (
                      <option key={staff.pp_id} value={staff.pp_id}>
                        {staff.pp_name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter remarks"
                    className="mt-4 w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows="3"
                  />
                  <button
                    className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white text-base font-medium rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                    onClick={handleAssignCase}
                  >
                    Assign Case
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseList;

