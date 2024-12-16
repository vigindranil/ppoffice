import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const CaseEntryPage = ({ initialData, onBack }) => {
  const [caseData, setCaseData] = useState({
    sendTo: '',
    copyTo: '',
    beginsRef: '',
    policeDistrict: '',
    policeStation: '',
    caseNumber: '',
    dated: '',
    section: '',
    hearingDate: '',
    hasPhotocopy: '',
    description: '',
    caseType: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [referenceOptions, setReferenceOptions] = useState([]);

  useEffect(() => {
    if (initialData) {
      setCaseData({
        sendTo: initialData.SpName || '',
        copyTo: initialData.PsName || '',
        beginsRef: initialData.beginsRef || '',
        policeDistrict: initialData.SpName || '',
        policeStation: initialData.PsName || '',
        caseNumber: initialData.CaseNumber || '',
        dated: initialData.CaseDate ? initialData.CaseDate.split('T')[0] : '',
        section: initialData.section || '',
        hearingDate: initialData.hearingDate || '',
        hasPhotocopy: initialData.hasPhotocopy || '',
        description: initialData.description || '',
        caseType: initialData.CaseType || ''
      });
    } else {
      fetchCaseAssignmentDetails();
    }
    fetchReferenceDetails();
  }, [initialData]);

  const fetchCaseAssignmentDetails = async () => {
    try {
      const ppStaffID = sessionStorage.getItem('AuthorityUserID');
      const authToken = localStorage.getItem('authToken');

      if (!authToken || !ppStaffID) {
        throw new Error('Authentication information is missing');
      }

      const response = await axios.get(`http://localhost:8000/api/getCaseAssign?ppStaffID=${ppStaffID}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (response.data.status === 0 && response.data.data && response.data.data.length > 0) {
        const caseAssignment = response.data.data[0];
        setCaseData((prevState) => ({
          ...prevState,
          caseNumber: caseAssignment.CaseNumber,
          sendTo: caseAssignment.SpName,
          copyTo: caseAssignment.PsName,
          policeDistrict: caseAssignment.SpName,
          policeStation: caseAssignment.PsName,
          dated: caseAssignment.CaseDate.split('T')[0],
          caseType: caseAssignment.CaseType
        }));
      } else {
        console.log('No case assignment data found');
      }
    } catch (error) {
      console.error('Error fetching case assignment details:', error);
    }
  };

  const fetchReferenceDetails = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token is missing');
      }

      const response = await axios.get('http://localhost:8000/api/showRefferenceDetails', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (response.data.status === 0 && response.data.data) {
        setReferenceOptions(response.data.data);
      } else {
        console.log('No reference details found');
      }
    } catch (error) {
      console.error('Error fetching reference details:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCaseData((prevState) => ({
      ...prevState,
      [name]: value,
      ...(name === 'sendTo' ? { policeDistrict: value } : {}),
      ...(name === 'copyTo' ? { policeStation: value } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token is missing');
      }

      const saveCaseData = {
        caseID: initialData.CaseAssignID,
        ref: parseInt(caseData.beginsRef),
        ipcAct: caseData.section,
        hearingDate: caseData.hearingDate,
        photocopycaseDiaryExist: caseData.hasPhotocopy === 'Yes' ? 1 : 0
      };

      const response = await axios.post('http://localhost:8000/api/savecase', saveCaseData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.status === 0) {
        setIsModalOpen(true);
        console.log('Case updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update case');
      }
    } catch (error) {
      console.error('Error updating case:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSendEmail = () => {
    console.log("Email sent to SP, PS, and people involved");
    setIsModalOpen(false);
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-lg">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-blue-500 hover:text-blue-600 focus:outline-none"
        >
          <FaArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-semibold">Case Entry</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <label htmlFor="sendTo" className="text-sm font-medium text-gray-700">Send To (SP/CP)</label>
            <input
              type="text"
              id="sendTo"
              name="sendTo"
              value={caseData.sendTo}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="copyTo" className="text-sm font-medium text-gray-700">Copy To (PS)</label>
            <input
              type="text"
              id="copyTo"
              name="copyTo"
              value={caseData.copyTo}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="beginsRef" className="text-sm font-medium text-gray-700">Begins Ref</label>
            <select
              id="beginsRef"
              name="beginsRef"
              value={caseData.beginsRef}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a reference</option>
              {referenceOptions.map((option) => (
                <option key={option.refferenceId} value={option.refferenceId}>
                  {option.refferenceName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">From</label>
            <input
              type="text"
              value="The Public Prosecutor, High Court, Calcutta"
              disabled
              className="mt-2 px-3 py-2 border rounded-md bg-gray-100 text-gray-500"
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="flex flex-col">
            <label htmlFor="policeDistrict" className="text-sm font-medium text-gray-700">Police District / Police Commissionerate</label>
            <input
              type="text"
              id="policeDistrict"
              name="policeDistrict"
              value={caseData.policeDistrict}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="policeStation" className="text-sm font-medium text-gray-700">P.S.</label>
            <input
              type="text"
              id="policeStation"
              name="policeStation"
              value={caseData.policeStation}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="caseNumber" className="text-sm font-medium text-gray-700">Case No.</label>
            <input
              type="text"
              id="caseNumber"
              name="caseNumber"
              value={caseData.caseNumber}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="dated" className="text-sm font-medium text-gray-700">Dated</label>
            <input
              type="date"
              id="dated"
              name="dated"
              value={caseData.dated}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="caseType" className="text-sm font-medium text-gray-700">Case Type</label>
            <input
              type="text"
              id="caseType"
              name="caseType"
              value={caseData.caseType}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <label htmlFor="section" className="text-sm font-medium text-gray-700">Section</label>
            <input
              type="text"
              id="section"
              name="section"
              value={caseData.section}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="hearingDate" className="text-sm font-medium text-gray-700">Hearing Date</label>
            <input
              type="date"
              id="hearingDate"
              name="hearingDate"
              value={caseData.hearingDate}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="hasPhotocopy" className="text-sm font-medium text-gray-700">Photocopy</label>
            <select
              id="hasPhotocopy"
              name="hasPhotocopy"
              value={caseData.hasPhotocopy}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={caseData.description}
              onChange={handleInputChange}
              rows="3"
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Update Case
          </button>
        </div>
      </form>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Notification</h3>
            <p className="text-gray-600 mb-4">
              Email will be sent to SP, PS, and people involved respectively as notification.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleModalClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={handleSendEmail}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseEntryPage;

