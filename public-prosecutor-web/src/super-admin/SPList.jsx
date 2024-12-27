import React, { useState, useEffect } from 'react';
import { showSPUser } from './api/get_sp_user';

const SPList = () => {
  const [spList, setSPList] = useState([]);
  const [message, setMessage] = useState('');
  const [districtID, setDistrictID] = useState('');

  useEffect(() => {
    if (districtID) {
      fetchSPList();
    }
  }, [districtID]);

  const fetchSPList = async () => {
    try {
      const result = await showSPUser(10, parseInt(districtID)); // Assuming EntryUserID is 10
      if (result.status === 0) {
        setSPList(result.data);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Error fetching SP list');
    }
  };

  const handleDistrictChange = (e) => {
    setDistrictID(e.target.value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">SP List</h2>
      <div className="mb-4">
        <input
          type="number"
          value={districtID}
          onChange={handleDistrictChange}
          placeholder="Enter District ID"
          className="p-2 border rounded"
        />
      </div>
      {message && <p className="mb-4 text-red-600">{message}</p>}
      {spList.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Contact Number</th>
                <th className="px-4 py-2">WBP ID</th>
              </tr>
            </thead>
            <tbody>
              {spList.map((sp) => (
                <tr key={sp.sp_id} className="border-b">
                  <td className="px-4 py-2">{sp.sp_id}</td>
                  <td className="px-4 py-2">{sp.sp_name}</td>
                  <td className="px-4 py-2">{sp.sp_username}</td>
                  <td className="px-4 py-2">{sp.sp_email}</td>
                  <td className="px-4 py-2">{sp.sp_contactnumber}</td>
                  <td className="px-4 py-2">{sp.sp_WbpId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No SP users found for the given District ID.</p>
      )}
    </div>
  );
};

export default SPList;

