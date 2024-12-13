// DistrictDropdown.js
import React, { useState, useEffect } from 'react';

const DistrictDropdown = ({ onDistrictChange }) => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/alldistrict');
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

export default DistrictDropdown;