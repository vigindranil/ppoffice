import React, { useState, useEffect } from 'react';
import { showPPOfficeAdminUserList } from './api/get_admin_user';

const PPOfficeAdminList = () => {
  const [adminList, setAdminList] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAdminList();
  }, []);

  const fetchAdminList = async () => {
    try {
      const result = await showPPOfficeAdminUserList(10); // Assuming EntryUserID is 10
      if (result.status === 0) {
        setAdminList(result.data);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Error fetching PP Office Admin list');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">PP Office Admin List</h2>
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
            {adminList.map((admin) => (
              <tr key={admin.ppadmin_id} className="border-b">
                <td className="px-4 py-2">{admin.ppadmin_id}</td>
                <td className="px-4 py-2">{admin.ppadmin_name}</td>
                <td className="px-4 py-2">{admin.ppadmin_username}</td>
                <td className="px-4 py-2">{admin.ppadmin_email}</td>
                <td className="px-4 py-2">{admin.ppadmin_contactnumber}</td>
                <td className="px-4 py-2">{admin.ppadmin_licensenumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PPOfficeAdminList;

