"use client";
import React, { useState, useEffect } from 'react';

export default function EmailDetailsComponent({ emailDetails }) {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewEmailParams, setViewEmailParams] = useState(null);

  // Function to fetch email details based on mailId and caseId
  const fetchEmailDetails = async (mailId, caseId) => {
    setLoading(true);
    setError(null);

    const requestData = {
      mailId: mailId,
      caseId: caseId,
      authorityTypeId: authorityTypeId, // Example ID
      boundaryId:  boundaryId// Example ID
    };

    try {
        const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/emailRead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.status === 0) {
        // If API response is successful, set the selected email details
        setSelectedEmail(data.data);
      } else {
        setError('Failed to read email details');
      }
    } catch (err) {
      setError('An error occurred while fetching email details');
    } finally {
      setLoading(false);
    }
  };

  // useEffect hook to call the API when the selected email params change
  useEffect(() => {
    if (viewEmailParams) {
      fetchEmailDetails(viewEmailParams.mailId, viewEmailParams.caseId);
    }
  }, [viewEmailParams]); // The effect depends on the viewEmailParams state

  // Handle the click of the View Email button
  const handleViewEmail = (mailId, caseId) => {
    setViewEmailParams({ mailId, caseId });
  };

  return (
    <CardContent className="p-4 space-y-6">
      {emailDetails && emailDetails.length > 0 ? (
        <div>
          <h3 className="text-xl font-semibold mb-4">Case Details:</h3>
          <div className="space-y-4">
            {emailDetails.map((email) => (
              <div
                key={email.id}
                className="p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="text-lg font-medium mb-2">
                  <p className="text-blue-600">Mail ID: <span className="font-normal text-gray-800">{email.mailId}</span></p>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Case Number:</strong> {email.caseNumber}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>IPC Section:</strong> {email.Ipc_section}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Hearing Date:</strong> {new Date(email.Case_hearingDate).toLocaleString()}
                </p>

                {/* Button to view email details */}
                <button
                  onClick={() => handleViewEmail(email.id, email.CaseId)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? "Loading..." : "View Email"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">No email details available</p>
      )}

      {selectedEmail && (
        <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h4 className="text-xl font-semibold">Selected Email Information</h4>
          <pre className="text-sm text-gray-700">{JSON.stringify(selectedEmail, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 border border-red-300 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </CardContent>
  );
}
