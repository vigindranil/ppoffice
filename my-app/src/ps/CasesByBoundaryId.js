import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CasesByPsId = () => {
  const { psId } = useParams(); // Extract psId from URL parameters
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        // Using GET method to fetch data from the API endpoint
        const response = await axios.get('http://localhost:8000/api/showallCasesBypsId', {
          params: { psId: psId }, // Pass psId from URL parameters
        });

        if (response.data.status === 0) {
          setCases(response.data.data); // Set case data if found
        } else {
          setError('No cases found');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error('Error fetching cases:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [psId]); // Run the effect whenever psId changes

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Cases for Police Station ID: {psId}</h1>
      <table>
        <thead>
          <tr>
            <th>Sp Name</th>
            <th>Ps Name</th>
            <th>Case Date</th>
            <th>Case Type</th>
            <th>IPC Section</th>
            <th>Reference Number</th>
            <th>Begin Reference Name</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caseItem) => (
            <tr key={caseItem.CaseId}>
              <td>{caseItem.SpName}</td>
              <td>{caseItem.PsName}</td>
              <td>{new Date(caseItem.CaseDate).toLocaleDateString()}</td>
              <td>{caseItem.CaseType}</td>
              <td>{caseItem.IPCSection}</td>
              <td>{caseItem.ReferenceNumber}</td>
              <td>{caseItem.BeginReferenceName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CasesByPsId;
