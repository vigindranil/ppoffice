import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';

const CaseList = ({ ppStaff }) => {
  const [cases, setCases] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('Authorization token missing. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:8000/api/showallCase', {
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
        setCases(result.data);
      } else {
        setError(result.message || 'Failed to fetch cases');
      }
    } catch (error) {
      setError(error.message || 'Error fetching cases');
    }
  };

  const fetchCaseDetails = async (caseId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authorization token missing. Please login again.');
        return null;
      }

      const response = await fetch(`http://localhost:8000/api/caseDetailsById?CaseID=${caseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 0 && result.data && result.data.length > 0) {
        return result.data[0];
      } else {
        setError(result.message || 'Failed to fetch case details');
        return null;
      }
    } catch (error) {
      setError(error.message || 'Error fetching case details');
      return null;
    }
  };

  const handleViewCase = async (caseItem) => {
    const caseDetails = await fetchCaseDetails(caseItem.CaseId);
    if (caseDetails) {
      setSelectedCase(caseDetails);
      setAssignedStaff('');
      setAssignmentSuccess(null);
    }
  };

  const handleAssignCase = async () => {
    // Ensure assignedStaff and selectedCase are available
    if (!assignedStaff || !selectedCase || !selectedCase.CaseId) {
      setError('All fields are required: PPUserID, EntryUserID, CaseID.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const entryUserID = localStorage.getItem('userId'); // Assuming userId is in localStorage

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
          PPUserID: parseInt(assignedStaff), // Staff member ID
          EntryUserID: parseInt(entryUserID), // Logged-in user ID
          CaseID: selectedCase.CaseId // Selected case ID
        })
      });

      const result = await response.json();
      if (result.status === 0) {
        setAssignmentSuccess('Case assigned successfully.');
        setSelectedCase(null);
      } else {
        setError(result.message || 'Failed to assign case');
      }
    } catch (error) {
      setError(error.message || 'Error assigning case');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Case List</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {assignmentSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success:</strong>
          <span className="block sm:inline"> {assignmentSuccess}</span>
        </div>
      )}
      {cases.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Notice:</strong>
          <span className="block sm:inline"> No cases found.</span>
        </div>
      ) : (
        cases.map((caseItem) => (
          <div key={caseItem.CaseId} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">{caseItem.CaseNumber}</h3>
            <p>Type: {caseItem.CaseType}</p>
            <p>Date: {new Date(caseItem.CaseDate).toLocaleDateString()}</p>
            <p>Hearing Date: {new Date(caseItem.CaseHearingDate).toLocaleDateString()}</p>
            <button 
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded flex items-center"
              onClick={() => handleViewCase(caseItem)}
            >
              <FaEye className="mr-2" /> View
            </button>
          </div>
        ))
      )}
      {selectedCase && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Case Details</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Case Number: {selectedCase.CaseNumber}
                </p>
                <p className="text-sm text-gray-500">
                  PP Staff Name: {selectedCase.PPstaffName}
                </p>
                <p className="text-sm text-gray-500">
                  SP Name: {selectedCase.SpName}
                </p>
                <p className="text-sm text-gray-500">
                  PS Name: {selectedCase.PsName}
                </p>
                <p className="text-sm text-gray-500">
                  Case Date: {new Date(selectedCase.CaseDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Case Type: {selectedCase.CaseType}
                </p>
                <select
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  className="mt-3 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select staff member</option>
                  {ppStaff.map((staff) => (
                    <option key={staff.pp_id} value={staff.pp_id}>
                      {staff.pp_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={handleAssignCase}
                >
                  Assign Case
                </button>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="cancel-btn"
                  className="px-4 py-2 bg-gray-300 text-black text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={() => setSelectedCase(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseList;
