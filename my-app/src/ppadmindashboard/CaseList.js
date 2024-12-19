import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaUserCheck, FaSearch, FaChevronRight, FaEye } from 'react-icons/fa';

const CaseListDashboard = ({ ppStaff }) => {
  const [pendingCases, setPendingCases] = useState([]);
  const [assignedCases, setAssignedCases] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState('');
  const [remarks, setRemarks] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [pendingResponse, assignedResponse] = await Promise.all([
        fetch('http://localhost:8000/api/showallCase?is_Assigned=0', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/api/showallCase?is_Assigned=1', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!pendingResponse.ok || !assignedResponse.ok) {
        throw new Error(`HTTP error! status: ${pendingResponse.status} or ${assignedResponse.status}`);
      }

      const [pendingResult, assignedResult] = await Promise.all([
        pendingResponse.json(),
        assignedResponse.json()
      ]);

      if (pendingResult.status === 0 && pendingResult.data && assignedResult.status === 0 && assignedResult.data) {
        setPendingCases(pendingResult.data);
        setAssignedCases(assignedResult.data);
      } else {
        throw new Error(pendingResult.message || assignedResult.message || 'Failed to fetch cases');
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      setError(error.message || 'Error fetching cases');
    }
  };

  const handleCardClick = (category) => {
    setSelectedCategory(category);
    setSelectedCase(null);
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
          Remarks: remarks // sending remarks along with other data
        })
      });

      const result = await response.json();
      if (result.status === 0) {
        setAssignmentSuccess('Case assigned successfully.');
        setSelectedCase(null);
        fetchCases(); // Refresh the case lists
      } else {
        setError(result.message || 'Failed to assign case');
      }
    } catch (error) {
      setError(error.message || 'Error assigning case');
    }
  };

  const renderCaseList = (cases) => {
    return (
      <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {cases.map(caseItem => (
          <div 
            key={caseItem.CaseId} 
            className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-600"
            onClick={() => handleCaseClick(caseItem)}
          >
            <h3 className="font-bold text-lg mb-2 text-blue-800">{caseItem.CaseNumber}</h3>
            <p className="text-gray-600"><span className="font-semibold">Type:</span> {caseItem.CaseType}</p>
            <p className="text-gray-600"><span className="font-semibold">Date:</span> {new Date(caseItem.CaseDate).toLocaleDateString()}</p>
            <div className="mt-2 flex justify-end">
              <FaChevronRight className="text-blue-500" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCaseDetails = (caseItem) => {
    return (
      <div className="mt-4 bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-600">
        <h3 className="font-bold text-2xl mb-4 text-blue-800">{caseItem.CaseNumber}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p className="text-gray-700"><span className="font-semibold">Type:</span> {caseItem.CaseType}</p>
          <p className="text-gray-700"><span className="font-semibold">Date:</span> {new Date(caseItem.CaseDate).toLocaleDateString()}</p>
          <p className="text-gray-700"><span className="font-semibold">Hearing Date:</span> {new Date(caseItem.CaseHearingDate).toLocaleDateString()}</p>
          <p className="text-gray-700"><span className="font-semibold">PP User Name:</span> {caseItem.PPuserName || 'Not Assigned'}</p>
          <p className="text-gray-700"><span className="font-semibold">SP Name:</span> {caseItem.SpName}</p>
          <p className="text-gray-700"><span className="font-semibold">PS Name:</span> {caseItem.PsName}</p>
          <p className="text-gray-700"><span className="font-semibold">Status:</span> {caseItem.IsAssigned ? 'Assigned' : 'Pending'}</p>
        </div>
        {!caseItem.IsAssigned && (
          <div className="mt-4">
            <select
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            />
            <button
              className="mt-2  px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
    <div className="min-h-screen bg-gray-100" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-blue-900">Case Dashboard</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {assignmentSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Success:</strong>
            <span className="block sm:inline"> {assignmentSuccess}</span>
          </div>
        )}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div 
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500"
            onClick={() => handleCardClick('pending')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2 text-blue-800">Pending Cases</h2>
                <p className="text-4xl font-bold text-blue-600">{pendingCases.length}</p>
              </div>
              <FaClipboardList className="text-5xl text-blue-500 opacity-50" />
            </div>
          </div>
          <div 
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-500"
            onClick={() => handleCardClick('assigned')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2 text-green-800">Assigned Cases</h2>
                <p className="text-4xl font-bold text-green-600">{assignedCases.length}</p>
              </div>
              <FaUserCheck className="text-5xl text-green-500 opacity-50" />
            </div>
          </div>
        </div>

        {selectedCategory && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">
              {selectedCategory === 'pending' ? 'Pending Cases' : 'Assigned Cases'}
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cases..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              {selectedCategory === 'pending' 
                ? renderCaseList(pendingCases) 
                : renderCaseList(assignedCases)}
            </div>
          </div>
        )}

        {selectedCase && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Case Details</h2>
            {renderCaseDetails(selectedCase)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseListDashboard;
