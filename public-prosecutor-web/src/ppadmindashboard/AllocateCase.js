import React, { useState, useEffect } from 'react';
import { FaClipboardCheck } from 'react-icons/fa';
import { assignCase } from './api/assignCase';

const DistrictDropdown = ({ onDistrictChange }) => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('authToken');  // Retrieve the auth token
      const response = await fetch('http://localhost:8000/api/alldistrict', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // Pass the token in the header
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.status === 0 && result.data) {
        setDistricts(result.data);
      } else {
        setError('Failed to fetch districts');
      }
    } catch (err) {
      setError('Error fetching districts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading districts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <select
      onChange={(e) => onDistrictChange(e.target.value)}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select District</option>
      {districts.map((district) => (
        <option key={district.districtId} value={district.districtId}>
          {district.districtName}
        </option>
      ))}
    </select>
  );
};

const AllocateCase = ({ ppStaff }) => {
  const [caseAllocation, setCaseAllocation] = useState({
    staffId: '',
    caseNumber: '',
    caseDate: '',
    district: '',
    ps: '',
    caseType: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [psList, setPsList] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);  // State for storing case types

  useEffect(() => {
    if (caseAllocation.district) {
      fetchPoliceStations(caseAllocation.district);
    }
  }, [caseAllocation.district]);

  useEffect(() => {
    fetchCaseTypes();  // Fetch case types when component mounts
  }, []);

  const fetchPoliceStations = async (districtId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/allpolice?districtId=${districtId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.status === 0 && result.data) {
        setPsList(result.data);
      } else {
        setError('Failed to fetch police stations');
      }
    } catch (err) {
      setError('Error fetching police stations');
    }
  };

  const fetchCaseTypes = async () => {
    try {
      const token = localStorage.getItem('authToken');  // Retrieve the auth token
      const response = await fetch('http://localhost:8000/api/getcasetype', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // Pass the token in the header
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.status === 0 && result.data) {
        setCaseTypes(result.data);  // Store case types in the state
      } else {
        setError('Failed to fetch case types');
      }
    } catch (err) {
      setError('Error fetching case types');
    }
  };

  const handleCaseAllocation = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const result = await assignCase(
      parseInt(caseAllocation.staffId),
      caseAllocation.caseNumber,
      caseAllocation.caseDate,
      caseAllocation.district,
      caseAllocation.ps,
      caseAllocation.caseType
    );

    if (result.success) {
      setSuccess(result.message);
      setCaseAllocation({ staffId: '', caseNumber: '', caseDate: '', district: '', ps: '', caseType: '' });
    } else {
      setError(result.message);
    }
  };

  return (
    <div>
      {/* Title Section with Rounded Background */}
      <div className="flex justify-center items-center mb-6">
        <div className="text-center bg-opacity-80 backdrop-blur-md rounded-xl inline-block px-6 py-2">
          <h2 className="text-xl text-gray-800 font-bold text-center">
            Allocate Case
          </h2>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success:</strong>
          <span className="block sm:inline"> {success}</span>
        </div>
      )}

      {/* Case Allocation Form */}
      <form onSubmit={handleCaseAllocation} className="space-y-4">
        {/* District, PS, Case Type Dropdowns in a Single Row */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">
              District
            </label>
            <DistrictDropdown onDistrictChange={(districtId) => setCaseAllocation({ ...caseAllocation, district: districtId })} />
          </div>
          <div className="flex-1">
            <label htmlFor="ps" className="block text-sm font-medium text-gray-700">
              PS
            </label>
            <select
              id="ps"
              value={caseAllocation.ps}
              onChange={(e) => setCaseAllocation({ ...caseAllocation, ps: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select PS</option>
              {psList.map((ps) => (
                <option key={ps.id} value={ps.id}>
                  {ps.ps_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="caseType" className="block text-sm font-medium text-gray-700">
              Case Type
            </label>
            <select
              id="caseType"
              value={caseAllocation.caseType}
              onChange={(e) => setCaseAllocation({ ...caseAllocation, caseType: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Case Type</option>
              {caseTypes.map((caseType) => (
                <option key={caseType.CasetypeId} value={caseType.CasetypeId}>
                  {caseType.CasetypeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Case Number and Case Date Fields */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="caseNumber" className="block text-sm font-medium text-gray-700">
              Case Number
            </label>
            <input
              id="caseNumber"
              type="text"
              value={caseAllocation.caseNumber}
              onChange={(e) => setCaseAllocation({ ...caseAllocation, caseNumber: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="caseDate" className="block text-sm font-medium text-gray-700">
              Case Date
            </label>
            <input
              id="caseDate"
              type="date"
              value={caseAllocation.caseDate}
              onChange={(e) => setCaseAllocation({ ...caseAllocation, caseDate: e.target.value })}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Assign PP Staff Dropdown */}
        <div>
          <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">
            Assign to PP Staff
          </label>
          <select
            id="staffId"
            value={caseAllocation.staffId}
            onChange={(e) => setCaseAllocation({ ...caseAllocation, staffId: e.target.value })}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a staff member</option>
            {ppStaff.map((staff) => (
              <option key={staff.pp_id} value={staff.pp_id.toString()}>
                {staff.pp_name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
        >
          <FaClipboardCheck className="mr-2" /> Allocate Case
        </button>
      </form>
    </div>
  );
};

export default AllocateCase;
