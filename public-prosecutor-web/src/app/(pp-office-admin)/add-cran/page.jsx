"use client"

import { useState, useEffect } from "react"
import {
  createCranOfficeAdmin,
  uploadCaseDocumentsV1,
  showJustReferenceByCase
} from "@/app/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { useSelector } from "react-redux"
import { Calendar, FileText, Hash, Clock, Trash, Plus, X, Square, CheckSquare, FileUp, Loader2 } from "lucide-react"
import { decrypt } from "@/utils/crypto"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { postRequest } from "@/app/commonAPI"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const MAX_REF_SELECTION = 4;
const MAX_CRAN_PER_REF = 5;
const MAX_FILE_SIZE_MB = 50;
const MAX_TOTAL_ENTRIES = 20;

const AddCranPage = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null)
  const encryptedUser = useSelector((state) => state.auth.user)
  const [documents, setDocuments] = useState([])
  const [activeTab, setActiveTab] = useState("add")


  // --- State for CRAN Workflow ---
  const [allCases, setAllCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [selectedCaseNumber, setSelectedCaseNumber] = useState("");
  const [caseReferences, setCaseReferences] = useState([]);
  const [selectedRefIds, setSelectedRefIds] = useState(new Set());

  // State to hold CRAN entries and documents, keyed by reference ccnId
  // Structure: { ccnId: [ { id: tempId, cranNumber: '', cranYear: '', documents: [File,...] }, ... ], ... }
  const [cranData, setCranData] = useState({});

  // Dropdown open/close state
  const [openCaseSelect, setOpenCaseSelect] = useState(false);
  const [openReferenceSelect, setOpenReferenceSelect] = useState(false);
  const [openYearSelects, setOpenYearSelects] = useState({}); // Track open state for each CRAN year input

  // Years for CRAN year dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  // --- Effects ---

  useEffect(() => {
    try {
      const decoded_user = JSON.parse(decrypt(encryptedUser));
      setUser(decoded_user);
    } catch (error) {
      console.error("Error decoding user:", error);
      openAlert("error", "Failed to initialize user session.");
    }
  }, [encryptedUser]);

  useEffect(() => {
    if (user?.AuthorityUserID) {
      const fetchCases = async () => {
        setIsLoading(true);
        try {
          const response = await postRequest("showallCaseBetweenRange", {
            startDate: null, endDate: null, isAssign: 2, // Adjust params if needed
            EntryUserID: user.AuthorityUserID
          });
          if (response.status === 0 && Array.isArray(response.data)) {
            setAllCases(response.data);
          } else {
            throw new Error(response.message || "Failed to fetch cases");
          }
        } catch (error) {
          console.error("Error fetching cases:", error);
          openAlert("error", `Failed to fetch cases: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCases();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCaseId && user?.AuthorityUserID) {
      const fetchReferences = async () => {
        setIsLoading(true);
        // Reset previous selections when case changes
        setCaseReferences([]);
        setSelectedRefIds(new Set());
        setCranData({});
        try {
          const response = await showJustReferenceByCase(selectedCaseId,user?.AuthorityUserID);
          if (response.status === 0 && Array.isArray(response.data)) {
            setCaseReferences(response.data);
          } else {
            throw new Error(response.message || "Failed to load references for the selected case.");
          }
        } catch (error) {
          console.error("Error fetching references:", error);
          openAlert("error", `Failed to load references: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      fetchReferences();
    } else {
      // Clear references if no case is selected
      setCaseReferences([]);
      setSelectedRefIds(new Set());
      setCranData({});
    }
  }, [selectedCaseId, user]);

  // --- Handlers ---

  // Case Selection
  const handleCaseSelect = (caseItem) => {
    setSelectedCaseId(caseItem.CaseId.toString());
    setSelectedCaseNumber(caseItem.CaseNumber); // Store number for display
    setOpenCaseSelect(false);
  };

  // Reference Multi-Selection
  const handleReferenceToggle = (ccnId) => {
    setSelectedRefIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ccnId)) {
        newSet.delete(ccnId);
        // Also remove associated CRAN data when unselecting
        setCranData(currentData => {
          const newData = { ...currentData };
          delete newData[ccnId];
          return newData;
        });
      } else {
        if (newSet.size < MAX_REF_SELECTION) {
          newSet.add(ccnId);
          // Initialize CRAN data array for the newly selected reference
          setCranData(currentData => ({
            ...currentData,
            [ccnId]: currentData[ccnId] || [] // Initialize if not present
          }));
        } else {
          openAlert("warning", `You can select a maximum of ${MAX_REF_SELECTION} references.`);
        }
      }
      return newSet;
    });
    // Keep the reference dropdown open after selection for multi-select
    // setOpenReferenceSelect(false); // Remove this line
  };

  // Format reference display text
  const formatReferenceLabel = (ref) => {
    return `${ref.RefferenceName || 'N/A'} - ${ref.RefferenceNumber || 'N/A'} - ${ref.RefferenceYear || 'N/A'}`;
  }

  // CRAN Entry Management per Reference
  const handleCranInputChange = (refCcnId, cranEntryId, field, value) => {
    setCranData(prev => ({
      ...prev,
      [refCcnId]: prev[refCcnId].map(entry =>
        entry.id === cranEntryId ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const handleCranYearSelect = (refCcnId, cranEntryId, year) => {
    handleCranInputChange(refCcnId, cranEntryId, 'cranYear', year);
    // Close the specific year popover
    setOpenYearSelects(prev => ({ ...prev, [`${refCcnId}-${cranEntryId}`]: false }));
  };

  const toggleYearPopover = (refCcnId, cranEntryId, isOpen) => {
    setOpenYearSelects(prev => ({ ...prev, [`${refCcnId}-${cranEntryId}`]: isOpen }));
  };

  const addCranEntry = (refCcnId) => {
    setCranData(prev => {
      const currentEntries = prev[refCcnId] || [];
      if (currentEntries.length >= MAX_CRAN_PER_REF) {
        openAlert("warning", `Maximum ${MAX_CRAN_PER_REF} CRAN entries allowed per reference.`);
        return prev;
      }
      return {
        ...prev,
        [refCcnId]: [
          ...currentEntries,
          {
            id: `new_cran_${refCcnId}_${Date.now()}`, // Unique temporary ID
            cranNumber: "",
            cranYear: currentYear.toString(),
            documents: []
          }
        ]
      };
    });
  };

  const removeCranEntry = (refCcnId, cranEntryId) => {
    setCranData(prev => ({
      ...prev,
      [refCcnId]: prev[refCcnId].filter(entry => entry.id !== cranEntryId)
    }));
  };

  // Document Handling per CRAN Entry
  const handleCranFileChange = (e, refCcnId, cranEntryId) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      // Add validation (size, type)
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

    setCranData(prev => ({
      ...prev,
      [refCcnId]: prev[refCcnId].map(entry =>
        entry.id === cranEntryId
          ? {
            ...entry, documents: [...entry.documents, ...validFiles].filter((file, index, self) => // Prevent duplicates
              index === self.findIndex((f) => (f.name === file.name && f.size === file.size)))
          }
          : entry
      )
    }));
    e.target.value = null; // Clear input
  };

  const removeCranDocument = (refCcnId, cranEntryId, docIndex) => {
    setCranData(prev => ({
      ...prev,
      [refCcnId]: prev[refCcnId].map(entry =>
        entry.id === cranEntryId
          ? { ...entry, documents: entry.documents.filter((_, i) => i !== docIndex) }
          : entry
      )
    }));
  };

  // --- Submission ---
  const handleSaveAllCrans = async () => {
    setIsSubmitting(true);
    const submissionErrors = [];
    let successfulCrans = 0;

    // Validate at least one reference is selected
    if (selectedRefIds.size === 0) {
      openAlert("error", "Please select at least one reference.");
      setIsSubmitting(false);
      return;
    }

    // Validate at least one CRAN entry exists for selected references
    let totalCrans = 0;
    selectedRefIds.forEach(refId => {
      totalCrans += (cranData[refId]?.length || 0);
    });
    if (totalCrans === 0) {
      openAlert("error", "Please add at least one CRAN entry for the selected reference(s).");
      setIsSubmitting(false);
      return;
    }


    // Loop through selected references
    for (const refId of selectedRefIds) {
      const entries = cranData[refId] || [];

      // Loop through CRAN entries for the current reference
      for (const entry of entries) {
        // Validate CRAN Number and Year for this entry
        if (!entry.cranNumber?.trim() || !entry.cranYear) {
          submissionErrors.push(`Skipping CRAN for Reference ID ${refId} due to missing CRAN Number/Year.`);
          continue; // Skip this entry
        }

        try {
          // 1. Call createCranOfficeAdmin
          const cranPayload = {
            caseId: selectedCaseId,
            refferenceId: refId, // This is the ccnId
            cranNumber: entry.cranNumber,
            cranYear: entry.cranYear,
            EntryUserID: user?.AuthorityUserID
          };
          console.log("Calling createCranOfficeAdmin with:", cranPayload);
          const cranResult = await createCranOfficeAdmin(cranPayload);

          if (cranResult && cranResult.status === 0 && cranResult.data?.CranID) {
            const cranId = cranResult.data.CranID;
            console.log(`CRAN created successfully: ID=${cranId} for Ref ID=${refId}`);

            // 2. Call uploadCaseDocumentsV1 if documents exist
            if (entry.documents && entry.documents.length > 0) {
              try {
                const safeDocuments = Array.isArray(entry.documents)
                  ? entry.documents
                  : Array.from(entry.documents || []);
            
                console.log(`Uploading ${safeDocuments.length} documents for CRAN ID: ${cranId}`);
                await uploadCaseDocumentsV1(
                  selectedCaseId,
                  refId,
                  cranId,
                  safeDocuments,
                  user.AuthorityUserID
                );
                console.log(`Documents uploaded successfully for CRAN ID: ${cranId}`);
              } catch (uploadError) {
                console.error(`Document upload failed for CRAN ID ${cranId}:`, uploadError);
                submissionErrors.push(`CRAN ${entry.cranNumber}/${entry.cranYear} (ID: ${cranId}) saved, but document upload failed: ${uploadError}`);
              }
            }
            successfulCrans++;
          } else {
            // CRAN creation failed
            throw new Error(cranResult?.message || `Failed to create CRAN ${entry.cranNumber}/${entry.cranYear} for Ref ID ${refId}.`);
          }
        } catch (error) {
          console.error(`Error processing CRAN ${entry.cranNumber}/${entry.cranYear} for Ref ID ${refId}:`, error);
          submissionErrors.push(`Error saving CRAN ${entry.cranNumber}/${entry.cranYear}: ${error.message}`);
          // Continue processing other CRANs
        }
      } // End loop through entries for one reference
    } // End loop through selected references

    setIsSubmitting(false);

    // --- Final Feedback ---
    if (submissionErrors.length === 0 && successfulCrans > 0) {
      openAlert("success", `${successfulCrans} CRAN(s) and associated documents saved successfully!`);
      // Reset form completely
      setSelectedCaseId("");
      setSelectedCaseNumber("");
      setCaseReferences([]);
      setSelectedRefIds(new Set());
      setCranData({});
    } else if (successfulCrans > 0 && submissionErrors.length > 0) {
      openAlert("warning", `Process completed with errors. ${successfulCrans} CRAN(s) saved successfully, but ${submissionErrors.length} error(s) occurred:\n- ${submissionErrors.join("\n- ")}`);
      // Partially reset or keep state? For now, reset.
      setSelectedCaseId("");
      setSelectedCaseNumber("");
      setCaseReferences([]);
      setSelectedRefIds(new Set());
      setCranData({});
    } else {
      openAlert("error", `Failed to save any CRANs. Errors:\n- ${submissionErrors.join("\n- ")}`);
      // Don't reset form on complete failure
    }
  };

  const handleConfirm = () => { closeAlert(); };

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
            <CardTitle className="text-white text-xl">CRAN</CardTitle>
          </CardHeader>

          <Tabs defaultValue="add" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mx-6 mt-4">
              <TabsTrigger value="add">Add</TabsTrigger>
              {/* <TabsTrigger value="update">Update Existing Case</TabsTrigger> */}
            </TabsList>

            {/* Add New Case Tab */}
            <TabsContent value="add">

              {/* <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="existingCaseNumber">
                        Select Case <span className="text-red-500">*</span>
                      </Label>
                      <Popover open={openCaseSelect} onOpenChange={setOpenCaseSelect}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCaseSelect}
                            className="w-full justify-between"
                          >
                            {updateFormData.CaseNumber || "Select a case to update"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search case number..." />
                            <CommandList>
                              <CommandEmpty>No cases found.</CommandEmpty>
                              <CommandGroup>
                                {allCases.map((caseItem) => (
                                  <CommandItem
                                    key={caseItem.CaseId}
                                    onSelect={() => {
                                      handleUpdateSelectChange("CaseNumber", caseItem.CaseNumber)
                                      setOpenCaseSelect(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        updateFormData.CaseNumber === caseItem.CaseNumber ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {caseItem.CaseNumber} - {caseItem.SpName}, {caseItem.PsName}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    <Label>Upload Case Documents</Label>
                    <Input type="file" multiple onChange={handleFileChange} accept=".jpg,.jpeg,.pdf" />

                    {documents.length > 0 && (
                      <div className="mt-3">
                        <p className="font-semibold mb-2">Selected Documents:</p>
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                          {documents.map((file, index) => (
                            <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="truncate max-w-[200px]">{file.name}</span>
                                <span className="ml-2 text-xs text-gray-500">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeDocument(index)}
                                className="ml-2"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">Max file size: 50 MB. Allowed formats: PDF</p>
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={handleAddCase}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Add Case"}
                    </Button>
                  </div>
                </div>
              </CardContent> */}

              <CardContent className="p-6">
                <div className="flex flex-col gap-6"> {/* Increased gap */}

                  {/* 1. Case Selection */}
                  <div className="space-y-2 border-b pb-4">
                    <Label className="font-semibold text-gray-700 text-lg" htmlFor="caseSelect">
                      Step 1: Select Case <span className="text-red-500">*</span>
                    </Label>
                    <Popover open={openCaseSelect} onOpenChange={setOpenCaseSelect}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal" disabled={isLoading || isSubmitting}>
                          {selectedCaseNumber || "Select Case..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search case number..." />
                          <CommandList>
                            <CommandEmpty>No cases found.</CommandEmpty>
                            <CommandGroup>
                              {(allCases || []).map((caseItem) => (
                                <CommandItem key={caseItem.CaseId} value={`${caseItem.CaseNumber} ${caseItem.SpName} ${caseItem.PsName}`} onSelect={() => handleCaseSelect(caseItem)}>
                                  <Check className={cn("mr-2 h-4 w-4", selectedCaseId === caseItem.CaseId.toString() ? "opacity-100" : "opacity-0")} />
                                  {caseItem.CaseNumber} - {caseItem.SpName}, {caseItem.PsName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 2. Reference Multi-Selection (Conditional) */}
                  {selectedCaseId && (
                    <div className="space-y-2 border-b pb-4">
                      <Label className="font-semibold text-gray-700 text-lg">
                        Step 2: Select Reference(s) <span className="text-red-500">*</span> (Max {MAX_REF_SELECTION})
                      </Label>
                      <Popover open={openReferenceSelect} onOpenChange={setOpenReferenceSelect}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" className="w-full justify-between font-normal" disabled={isLoading || caseReferences.length === 0 || isSubmitting}>
                            <span className="truncate pr-2">
                              {selectedRefIds.size > 0 ? `${selectedRefIds.size} reference(s) selected` : "Select References..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search references..." />
                            <CommandList>
                              {isLoading && <CommandItem disabled>Loading references...</CommandItem>}
                              {!isLoading && caseReferences.length === 0 && <CommandEmpty>No references found for this case.</CommandEmpty>}
                              <CommandGroup>
                                {(caseReferences || []).map((ref) => (
                                  <CommandItem
                                    key={ref.ccnId}
                                    value={formatReferenceLabel(ref)}
                                    onSelect={() => handleReferenceToggle(ref.ccnId)}
                                    className="cursor-pointer"
                                  >
                                    {selectedRefIds.has(ref.ccnId) ? <CheckSquare className="mr-2 h-4 w-4 text-blue-600" /> : <Square className="mr-2 h-4 w-4 text-gray-400" />}
                                    {formatReferenceLabel(ref)}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {/* Display selected reference badges (optional) */}
                      {/* <div className="flex flex-wrap gap-1 mt-2">
                                    {Array.from(selectedRefIds).map(refId => {
                                        const ref = caseReferences.find(r => r.ccnId === refId);
                                        return ref ? <Badge key={refId} variant="secondary" className="text-xs">{formatReferenceLabel(ref)}</Badge> : null;
                                    })}
                                </div> */}
                    </div>
                  )}

                  {/* 3. CRAN Entry Sections (Conditional) */}
                  {selectedRefIds.size > 0 && (
                    <div className="space-y-6">
                      <Label className="font-semibold text-gray-700 text-lg block">
                        Step 3: Add CRAN Details & Documents
                      </Label>
                      {Array.from(selectedRefIds).map(refId => {
                        const ref = caseReferences.find(r => r.ccnId === refId);
                        if (!ref) return null; // Should not happen if state is consistent
                        const currentCranEntries = cranData[refId] || [];

                        return (
                          <Card key={refId} className="border-gray-300 shadow-md">
                            <CardHeader className="bg-gray-100 p-3 border-b">
                              <CardTitle className="text-base font-medium text-gray-800">
                                Reference: {formatReferenceLabel(ref)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                              {currentCranEntries.map((entry, index) => (
                                <div key={entry.id} className="border rounded-md p-3 bg-white relative space-y-3">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isSubmitting}
                                    className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:bg-red-100"
                                    onClick={() => removeCranEntry(refId, entry.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <p className="text-sm font-medium text-gray-600">CRAN Entry #{index + 1}</p>
                                  {/* CRAN Number and Year */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label htmlFor={`cranNum-${entry.id}`} className="text-xs">CRAN Number <span className="text-red-500">*</span></Label>
                                      <Input
                                        id={`cranNum-${entry.id}`}
                                        placeholder="Enter CRAN Number"
                                        value={entry.cranNumber}
                                        disabled={isSubmitting}
                                        onChange={(e) => handleCranInputChange(refId, entry.id, 'cranNumber', e.target.value)}
                                        className="text-sm"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label htmlFor={`cranYear-${entry.id}`} className="text-xs">CRAN Year <span className="text-red-500">*</span></Label>
                                      <Popover open={openYearSelects[`${refId}-${entry.id}`] || false} onOpenChange={(isOpen) => toggleYearPopover(refId, entry.id, isOpen)} disabled={isSubmitting}>
                                        <PopoverTrigger asChild>
                                          <Button variant="outline" role="combobox" className="w-full justify-between text-sm font-normal"  disabled={isSubmitting}>
                                            {entry.cranYear || "Select Year..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                          <Command> <CommandInput placeholder="Search year..." /> <CommandList> <CommandEmpty /> <CommandGroup> {years.map(year => (<CommandItem key={year} value={year} onSelect={() => handleCranYearSelect(refId, entry.id, year)}> <Check className={cn("mr-2 h-4 w-4", entry.cranYear === year ? "o" : "o")} /> {year} </CommandItem>))} </CommandGroup> </CommandList> </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </div>
                                  {/* Document Upload for this CRAN */}
                                  <div className="space-y-1 pt-2">
                                    <Label htmlFor={`cranDocs-${entry.id}`} className="text-xs flex items-center gap-1"><FileUp className="h-3 w-3" /> Attach Documents (PDF)</Label>
                                    <Input
                                      id={`cranDocs-${entry.id}`}
                                      type="file"
                                      multiple
                                      accept=".pdf"
                                      disabled={isSubmitting}
                                      onChange={(e) => handleCranFileChange(e, refId, entry.id)}
                                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                    />
                                    {/* Display attached documents */}
                                    {entry.documents && entry.documents.length > 0 && (
                                      <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                                        {entry.documents.map((file, docIndex) => (
                                          <li key={docIndex} className="flex justify-between items-center text-gray-600">
                                            <span className="truncate" title={file.name}>{file.name}</span>
                                            <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500 hover:bg-red-100" onClick={() => removeCranDocument(refId, entry.id, docIndex)}>
                                              <Trash className="h-3 w-3" />
                                            </Button>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {/* Add CRAN Entry Button */}
                              {currentCranEntries.length < MAX_CRAN_PER_REF && (
                                <Button variant="outline" size="sm" onClick={() => addCranEntry(refId)} className="mt-2 text-xs">
                                  <Plus className="h-4 w-4 mr-1" /> Add CRAN Entry for this Reference
                                </Button>
                              )}
                              {currentCranEntries.length >= MAX_CRAN_PER_REF && (
                                <p className="text-xs text-muted-foreground mt-2">Maximum {MAX_CRAN_PER_REF} CRAN entries reached for this reference.</p>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}

                  {/* Submit Button (Conditional) */}
                  {selectedRefIds.size > 0 && (
                    <div className="flex justify-center mt-8 border-t pt-6">
                      <Button
                        onClick={handleSaveAllCrans}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-md shadow-md transition duration-150 ease-in-out text-base"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Save All CRAN Entries"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>

            </TabsContent>

            {/* Update Existing Case Tab */}
            <TabsContent value="update">
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  )
}

export default AddCranPage