import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const CaseDetails = ({ cases }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    const results = cases.filter(caseItem => 
      caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Case Details</h2>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by case number or description..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
          >
            <FaSearch className="mr-2" /> Search
          </button>
        </div>
      </form>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map((caseItem) => (
            <div key={caseItem.id} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium">Case Number: {caseItem.caseNumber}</h3>
                  <p className="text-gray-600">Type: {caseItem.caseType}</p>
                  <p className="text-gray-600">Court: {caseItem.court}</p>
                </div>
                <div>
                  <p className="text-gray-600">Next Hearing: {new Date(caseItem.nextHearingDate).toLocaleDateString()}</p>
                  <p className="text-gray-600">Status: {caseItem.status}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium">Description:</h4>
                <p className="text-gray-600">{caseItem.description}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-medium">Hearing History:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {caseItem.hearings?.map((hearing, index) => (
                    <li key={index}>
                      {new Date(hearing.date).toLocaleDateString()} - {hearing.notes}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseDetails;

