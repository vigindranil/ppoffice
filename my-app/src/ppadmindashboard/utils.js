import { useState, useEffect } from 'react';
import { FaChevronRight } from 'react-icons/fa';


export const useCaseFetching = (isAssigned) => {
  const [cases, setCases] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCases();
  }, [isAssigned]);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/showallCase?is_Assigned=${isAssigned ? 1 : 0}`, {
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
        throw new Error(result.message || 'Failed to fetch cases');
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      setError(error.message || 'Error fetching cases');
    }
  };

  return { cases, error, fetchCases };
};

export const renderCaseList = (cases, currentPage, casesPerPage, handleCaseClick) => {
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
      </div>
    </div>
  );
};

export const renderCaseDetails = (caseItem, ppStaff, assignedStaff, setAssignedStaff, remarks, setRemarks, handleAssignCase) => {
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
            className=" px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            className="mt-4  px-4 py-2 bg-emerald-600 text-white text-base font-medium rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
            onClick={handleAssignCase}
          >
            Assign Case
          </button>
        </div>
      )}
    </div>
  );
};

