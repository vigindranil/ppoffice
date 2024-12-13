import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import CaseEntryPage from './NewCaseEntry';
import axios from 'axios';

const Task = () => {
  const [assignedCases, setAssignedCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignedCases = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        const ppStaffID = sessionStorage.getItem('AuthorityUserID');

        if (!authToken || !ppStaffID) {
          throw new Error('Authentication information is missing');
        }

        const response = await axios.get(`http://localhost:8000/api/getCaseAssign?ppStaffID=${ppStaffID}`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        if (response.data.status === 0) {
          setAssignedCases(response.data.data);
        } else {
          throw new Error(response.data.message || 'Failed to fetch assigned cases');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedCases();
  }, []);

  const handleViewCase = (caseId) => {
    setSelectedCase(assignedCases.find(c => c.caseId === caseId));
  };

  const handleBack = () => {
    setSelectedCase(null);
  };

  if (selectedCase) {
    return <CaseEntryPage initialData={selectedCase} onBack={handleBack} />;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Assigned Cases</h2>
      {loading ? (
        <p>Loading cases...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignedCases.length === 0 ? (
            <p>No cases are assigned.</p>  
          ) : (
            assignedCases.map((caseItem) => (
              <div key={caseItem.caseId} className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                <h3 className="font-medium text-lg mb-2">Case Number: {caseItem.CaseNumber}</h3>
                <p className="text-gray-600 mb-1">SP: {caseItem.SpName}</p>
                <p className="text-gray-600 mb-1">PS: {caseItem.PsName}</p>
                <p className="text-gray-600 mb-1">Date: {new Date(caseItem.CaseDate).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-4">Type: {caseItem.CaseType === 1 ? 'Type 1' : 'Type 2'}</p>
                <button
                  onClick={() => handleViewCase(caseItem.caseId)}
                  className="flex items-center justify-center w-full bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <FaEye className="mr-2" /> View Case
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Task;
