import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

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
    description: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    if (initialData) {
      setCaseData(prevState => ({
        ...prevState,
        caseNumber: initialData.caseNumber,
        description: initialData.description
      }));
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCaseData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(caseData)
      });

      if (response.ok) {
        // Open modal after successful submission
        setIsModalOpen(true);
        console.log('Case added successfully');
      }
    } catch (error) {
      console.error('Error adding case:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSendEmail = () => {
    // Simulate sending email notification or any other action after pressing 'Send'
    console.log("Email sent to SP, PS, and people involved");
    setIsModalOpen(false); // Close modal after sending
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-blue-500 hover:text-blue-600 focus:outline-none"
        >
          <FaArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-semibold">New Case Entry</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <label htmlFor="sendTo" className="text-sm font-medium text-gray-700">Send To (SP/CP)</label>
            <select
              id="sendTo"
              name="sendTo"
              value={caseData.sendTo}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select SP/CP</option>
              <option value="sp1">SP 1</option>
              <option value="sp2">SP 2</option>
              <option value="cp1">CP 1</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="copyTo" className="text-sm font-medium text-gray-700">Copy To (PS)</label>
            <select
              id="copyTo"
              name="copyTo"
              value={caseData.copyTo}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select PS</option>
              <option value="ps1">PS 1</option>
              <option value="ps2">PS 2</option>
              <option value="ps3">PS 3</option>
            </select>
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
              <option value="">Select Begins Ref</option>
              <option value="CRA (DB)">CRA (DB): Criminal appeal arising out of sentence for a period exceeding 7 years</option>
              <option value="CRA (SB)">CRA (SB): Criminal appeals in respect of sentence of any criminal court up to 7 years</option>
              <option value="CRM (A)">CRM (A): Anticipatory bail applications under Section 438 Cr. P.C.</option>
              <option value="CRM (DB)">CRM (DB): Bail applications where sentence may exceed imprisonment for seven years</option>
              <option value="CRM (NDPS)">CRM (NDPS): All bail applications pertaining to NDPS Act</option>
              <option value="CRM (SB)">CRM (SB): Bail applications where sentence does not exceed imprisonment for seven years</option>
              <option value="CRR">CRR: Criminal Revision</option>
              <option value="DR">DR: Death Reference</option>
              <option value="GE">GE: Govt. Appeal</option>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <label htmlFor="policeDistrict" className="text-sm font-medium text-gray-700">Police District / Police Commissionerate</label>
            <select
              id="policeDistrict"
              name="policeDistrict"
              value={caseData.policeDistrict}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Police District</option>
              <option value="district1">District 1</option>
              <option value="district2">District 2</option>
              <option value="commissionerate1">Commissionerate 1</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="policeStation" className="text-sm font-medium text-gray-700">P.S.</label>
            <select
              id="policeStation"
              name="policeStation"
              value={caseData.policeStation}
              onChange={handleInputChange}
              className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Police Station</option>
              <option value="ps1">Police Station 1</option>
              <option value="ps2">Police Station 2</option>
              <option value="ps3">Police Station 3</option>
            </select>
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
              <option value="">Select Photocopy Status</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
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
            Add Case
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
