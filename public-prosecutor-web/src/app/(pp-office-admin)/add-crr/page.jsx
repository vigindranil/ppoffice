"use client"

import React, { useState, useEffect } from "react";
import {
  createCrrOfficeAdmin,
  getcasetype,
  showRefferenceDetails,
  showIpcSection,
  showBnsSection,
  showIbsByBnsId,
  uploadCaseDocuments
} from "@/app/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomAlertDialog } from "@/components/custom-alert-dialog";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { useSelector } from "react-redux";
import { Calendar, FileText, Hash, Clock, Trash, Plus, X } from "lucide-react";
import { decrypt } from "@/utils/crypto";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { postRequest } from "@/app/commonAPI";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Constants
const DEFAULT_CRM_ID = '7'; // The ID to be defaulted and read-only
const OTHER_SECTION_BNS_ID = 534;
const MAX_STANDARD_SECTIONS = 10;
const MAX_OTHER_ROWS = 10;
const MAX_TOTAL_ENTRIES = 20; // Combined sections limit
const MAX_FILE_SIZE_MB = 50;

const AddCrrPage = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const encryptedUser = useSelector((state) => state.auth.user);

  // --- Simplified State ---
  const [activeTab, setActiveTab] = useState("add")
  const [referenceList, setReferenceList] = useState([]); // For Reference Type dropdown
  const [caseTypeList, setCaseTypeList] = useState([]); // For Case Type dropdown
  const [ipcActList, setIpcActList] = useState([]);
  const [bnsSectionList, setBnsSectionList] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Dropdown open/close state
  const [openCaseType, setOpenCaseType] = useState(false);
  const [openReference, setOpenReference] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [openIpcAct, setOpenIpcAct] = useState(false);

  // IPC/BNS Section State
  const [selectedIpcSections, setSelectedIpcSections] = useState([]); 
  const [otherSectionsList, setOtherSectionsList] = useState([]);
  const [currentOtherIpc, setCurrentOtherIpc] = useState(""); 
  const [currentOtherBns, setCurrentOtherBns] = useState("");
  const [useIpcDisplay, setUseIpcDisplay] = useState(true);
  const [ipcToBnsMap, setIpcToBnsMap] = useState({}); 

  const [currentReference, setCurrentReference] = useState({
    crmID: "7",
    refferenceNumber: "",
    refferenceyear: new Date().getFullYear().toString(),
  })

  // Form data for adding new CRR
  const [addFormData, setAddFormData] = useState({
    crmID: "7",              // Reference Type ID
    caseTypeID: "",         // CRR Case Type ID
    filingDate: "",
    petitionName: "",
    hearingDate: "",
    CourtCaseDescription: "",
    refferenceNumber: "",   // Reference Number
    refferenceyear: "",     // Reference Year
    EntryUserID: ""
    // ipcSections and documents handled separately
  });

  // Years for reference dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  // --- Effects ---

  // Initialize User and default form data
  useEffect(() => {
    try {
      const decoded_user = JSON.parse(decrypt(encryptedUser));
      setUser(decoded_user);
      setAddFormData((prevState) => ({
        ...prevState,
        EntryUserID: decoded_user?.AuthorityUserID || "",
        filingDate: new Date().toISOString().split("T")[0],
        refferenceyear: currentYear.toString(),
        crmID: DEFAULT_CRM_ID // Set default CRM ID here
      }));
    } catch (error) {
      console.error("Error decoding user:", error);
      openAlert("error", "Failed to initialize user session.");
    }
  }, [encryptedUser]);

  // Fetch dropdown data
  useEffect(() => {
    if (user?.AuthorityUserID) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        try {
          // Fetch all necessary data
          const [caseTypes, references, ipcSections, bnsSections] = await Promise.all([
            getcasetype(),
            showRefferenceDetails(),
            showIpcSection(),
            showBnsSection(),
          ]);

          setCaseTypeList(caseTypes || []);
          setReferenceList(references || []);
          setIpcActList(ipcSections || []);
          setBnsSectionList(bnsSections || []);

          setAddFormData(prev => ({ ...prev, crmID: DEFAULT_CRM_ID }));

        } catch (err) { /* ... error handling ... */ }
        finally { setIsLoading(false); }
      };
      fetchInitialData();
    }
  }, [user]);

  // --- Handlers ---

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSelectChange = (name, value) => {
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addIpcSection = async (bnsId) => {
    // Calculate current total entries
    const currentTotal = selectedIpcSections.length + otherSectionsList.length;

    if (currentTotal >= MAX_TOTAL_ENTRIES) {
      openAlert("error", `Maximum ${MAX_TOTAL_ENTRIES} total entries (Standard + Other Rows) allowed.`);
      return;
    }
    if (selectedIpcSections.length >= MAX_STANDARD_SECTIONS) {
      openAlert("error", `Maximum ${MAX_STANDARD_SECTIONS} standard IPC/BNS sections allowed.`);
      return;
    }

    if (selectedIpcSections.some((item) => item.bnsId.toString() === bnsId)) {
      openAlert("error", "This section is already added")
      return
    }
    // Find in both IPC and BNS lists to support dropdown toggle
    const ipcItem = ipcActList.find((ipc) => ipc.bnsId.toString() === bnsId)
    const bnsItem = bnsSectionList.find((bns) => bns.bnsId.toString() === bnsId)

    const label = useIpcDisplay ? ipcItem?.ipcSection : bnsItem?.bnsSection
    if (!label) {
      openAlert("error", "Invalid section selection")
      return
    }

    // Always store the ipcActList item structure for consistency
    const selectedData = ipcItem || {
      bnsId: bnsItem.bnsId,
      ipcSection: bnsItem.bnsSection,
    }

    setSelectedIpcSections((prev) => [...prev, selectedData])

    // Fetch conversion mapping
    try {
      const result = await showIbsByBnsId(bnsId)
      if (Array.isArray(result) && result.length > 0) {
        const mapped =
          useIpcDisplay ? result[0].BnsSection : result[0].IpcSection
        setIpcToBnsMap((prev) => ({
          ...prev,
          [bnsId]: mapped || "",
        }))
      }
    } catch (err) {
      console.error("Failed to fetch mapping", err)
      setIpcToBnsMap((prev) => ({
        ...prev,
        [bnsId]: `BNS ID: ${bnsId}`, // Fallback display
      }))
    }
  }

  const removeIpcSection = (bnsId) => {
    setSelectedIpcSections(prev => prev.filter(item => item.bnsId !== bnsId));
    setIpcToBnsMap(prev => {
      const newMap = { ...prev };
      delete newMap[bnsId];
      return newMap;
    });
  };

  const addOtherSectionRow = () => {
    const currentTotal = selectedIpcSections.length + otherSectionsList.length;
    if (currentTotal >= MAX_TOTAL_ENTRIES) { openAlert("error", `Maximum ${MAX_TOTAL_ENTRIES} sections allowed.`); return; }
    if (otherSectionsList.length >= MAX_OTHER_ROWS) { openAlert("error", `Maximum ${MAX_OTHER_ROWS} 'Other' section rows allowed.`); return; }

    const ipcInput = currentOtherIpc.trim();
    const bnsInput = currentOtherBns.trim();
    if (!ipcInput && !bnsInput) { openAlert("error", "Please enter at least an IPC Act or BNS Section."); return; }

    setOtherSectionsList(prev => [...prev, { id: Date.now(), ipcValue: ipcInput, bnsValue: bnsInput }]);
    setCurrentOtherIpc("");
    setCurrentOtherBns("");
  };

  const removeOtherSectionRow = (idToRemove) => {
    setOtherSectionsList(prev => prev.filter(section => section.id !== idToRemove));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        openAlert("error", `${file.name} exceeds ${MAX_FILE_SIZE_MB} MB`);
        return false;
      }
      if (!["application/pdf"].includes(file.type)) {
        openAlert("error", `${file.name} is not a valid format (PDF only)`);
        return false;
      }
      return true;
    });
    // Prevent duplicates
    const newFiles = validFiles.filter(vf => !documents.some(df => df.name === vf.name && df.size === vf.size));
    setDocuments(prev => [...prev, ...newFiles]);
    // Clear the input value to allow selecting the same file again after removing it
    e.target.value = null;
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // --- Submission ---
  const handleAddCrr = async () => {
    setIsLoading(true);
    let uploadErrorOccurred = false;

    try {
      // --- Validation ---
      const requiredFields = [
        // { field: "crmID", label: "Reference Type" },
        { field: "caseTypeID", label: "Case Type" },
        { field: "filingDate", label: "Filing Date" },
        { field: "petitionName", label: "Petitioner Name" },
        { field: "hearingDate", label: "Hearing Date" },
        { field: "CourtCaseDescription", label: "Court Case Description" },
        { field: "refferenceNumber", label: "Reference Number" },
        { field: "refferenceyear", label: "Reference Year" },
        { field: "EntryUserID", label: "User ID (Internal)" }, // Should always be present
      ];

      const missingFields = requiredFields.filter(({ field }) => !addFormData[field]);
      if (missingFields.length > 0) {
        throw `Please fill in the following required fields: ${missingFields.map((f) => f.label).join(", ")}`;
      }
      if (addFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length > 100) {
        throw "Court Case Description cannot exceed 100 words.";
      }

      // --- Payload ---

      const finalStandardSections = selectedIpcSections.map(section => ({
        bnsId: section.bnsId.toString(),
        otherIpcAct: "",
        otherBnsAct: ""
      }));
      const finalOtherSections = otherSectionsList.map(row => ({
        bnsId: OTHER_SECTION_BNS_ID.toString(),
        otherIpcAct: row.ipcValue,
        otherBnsAct: row.bnsValue
      }));
      const combinedIpcSections = [...finalStandardSections, ...finalOtherSections];

      const apiData = {
        ...addFormData,
        ipcSections: combinedIpcSections, // Add sections to payload
      };

      console.log("Submitting CRR Data:", apiData);

      // --- API Call ---
      const result = await createCrrOfficeAdmin(apiData); // Calls saveCrr controller

      if (result && result.status === 0 && result.data?.CrrID && result.data?.CaseID) {
        const { CrrID, CaseID } = result.data; // Get CaseID for document upload

        // --- Document Upload ---
        if (documents.length > 0) {
          console.log(`Uploading ${documents.length} documents for CaseID: ${CaseID}`);
          try {
            await uploadCaseDocuments(CaseID, documents, user.AuthorityUserID);
            console.log("Documents uploaded successfully.");
          } catch (uploadError) { // Catch specific upload error
            uploadErrorOccurred = true; // Set the flag
            console.error("Document upload failed:", uploadError);
            openAlert("warning", `CRR ${CrrID} created, but document upload failed: ${uploadError.message}`);
          }
        }

        if (!uploadErrorOccurred) {
          openAlert("success", `CRR created successfully with ID: ${CrrID}`);
        }


        // --- Reset Form ---
        setAddFormData({
          crmID: DEFAULT_CRM_ID, // Reset to default
          caseTypeID: "",
          filingDate: new Date().toISOString().split("T")[0],
          petitionName: "",
          hearingDate: "",
          CourtCaseDescription: "",
          refferenceNumber: "",
          refferenceyear: currentYear.toString(),
          EntryUserID: user?.AuthorityUserID || "",
        });
        setSelectedIpcSections([]);
        setOtherSectionsList([]);
        setCurrentOtherIpc("");
        setCurrentOtherBns("");
        setDocuments([]);
        setIpcToBnsMap({});
        setOpenCaseType(false);
        setOpenReference(false); // Keep closed
        setOpenYear(false);
        setOpenIpcAct(false);

      } else {
        // Handle potential API errors even if status code was 2xx
        throw new Error(result?.message || "Failed to create CRR. Unknown error.");
      }

    } catch (err) {
      console.error("Error adding CRR:", err);
      const errorMessage = err instanceof Error ? err.message : (typeof err === 'string' ? err : "An unknown error occurred");
      openAlert("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    closeAlert();
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <CustomAlertDialog
          isOpen={isOpen}
          alertType={alertType}
          alertMessage={alertMessage}
          onClose={closeAlert}
          onConfirm={handleConfirm}
        />

        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4 overflow-hidden border-slate-500">
          <CardHeader className="mb-0 bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3">
            <CardTitle className="text-white text-xl">CRR</CardTitle>
          </CardHeader>

          <Tabs defaultValue="add" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mx-6 mt-4">
              <TabsTrigger value="add">Add New CRR</TabsTrigger>
              {/* <TabsTrigger value="update">Update Existing Case</TabsTrigger> */}
            </TabsList>

            {/* Add New Case Tab */}
            <TabsContent value="add">
              <CardContent className="p-6">
                <div className="flex flex-col gap-5"> {/* Increased gap */}

                  {/* Row 1: Petitioner Name, Filing Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"> 
                      <Label className="font-semibold text-gray-700" htmlFor="petitionName">
                        Petitioner Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="petitionName"
                        name="petitionName"
                        placeholder="Enter petitioner name"
                        value={addFormData.petitionName}
                        onChange={handleAddChange}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-gray-700" htmlFor="filingDate">
                        Filing Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        icon={Calendar}
                        id="filingDate"
                        name="filingDate"
                        type="date"
                        value={addFormData.filingDate}
                        onChange={handleAddChange}
                        max={new Date().toISOString().split("T")[0]} // Prevent future dates
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Row 2: Case Type, Hearing Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-gray-700" htmlFor="caseTypeID">
                        Case Type <span className="text-red-500">*</span>
                      </Label>
                      <Popover open={openCaseType} onOpenChange={setOpenCaseType}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCaseType}
                            className="w-full justify-between text-sm font-normal"
                            disabled={isLoading} // Disable while loading dropdown data
                          >
                            {addFormData.caseTypeID
                              ? caseTypeList.find(
                                (caseType) => caseType.CasetypeId.toString() === addFormData.caseTypeID,
                              )?.CasetypeName
                              : "Select Case Type..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search case type..." />
                            <CommandList>
                              <CommandEmpty>No case type found.</CommandEmpty>
                              <CommandGroup>
                                {(caseTypeList || []).map((caseType) => ( // Add safety check for map
                                  <CommandItem
                                    key={caseType.CasetypeId}
                                    value={caseType.CasetypeName} // Add value for search
                                    onSelect={() => {
                                      handleAddSelectChange("caseTypeID", caseType.CasetypeId.toString());
                                      setOpenCaseType(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        addFormData.caseTypeID === caseType.CasetypeId.toString()
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {caseType.CasetypeName}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-gray-700" htmlFor="hearingDate">
                        Hearing Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        icon={Clock}
                        id="hearingDate"
                        name="hearingDate"
                        type="date"
                        value={addFormData.hearingDate}
                        onChange={handleAddChange}
                        min={addFormData.filingDate || undefined} // Hearing date >= Filing date
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Row 3: Reference Details */}
                  <div className="space-y-1.5 border-t pt-4 mt-2">
                    <Label className="font-semibold text-gray-700">Reference Details <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Reference Type (Read-only) */}
                      <div className="space-y-1.5 md:col-span-1">
                        <Label className="text-xs text-gray-600" htmlFor="crmID">Reference Type</Label>
                        <Input
                          id="crmID"
                          value={referenceList.find(ref => ref.refferenceId.toString() === DEFAULT_CRM_ID)?.refferenceName || `ID: ${DEFAULT_CRM_ID}`}
                          readOnly
                          className="bg-gray-100 text-sm cursor-not-allowed"
                        />
                        {/* Removed Popover for Reference Type */}
                      </div>
                      {/* Reference Number (Editable) */}
                      <div className="space-y-1.5 md:col-span-1">
                        {/* <Label className="text-xs text-gray-600" htmlFor="refferenceNumber">Reference Number</Label> */}
                        <Label className="font-semibold text-gray-700" htmlFor="refferenceNumber">
                        Reference Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="refferenceNumber"
                        name="refferenceNumber"
                        placeholder="Enter Reference Number"
                        value={addFormData.refferenceNumber}
                        onChange={handleAddChange}
                        className="text-sm"
                      />
                      </div>
                      {/* Reference Year (Editable) */}
                      <div className="space-y-1.5 md:col-span-1">
                        <Label className="text-xs text-gray-600" htmlFor="refferenceyear">Reference Year</Label>
                        <Popover open={openYear} onOpenChange={setOpenYear}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openYear}
                            className="w-full justify-between"
                          >
                            {currentReference.refferenceyear || "Select Year"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search year..." />
                            <CommandList>
                              <CommandEmpty>No year found.</CommandEmpty>
                              <CommandGroup>
                                {years.map((year) => (
                                  <CommandItem
                                    key={year}
                                    onSelect={() => {
                                      handleReferenceChange("refferenceyear", year);
                                      setOpenYear(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        currentReference.refferenceyear === year ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {year}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Description */}
                  <div className="space-y-1.5 border-t pt-4 mt-2">
                    <Label className="font-semibold text-gray-700" htmlFor="CourtCaseDescription">
                      Court Case Description <span className="text-red-500">*</span> (Max 100 words)
                    </Label>
                    <textarea
                      id="CourtCaseDescription"
                      name="CourtCaseDescription"
                      rows={4}
                      value={addFormData.CourtCaseDescription}
                      onChange={(e) => {
                        const currentText = e.target.value;
                        const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
                        if (wordCount <= 100 || currentText.length < addFormData.CourtCaseDescription.length) { // Allow deleting characters even if over limit
                          setAddFormData({ ...addFormData, CourtCaseDescription: currentText });
                        }
                      }}
                      placeholder="Enter a brief summary of the case (max 100 words)"
                      className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                    />
                    <p className={cn(
                      "text-xs text-right",
                      addFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length > 100 ? "text-red-600" : "text-gray-500"
                    )}>
                      {addFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length} / 100 words
                    </p>
                  </div>

                  <div className="space-y-2 mt-2 border-b pb-4 mb-4">
                    <Label className="font-bold">
                      Standard IPC / BNS Sections <span className="text-red-500">*</span>
                      {/* (Max {MAX_STANDARD_SECTIONS}) */}
                    </Label>

                    {/* Display Mode Switch (Styled like v0) */}
                    <div
                      className={`relative w-20 h-8 rounded-full flex items-center cursor-pointer transition-all 
                      ${useIpcDisplay ? "bg-blue-600" : "bg-green-600"} mb-2`}
                      onClick={() => setUseIpcDisplay((prev) => !prev)}
                    >
                      <span className="absolute w-full text-xs font-bold text-white flex justify-center transition-all">
                        {useIpcDisplay ? "IPC" : "BNS"}
                      </span>
                      <div
                        className={`absolute w-7 h-7 bg-white rounded-full shadow-md transform transition-all 
                        ${useIpcDisplay ? "translate-x-1" : "translate-x-12"}`}
                      />
                    </div>

                    {/* Selected badges with conversion */}
                    <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                      {selectedIpcSections.map((section) => (
                        <Badge key={section.bnsId} variant="secondary" className="flex items-center gap-2 py-2 px-3">
                          <div className="text-xs font-semibold">
                            {useIpcDisplay
                              ? section.ipcSection
                              : ipcToBnsMap[section.bnsId] || "Loading..."}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => removeIpcSection(section.bnsId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>

                    {/* Dropdown changes based on mode */}
                    <Popover open={openIpcAct} onOpenChange={setOpenIpcAct}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openIpcAct}
                          className="w-full justify-between"
                        >
                          {useIpcDisplay ? "Select IPC Section" : "Select BNS Section"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder={`Search ${useIpcDisplay ? "IPC" : "BNS"}...`} />
                          <CommandList>
                            <CommandEmpty>No match found.</CommandEmpty>
                            <CommandGroup>
                              {(useIpcDisplay ? ipcActList : bnsSectionList)
                                .filter(
                                  (entry) =>
                                    !selectedIpcSections.some((s) => s.bnsId.toString() === entry.bnsId.toString())
                                )
                                .map((entry) => (
                                  <CommandItem
                                    key={entry.bnsId}
                                    onSelect={() => {
                                      addIpcSection(entry.bnsId.toString())
                                      setOpenIpcAct(false)
                                    }}
                                  >
                                    {useIpcDisplay ? entry.ipcSection : entry.bnsSection}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* --- Other IPC Act & Corresponding BNS Section --- */}
                  <div className="space-y-2 mt-4">
                    <Label className="font-bold">Other Sections
                      {/* (Max {MAX_OTHER_ROWS} rows) */}
                    </Label>
                    <p className="text-xs text-gray-600 mb-2">Enter custom IPC Act, BNS Section, or both. At least one field is required per row.</p>

                    {/* Input Row */}
                    <div className="flex items-end gap-2 mb-2">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="otherIpcActInput" className="text-xs">Other IPC Act</Label>
                        <Input
                          id="otherIpcActInput"
                          placeholder="Enter other IPC Act"
                          value={currentOtherIpc}
                          onChange={(e) => setCurrentOtherIpc(e.target.value)}
                          // Disable if max other rows or total entries reached
                          disabled={otherSectionsList.length >= MAX_OTHER_ROWS || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_ENTRIES}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="otherBnsSectionInput" className="text-xs">Corresponding BNS Section</Label>
                        <Input
                          id="otherBnsSectionInput"
                          placeholder="Enter corresponding BNS Section"
                          value={currentOtherBns}
                          onChange={(e) => setCurrentOtherBns(e.target.value)}
                          // Disable if max other rows or total entries reached
                          disabled={otherSectionsList.length >= MAX_OTHER_ROWS || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_ENTRIES}
                        />
                      </div>
                      <Button
                        size="icon"
                        onClick={addOtherSectionRow}
                        className="h-9 w-9" // Match input height
                        // Disable if inputs are empty or limits reached
                        disabled={(!currentOtherIpc.trim() && !currentOtherBns.trim()) || otherSectionsList.length >= MAX_OTHER_ROWS || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_ENTRIES}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Display List/Table for Other Sections */}
                    {otherSectionsList.length > 0 && (
                      <div className="border rounded-md overflow-hidden mt-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Other IPC Act</TableHead>
                              <TableHead>Corresponding BNS Section</TableHead>
                              <TableHead className="w-[50px] text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {otherSectionsList.map((section) => (
                              <TableRow key={section.id}>
                                <TableCell className="font-medium py-2">{section.ipcValue || "-"}</TableCell>
                                <TableCell className="py-2">{section.bnsValue || "-"}</TableCell>
                                <TableCell className="text-right py-2">
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeOtherSectionRow(section.id)}
                                    className="h-7 w-7" // Smaller delete button
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mt-2 border-t pt-4">
                    <Label className="font-semibold text-gray-700">Upload Documents</Label>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept=".pdf" // Only PDF
                      className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {documents.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-600">Selected Documents:</p>
                        <ul className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
                          {documents.map((file, index) => (
                            <li key={index} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-gray-100">
                              <div className="flex items-center overflow-hidden mr-2">
                                <FileText className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                <span className="truncate" title={file.name}>{file.name}</span>
                                <span className="ml-2 text-gray-500 flex-shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => removeDocument(index)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-100">
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Max file size: {MAX_FILE_SIZE_MB} MB. Allowed format: PDF</p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={handleAddCrr}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md shadow-md transition duration-150 ease-in-out"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Add CRR"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Update Existing Case Tab */}
            <TabsContent value="update">
              <CardContent>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  )
}

export default AddCrrPage;