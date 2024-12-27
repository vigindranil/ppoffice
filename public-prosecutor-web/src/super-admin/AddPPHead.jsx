import React, { useState } from 'react';
import { addPPHead } from './api/create_head_user';

const AddPPHead = () => {
  const [formData, setFormData] = useState({
    Username: '',
    UserPassword: '',
    EntryUserID: 10, // Assuming this is the current user's ID
    FullName: '',
    ContractNo: '',
    Email: '',
    LicenseNumber: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await addPPHead(formData);
      setMessage(result.message);
      if (result.status === 0) {
        setFormData({
          Username: '',
          UserPassword: '',
          EntryUserID: 10,
          FullName: '',
          ContractNo: '',
          Email: '',
          LicenseNumber: ''
        });
      }
    } catch (error) {
      setMessage('Error adding PP Head');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Add PP Head</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="Username"
          value={formData.Username}
          onChange={handleChange}
          placeholder="Username"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="UserPassword"
          value={formData.UserPassword}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="FullName"
          value={formData.FullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          name="ContractNo"
          value={formData.ContractNo}
          onChange={handleChange}
          placeholder="Contact Number"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="Email"
          value={formData.Email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="LicenseNumber"
          value={formData.LicenseNumber}
          onChange={handleChange}
          placeholder="License Number"
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add PP Head
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default AddPPHead;

