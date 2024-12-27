import React, { useState } from 'react';

const NewCaseEntryForm = () => {
  const [formData, setFormData] = useState({
    sendTo: '',
    copyTo: '',
    beginsRef: '',
    policeDistrict: '',
    policeStation: '',
    caseNo: '',
    dated: '',
    section: '',
    hearingDate: '',
    hasPhotocopy: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Case Entry</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sendTo" className="block text-sm font-medium text-gray-700">Send To (SP/CP)</label>
          <select
            id="sendTo"
            name="sendTo"
            value={formData.sendTo}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select SP/CP</option>
            <option value="sp1">SP 1</option>
            <option value="sp2">SP 2</option>
            <option value="cp1">CP 1</option>
          </select>
        </div>

        <div>
          <label htmlFor="copyTo" className="block text-sm font-medium text-gray-700">Copy To (PS)</label>
          <select
            id="copyTo"
            name="copyTo"
            value={formData.copyTo}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select PS</option>
            <option value="ps1">PS 1</option>
            <option value="ps2">PS 2</option>
            <option value="ps3">PS 3</option>
          </select>
        </div>

        <div>
          <label htmlFor="beginsRef" className="block text-sm font-medium text-gray-700">Begins Ref</label>
          <select
            id="beginsRef"
            name="beginsRef"
            value={formData.beginsRef}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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

        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input
            type="text"
            value="The Public Prosecutor, High Court, Calcutta"
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="policeDistrict" className="block text-sm font-medium text-gray-700">Police District / Police Commissionerate</label>
          <select
            id="policeDistrict"
            name="policeDistrict"
            value={formData.policeDistrict}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select Police District</option>
            <option value="district1">District 1</option>
            <option value="district2">District 2</option>
            <option value="commissionerate1">Commissionerate 1</option>
          </select>
        </div>

        <div>
          <label htmlFor="policeStation" className="block text-sm font-medium text-gray-700">P.S.</label>
          <select
            id="policeStation"
            name="policeStation"
            value={formData.policeStation}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select Police Station</option>
            <option value="ps1">Police Station 1</option>
            <option value="ps2">Police Station 2</option>
            <option value="ps3">Police Station 3</option>
          </select>
        </div>

        <div>
          <label htmlFor="caseNo" className="block text-sm font-medium text-gray-700">Case No.</label>
          <input
            type="text"
            id="caseNo"
            name="caseNo"
            value={formData.caseNo}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="dated" className="block text-sm font-medium text-gray-700">Dated</label>
          <input
            type="date"
            id="dated"
            name="dated"
            value={formData.dated}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="section" className="block text-sm font-medium text-gray-700">U/S IPC / Bnss Act</label>
          <input
            type="text"
            id="section"
            name="section"
            value={formData.section}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">M/S VS</label>
          <input
            type="text"
            value="State"
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="hearingDate" className="block text-sm font-medium text-gray-700">Hearing Date in Court</label>
          <input
            type="date"
            id="hearingDate"
            name="hearingDate"
            value={formData.hearingDate}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Photocopy of the Case Diary with M.O.E.</label>
          <div className="mt-2 space-x-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="hasPhotocopy"
                value="yes"
                checked={formData.hasPhotocopy === 'yes'}
                onChange={handleInputChange}
                className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="hasPhotocopy"
                value="no"
                checked={formData.hasPhotocopy === 'no'}
                onChange={handleInputChange}
                className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2">No</span>
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit New Case
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCaseEntryForm;

