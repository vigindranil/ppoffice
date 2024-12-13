import React, { useState } from 'react';

const HearingUpdates = ({ cases, onUpdateAdded }) => {
  const [updateData, setUpdateData] = useState({
    caseId: '',
    date: '',
    notes: '',
    nextHearingDate: '',
    status: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/hearing-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        setUpdateData({
          caseId: '',
          date: '',
          notes: '',
          nextHearingDate: '',
          status: ''
        });
        onUpdateAdded();
      }
    } catch (error) {
      console.error('Error adding hearing update:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Add Hearing Update</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Case</label>
          <select
            value={updateData.caseId}
            onChange={(e) => setUpdateData({...updateData, caseId: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a case</option>
            {cases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.caseNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hearing Date</label>
          <input
            type="date"
            value={updateData.date}
            onChange={(e) => setUpdateData({...updateData, date: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={updateData.notes}
            onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Next Hearing Date</label>
          <input
            type="date"
            value={updateData.nextHearingDate}
            onChange={(e) => setUpdateData({...updateData, nextHearingDate: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Case Status</label>
          <select
            value={updateData.status}
            onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Update
        </button>
      </form>
    </div>
  );
};

export default HearingUpdates;

