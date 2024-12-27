import React, { useState, useEffect } from 'react';
import { showPPOfficeHeadUserList } from './api/get_head_user';

const PPHeadList = () => {
  const [headList, setHeadList] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchHeadList();
  }, []);

  const fetchHeadList = async () => {
    try {
      const result = await showPPOfficeHeadUserList(10); // Assuming EntryUserID is 10
      if (result.status === 0) {
        setHeadList(result.data);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Error fetching PP Head list');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">PP Head List</h2>
      {message && <p className="mb-4 text-red-600">{message}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Contact Number</th>
              <th className="px-4 py-2">License Number</th>
            </tr>
          </thead>
          <tbody>
            {headList.map((head) => (
              <tr key={head.ppHead_id} className="border-b">
                <td className="px-4 py-2">{head.ppHead_id}</td>
                <td className="px-4 py-2">{head.ppHeaduser_name}</td>
                <td className="px-4 py-2">{head.ppHeaduser_username}</td>
                <td className="px-4 py-2">{head.ppHeadpuser_email}</td>
                <td className="px-4 py-2">{head.ppHeaduser_contactnumber}</td>
                <td className="px-4 py-2">{head.ppHeaduser_licensenumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PPHeadList;

