"use client";
import React, { useState, useEffect } from "react";
import {
  fetchCaseTypes,
  fetchReferenceDetails,
  sendEmail,
  saveCase,
} from "@/app/api";
import { useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import { serviceUrl } from "@/app/contants";

export default function Home() {
  const [user, setUser] = useState("");
  const [token, setToken] = useState("");

  const authtoken = useSelector((state) => state.auth.token);
  const userDetails = useSelector((state) => state.auth.user);

  const [caseData, setCaseData] = useState({
    sendTo: "",
    copyTo: "",
    beginsRef: "",
    policeDistrict: "",
    policeStation: "",
    caseNumber: "",
    dated: "",
    section: "",
    hearingDate: "",
    hasPhotocopy: "",
    description: "",
    caseType: "",
  });

  const [districts, setDistricts] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);
  const [referenceDetails, setReferenceDetails] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setToken(authtoken);

    const user_data = JSON.parse(decrypt(userDetails));
    setUser(user_data);
    token && fetchDistricts();

    fetchInitialData();
  }, [token]);
  console.log(token);
  async function fetchInitialData() {
    try {
      
      const [references, types] = await Promise.all([
        fetchReferenceDetails(),
        fetchCaseTypes(),
      ]);
      console.log("hii");
      setReferenceDetails(references);
      setCaseTypes(types);
    } catch (error) {
      setError("Error fetching initial data");
    }
  }

  const fetchDistricts = async () => {
    try {
      const response = await fetch(`${serviceUrl}/api/alldistrict`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 0 && result.data) {
        setDistricts(result.data);
        console.log(result.data);
      } else {
        setError(result.message || "Failed to fetch districts");
      }
    } catch (error) {
      setError(error.message || "Error fetching districts");
      setDistricts([]);
    }
  };

  const fetchPoliceStations = async (districtId) => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `${serviceUrl}/api/showpoliceBydistrict?districtId=${districtId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status === 0 && result.data) {
        setPoliceStations(result.data);
      } else {
        setError("Failed to fetch police stations");
      }
    } catch (error) {
      setError("Error fetching police stations");
      setPoliceStations([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCaseData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "sendTo") {
      const selectedDistrict = districts.find(
        (district) => district.districtName === value
      );
      if (selectedDistrict) {
        fetchPoliceStations(selectedDistrict.districtId);
        setCaseData((prevState) => ({
          ...prevState,
          policeDistrict: value,
          copyTo: "",
          policeStation: "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedDistrict = districts.find(
        (d) => d.districtName === caseData.sendTo
      );
      const selectedPoliceStation = policeStations.find(
        (ps) => ps.ps_name === caseData.copyTo
      );
      const selectedCaseType = caseTypes.find(
        (ct) => ct.CasetypeName === caseData.caseType
      );
      const selectedReference = referenceDetails.find(
        (r) => r.refferenceName === caseData.beginsRef
      );

      const caseDataToSave = {
        CaseNumber: caseData.caseNumber,
        EntryUserID: "1",
        CaseDate: caseData.dated,
        DistrictID: selectedDistrict ? selectedDistrict.districtId : null,
        psID: selectedPoliceStation ? selectedPoliceStation.id : null,
        caseTypeID: selectedCaseType ? selectedCaseType.CasetypeId : null,
        ref: selectedReference ? selectedReference.refferenceId : null,
        ipcAct: caseData.section,
        hearingDate: caseData.hearingDate,
        sendTo: selectedDistrict ? selectedDistrict.districtId : null,
        copyTo: selectedPoliceStation ? selectedPoliceStation.id : null,
        photocopycaseDiaryExist: caseData.hasPhotocopy === "Yes" ? 1 : 0,
      };

      const result = await saveCase(caseDataToSave);
      console.log("Case saved successfully:", result);
      setSavedCaseId(result.CaseID);
      setIsModalOpen(true);
    } catch (error) {
      setError("Error submitting case entry");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSendEmail = async () => {
    try {
      if (!savedCaseId) {
        throw new Error("No saved case ID found");
      }
      const result = await sendEmail(savedCaseId);
      console.log("Email sent successfully:", result);
      setIsModalOpen(false);
    } catch (error) {
      setError("Error sending email");
    }
  };
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Legal Case Management System
      </h1>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold justify-items-center mb-6">
          New Case Entry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label
                htmlFor="sendTo"
                className="block text-sm font-medium text-gray-700"
              >
                Send To (SP/CP)
              </label>
              <select
                id="sendTo"
                name="sendTo"
                value={caseData.sendTo}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option
                    key={district.districtId}
                    value={district.districtName}
                  >
                    {district.districtName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="copyTo"
                className="block text-sm font-medium text-gray-700"
              >
                Copy To (PS)
              </label>
              <select
                id="copyTo"
                name="copyTo"
                value={caseData.copyTo}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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

            <div>
              <label
                htmlFor="beginsRef"
                className="block text-sm font-medium text-gray-700"
              >
                Begins Ref
              </label>
              <select
                id="beginsRef"
                name="beginsRef"
                value={caseData.beginsRef}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                From
              </label>
              <input
                type="text"
                value="The Public Prosecutor, High Court, Calcutta"
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="caseNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Case No.
              </label>
              <input
                type="text"
                id="caseNumber"
                name="caseNumber"
                value={caseData.caseNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label
                htmlFor="dated"
                className="block text-sm font-medium text-gray-700"
              >
                Dated
              </label>
              <input
                type="date"
                id="dated"
                name="dated"
                value={caseData.dated}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label
                htmlFor="caseType"
                className="block text-sm font-medium text-gray-700"
              >
                Case Type
              </label>
              <select
                id="caseType"
                name="caseType"
                value={caseData.caseType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label
                htmlFor="section"
                className="block text-sm font-medium text-gray-700"
              >
                Section
              </label>
              <input
                type="text"
                id="section"
                name="section"
                value={caseData.section}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label
                htmlFor="hearingDate"
                className="block text-sm font-medium text-gray-700"
              >
                Hearing Date
              </label>
              <input
                type="date"
                id="hearingDate"
                name="hearingDate"
                value={caseData.hearingDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label
                htmlFor="hasPhotocopy"
                className="block text-sm font-medium text-gray-700"
              >
                Photocopy
              </label>
              <select
                id="hasPhotocopy"
                name="hasPhotocopy"
                value={caseData.hasPhotocopy}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={caseData.description}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit Case
            </button>
          </div>
        </form>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Case Saved Successfully
              </h3>
              <p className="text-gray-600 mb-4">
                Your case has been saved. Case ID: {savedCaseId}
              </p>
              <p className="text-gray-600 mb-4">
                Do you want to send an email notification?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
      </div>
    </main>
  );
}
