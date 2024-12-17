import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { fetchReferenceDetails } from './api/referenceDetails';
import { fetchCaseTypes } from './api/casetype';
import { saveCase } from './api/casesave';
import { sendEmail } from './api/sendmail';

const NewCaseEntry = ({ onBack }) => {
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

  const [districts, setDistricts] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [referenceDetails, setReferenceDetails] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [savedCaseId, setSavedCaseId] = useState(null);

  useEffect(() => {
    fetchDistricts();
    async function fetchInitialData() {
      try {
        const [references, types] = await Promise.all([
          fetchReferenceDetails(),
          fetchCaseTypes()
        ]);
        setReferenceDetails(references);
        setCaseTypes(types);
      } catch (error) {
        setError(error.message || 'Error fetching initial data');
      }
    }
    fetchInitialData();
  }, []);

  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/alldistrict', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 0 && result.data) {
        setDistricts(result.data);
      } else {
        setError(result.message || 'Failed to fetch districts');
      }
    } catch (error) {
      setError(error.message || 'Error fetching districts');
      setDistricts([]);
    }
  };

  const fetchPoliceStations = async (districtId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/showpoliceBydistrict?districtId=${districtId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 0 && result.data) {
        setPoliceStations(result.data);
      } else {
        setError(result.message || 'Failed to fetch police stations');
      }
    } catch (error) {
      setError(error.message || 'Error fetching police stations');
      setPoliceStations([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCaseData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === 'sendTo') {
      const selectedDistrict = districts.find(district => district.districtName === value);
      if (selectedDistrict) {
        fetchPoliceStations(selectedDistrict.districtId);
        setCaseData(prevState => ({
          ...prevState,
          policeDistrict: value,
          copyTo: '',
          policeStation: ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedDistrict = districts.find(d => d.districtName === caseData.sendTo);
      const selectedPoliceStation = policeStations.find(ps => ps.ps_name === caseData.copyTo);
      const selectedCaseType = caseTypes.find(ct => ct.CasetypeName === caseData.caseType);
      const selectedReference = referenceDetails.find(r => r.refferenceName === caseData.beginsRef);

      const caseDataToSave = {
        CaseNumber: caseData.caseNumber,
        EntryUserID: "1", // Assuming a default user ID, you might want to get this from the logged-in user
        CaseDate: caseData.dated,
        DistrictID: selectedDistrict ? selectedDistrict.districtId : null,
        psID: selectedPoliceStation ? selectedPoliceStation.id : null,
        caseTypeID: selectedCaseType ? selectedCaseType.CasetypeId : null,
        ref: selectedReference ? selectedReference.refferenceId : null,
        ipcAct: caseData.section,
        hearingDate: caseData.hearingDate,
        sendTo: selectedDistrict ? selectedDistrict.districtId : null,
        copyTo: selectedPoliceStation ? selectedPoliceStation.id : null,
        photocopycaseDiaryExist: caseData.hasPhotocopy === 'Yes' ? 1 : 0
      };

      const result = await saveCase(caseDataToSave);
      console.log('Case saved successfully:', result);
      setSavedCaseId(result.CaseID);
      setIsModalOpen(true);
    } catch (error) {
      setError(error.message || 'Error submitting case entry');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSendEmail = async () => {
    try {
      if (!savedCaseId) {
        throw new Error('No saved case ID found');
      }
      const result = await sendEmail(savedCaseId);
      console.log("Email sent successfully:", result);
      setIsModalOpen(false);
    } catch (error) {
      setError(error.message || 'Error sending email');
    }
  };

  return (
    <div className="h-full overflow-auto bg-white shadow-lg rounded-lg">
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 text-blue-500 hover:text-blue-600 focus:outline-none"
          >
            <FaArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-semibold">Case Entry</h2>
        </div>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.districtId} value={district.districtName}>
                    {district.districtName}
                  </option>
                ))}
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
                <option value="">Select Police Station</option>
                {policeStations.map((station) => (
                  <option key={station.id} value={station.ps_name}>
                    {station.ps_name}
                  </option>
                ))}
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
                <option value="">Select Reference</option>
                {referenceDetails.map((ref) => (
                  <option key={ref.refferenceId} value={ref.refferenceName}>
                    {ref.refferenceName}
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
                value={caseData.copyTo}
                readOnly
                className="mt-2 px-3 py-2 border rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <select
                id="caseType"
                name="caseType"
                value={caseData.caseType}
                onChange={handleInputChange}
                className="mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Case Type</option>
                {caseTypes.map((type) => (
                  <option key={type.CasetypeId} value={type.CasetypeName}>
                    {type.CasetypeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

          <div className="text-center">
            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update Case
            </button>
          </div>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Case Saved Successfully</h3>
            <p className="text-gray-600 mb-4">
              Your case has been saved. Case ID: {savedCaseId}
            </p>
            <p className="text-gray-600 mb-4">
              Do you want to send an email notification?
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
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
    </div>
  );
};

export default NewCaseEntry;

