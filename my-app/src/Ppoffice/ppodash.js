// PPOfficeDashboard.js

import React, { useState, useEffect } from 'react';

// Mock data for demonstration purposes
const mockCases = [
  { id: 1, caseNumber: 'CRM-001/24', status: 'Active', nextHearing: '2024-03-15', allocatedPP: 'John Doe' },
  { id: 2, caseNumber: 'CRA-002/24', status: 'Active', nextHearing: '2024-03-18', allocatedPP: 'Jane Smith' },
  { id: 3, caseNumber: 'CRR-003/24', status: 'Closed', nextHearing: null, allocatedPP: 'Alice Johnson' }
];

const PPOfficeDashboard = () => {
  const [cases, setCases] = useState(mockCases);
  const [searchTerm, setSearchTerm] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [ppName, setPPName] = useState('');
  const [updateCaseNumber, setUpdateCaseNumber] = useState('');
  const [hearingUpdate, setHearingUpdate] = useState('');

  const searchCase = () => {
    const results = cases.filter(c => 
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.allocatedPP.toLowerCase().includes(searchTerm.toLowerCase())
    );
    alert(`Found ${results.length} cases matching "${searchTerm}"`);
    // In a real application, you would update the UI to show search results
  };

  const allocatePP = () => {
    setCases(prevCases => {
      const updatedCases = prevCases.map(c => 
        c.caseNumber === caseNumber ? { ...c, allocatedPP: ppName } : c
      );
      alert(`Allocated PP ${ppName} to case ${caseNumber}`);
      return updatedCases;
    });
    setCaseNumber('');
    setPPName('');
  };

  const addHearingUpdate = () => {
    const caseItem = cases.find(c => c.caseNumber === updateCaseNumber);
    if (caseItem) {
      // In a real application, this would add the update to a list of updates for the case
      alert(`Added update to case ${updateCaseNumber}: ${hearingUpdate}`);
    } else {
      alert(`Case ${updateCaseNumber} not found`);
    }
    setUpdateCaseNumber('');
    setHearingUpdate('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">PP Office Dashboard</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ongoing Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map(caseItem => (
            <div key={caseItem.id} className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Case: {caseItem.caseNumber}</h3>
              <p className="mb-1">Status: {caseItem.status}</p>
              <p className="mb-1">Next Hearing: {caseItem.nextHearing || 'N/A'}</p>
              <p className="mb-1">Allocated PP: {caseItem.allocatedPP}</p>
              <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Search Case</h2>
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter case number or PP name"
            className="flex-grow mr-2 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={searchCase}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Search
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Allocate PP</h2>
        <div className="flex flex-col sm:flex-row">
          <input
            type="text"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            placeholder="Case number"
            className="flex-grow mb-2 sm:mb-0 sm:mr-2 p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={ppName}
            onChange={(e) => setPPName(e.target.value)}
            placeholder="PP name"
            className="flex-grow mb-2 sm:mb-0 sm:mr-2 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={allocatePP}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            Allocate
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add Hearing Update</h2>
        <div className="flex flex-col">
          <input
            type="text"
            value={updateCaseNumber}
            onChange={(e) => setUpdateCaseNumber(e.target.value)}
            placeholder="Case number"
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <textarea
            value={hearingUpdate}
            onChange={(e) => setHearingUpdate(e.target.value)}
            placeholder="Enter update"
            className="mb-2 p-2 border border-gray-300 rounded"
            rows="3"
          ></textarea>
          <button
            onClick={addHearingUpdate}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
          >
            Add Update
          </button>
        </div>
      </section>
    </div>
  );
};

export default PPOfficeDashboard;