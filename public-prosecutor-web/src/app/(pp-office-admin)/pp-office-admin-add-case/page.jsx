"use client"

import { useState, useEffect, useCallback } from "react"
import {
  createCaseOfficeAdmin,
  uploadCaseDocuments,
  getcasetype,
  showRefferenceDetails,
  alldistrict,
  showpoliceBydistrict,
  showIpcSection,
  showBnsSection,
  showIbsByBnsId,
  showJustSectionByCase,
  showJustReferenceByCase,
  createCranOfficeAdmin,
  uploadCaseDocumentsV1,
  createOrUpdateCaseV3,
} from "@/app/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { useSelector } from "react-redux"
import { Calendar, FileText, Hash, Clock, Trash, Plus, X, Loader2, FileUp, Edit3 } from "lucide-react"
import { decrypt } from "@/utils/crypto"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { postRequest } from "@/app/commonAPI"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import moment from "moment-timezone";

const OTHER_SECTION_BNS_ID = 534;
const MAX_STANDARD_SECTIONS = 10;
const MAX_OTHER_ROWS = 10;
const MAX_TOTAL_SECTION_ENTRIES = 20;
const MAX_CRAN_PER_REF = 5; // CRAN Limit per single reference
const MAX_FILE_SIZE_MB = 50;

const AddCasePage = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null)
  const encryptedUser = useSelector((state) => state.auth.user)
  const [allCases, setAllCases] = useState([])

  // Dropdown Lists State
  const [referenceList, setReferenceList] = useState([])
  const [allDistrictList, setAllDistrictList] = useState([])
  const [allPSList, setAllPSList] = useState([])
  const [caseTypeList, setCaseTypeList] = useState([])
  const [bnsSectionList, setBnsSectionList] = useState([])
  const [ipcActList, setIpcActList] = useState([])

  const [mainCaseDocuments, setMainCaseDocuments] = useState([]);

  // Form Data State
  const [addFormData, setAddFormData] = useState({
    caseNumber: "", EntryUserID: "", CaseDate: "", districtId: "", psId: "", caseTypeId: "",
    filingDate: "", petitionName: "", hearingDate: "", CourtCaseDescription: "",
    crmID: "", refferenceNumber: "", refferenceyear: "",
  });

  const [documents, setDocuments] = useState([])
  const [activeTab, setActiveTab] = useState("add")
  const [openCaseSelect, setOpenCaseSelect] = useState(false)

  // IPC/BNS Section State
  const [selectedIpcSections, setSelectedIpcSections] = useState([]); // Array of { bnsId, ipcSection, bnsSection }
  const [otherSectionsList, setOtherSectionsList] = useState([]); // Array of { id, ipcValue, bnsValue }
  const [currentOtherIpc, setCurrentOtherIpc] = useState("");
  const [currentOtherBns, setCurrentOtherBns] = useState("");
  const [useIpcDisplay, setUseIpcDisplay] = useState(true);
  // const [ipcToBnsMap, setIpcToBnsMap] = useState({})

  // --- State for CRANs (associated with the single reference) ---
  const [cranEntries, setCranEntries] = useState([]); // Array of { id, cranNumber, cranYear, documents }
  const [isCranModalOpen, setIsCranModalOpen] = useState(false);
  const [editingCran, setEditingCran] = useState(null); // Holds data of CRAN being edited, or null for new
  const [currentCranDataInModal, setCurrentCranDataInModal] = useState({ // For the modal's form
    id: null, cranNumber: "", cranYear: "", documents: []
  });
  const [openCranModalYear, setOpenCranModalYear] = useState(false);
  const [openYearSelects, setOpenYearSelects] = useState({}); // For CRAN year popovers

  // Dropdown open/close state
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openPS, setOpenPS] = useState(false);
  const [openCaseType, setOpenCaseType] = useState(false);
  const [openReference, setOpenReference] = useState(false); // For the single reference type
  const [openYear, setOpenYear] = useState(false); // For the single reference year
  const [openIpcAct, setOpenIpcAct] = useState(false);

  // // Multiple selections
  const [selectedReferences, setSelectedReferences] = useState([])
  const [currentReference, setCurrentReference] = useState({
    crmID: "",
    refferenceNumber: "",
    refferenceyear: new Date().getFullYear().toString(),
  })

  // Form data for updating existing case
  const [updateFormData, setUpdateFormData] = useState({
    CaseId: "", caseNumber: "", EntryUserID: "", CaseDate: "", districtId: "", psId: "",
    caseTypeId: "", filingDate: "", petitionName: "", hearingDate: "",
    CourtCaseDescription: "", crmID: "", refferenceNumber: "", refferenceyear: "",
  })

  // Years for dropdowns
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  const [searchType, setSearchType] = useState("1");
  const [searchInput, setSearchInput] = useState({
    caseNumber: "",
    caseDate: "",
    referenceId: "",
    referenceNumber: "",
    referenceYear: "",
  });
  const [matchedCases, setMatchedCases] = useState([]);
  const [openUpdateReference, setOpenUpdateReference] = useState(false);
  const [openUpdateYear, setOpenUpdateYear] = useState(false);

  // --- Search Handler ---
  const handleSearchCase = async () => {
    const payload = {
      SearchType: searchType,
      CaseNumber: searchType === "1" ? searchInput.caseNumber : "",
      CaseDate: searchType === "1" ? searchInput.caseDate : "",
      RefferenceId: searchType === "2" ? searchInput.referenceId : "",
      RefferenceNumber: searchType === "2" ? searchInput.referenceNumber : "",
      RefferenceYear: searchType === "2" ? searchInput.referenceYear : "",
    };
    try {
      const res = await postRequest("get-case-by-param", payload);
      if (res.status === 210) {
        openAlert("success", res.message || "No matching Cases Found!");
        setMatchedCases(res.data || []);
        setUpdateFormData({ CaseId: "" }); // reset form visibility
      } else if (res.status === 0) {
        setMatchedCases(res.data || []);
        setUpdateFormData({ CaseId: "" }); // reset form visibility
      } else {
        openAlert("error", res.message || "No case found");
        setMatchedCases([]);
        setUpdateFormData({ CaseId: "" }); // hide form
      }
    } catch (err) {
      openAlert("error", err?.message || "Search failed");
    }
  };

  
  const formatDate = (dateString) => {
    return dateString
      ? moment.utc(dateString).tz("Asia/Kolkata").format("YYYY-MM-DD")
      : "";
  };

  const handleSelectMatchedCase = async (caseData) => {
    const districtId = caseData.DistrictId ? caseData.DistrictId.toString() : "";

    try {
      const psResult = await showpoliceBydistrict(districtId);
      setAllPSList(psResult);
    } catch (err) {
      openAlert("error", "Failed to load police stations");
      return;
    }

    // const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split("T")[0] : "";

    setUpdateFormData({
      CaseId: caseData.CaseId.toString(),
      caseNumber: caseData.CaseNumber,
      EntryUserID: user.AuthorityUserID,
      CaseDate: formatDate(caseData.CaseDate),
      districtId,
      psId: caseData.PoliceId ? caseData.PoliceId.toString() : "",
      caseTypeId: caseData.CaseTypeId ? caseData.CaseTypeId.toString() : "",
      filingDate: "", // User will enter
      petitionName: "", // User will enter
      hearingDate: "", // User will enter
      CourtCaseDescription: "",
      crmID: "",
      refferenceNumber: "",
      refferenceyear: "",
    });

    setSelectedIpcSections([]);
    setSelectedReferences([]);
    setDocuments([]);
    setOtherSectionsList([]);
    setCranEntries([]);
    setOpenCaseSelect(false);
  };

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser))
    setUser(decoded_user);
    setAddFormData((prevState) => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID,
      filingDate: new Date().toISOString().split("T")[0],
      refferenceyear: currentYear.toString(),
    }));
    setUpdateFormData((prevState) => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID,
      filingDate: new Date().toISOString().split("T")[0],
    }));
  }, [encryptedUser])

  useEffect(() => {
    if (user) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        try {
          const [caseTypes, references, districts, ipcSections, bnsSections] = await Promise.all([
            getcasetype(), showRefferenceDetails(), alldistrict(), showIpcSection(), showBnsSection(),
          ]);
          setCaseTypeList(caseTypes || []);
          setReferenceList(references || []);
          setAllDistrictList(districts || []);
          setIpcActList(ipcSections || []);
          setBnsSectionList(bnsSections || []);
        } catch (err) { openAlert("error", err?.message || "Failed to load initial data"); }
        finally { setIsLoading(false); }
      };
      fetchInitialData();
      fetchCases()
    }
  }, [user])

  const fetchCases = async () => {
    try {
      setIsLoading(true)
      const response = await postRequest("showallCaseBetweenRange", {
        startDate: null,
        endDate: null,
        isAssign: 2,
        EntryUserID: user.AuthorityUserID
      })

      if (response.status === 0) {
        setAllCases(response.data)
      }
    } catch (error) {
      console.error("Error fetching cases:", error)
      openAlert("error", "Failed to fetch cases")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (addFormData.districtId) {
      showpoliceBydistrict(addFormData.districtId)
        .then(setAllPSList)
        .catch((err) => { openAlert("error", err?.message || "Failed to load police stations"); setAllPSList([]); });
    } else {
      setAllPSList([]);
      setAddFormData(prev => ({ ...prev, psId: '' }));
    }
  }, [addFormData.districtId]);

  const handleAddChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  const handleAddSelectChange = (name, value) => {
    const newState = { ...addFormData, [name]: value };
    if (name === 'districtId') {
      newState.psId = '';
    }
    setAddFormData(newState);
  };

  const handleUpdateSelectChange = (name, value) => {
    setUpdateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({ ...prev, [name]: value }));
  };


  const addIpcSection = async (selectedBnsId) => {
    const currentTotal = selectedIpcSections.length + otherSectionsList.length;
    if (currentTotal >= MAX_TOTAL_SECTION_ENTRIES) { openAlert("error", `Maximum ${MAX_TOTAL_SECTION_ENTRIES} sections allowed.`); return; }
    if (selectedIpcSections.some(item => item.bnsId?.toString() === selectedBnsId)) { openAlert("error", "Section already added."); return; }

    // Find the selected item details (both IPC and BNS if available)
    const ipcItem = ipcActList.find(ipc => ipc.bnsId?.toString() === selectedBnsId);
    const bnsItem = bnsSectionList.find(bns => bns.bnsId?.toString() === selectedBnsId);

    // Determine the initially selected label based on current display mode
    const initialLabel = useIpcDisplay ? ipcItem?.ipcSection : bnsItem?.bnsSection;
    if (!initialLabel) { openAlert("error", "Invalid section details found."); return; }

    // Store both representations if possible, fetch if necessary
    let finalIpcSection = ipcItem?.ipcSection;
    let finalBnsSection = bnsItem?.bnsSection;

    // If one is missing, try to fetch it using showIbsByBnsId
    if (!finalIpcSection || !finalBnsSection) {
      try {
        setIsLoading(true); // Indicate loading for mapping fetch
        const mappingResult = await showIbsByBnsId(selectedBnsId);
        if (mappingResult && mappingResult.length > 0) {
          finalIpcSection = finalIpcSection || mappingResult[0].IpcSection;
          finalBnsSection = finalBnsSection || mappingResult[0].BnsSection;
        } else {
          console.warn(`Mapping not found for BNS ID: ${selectedBnsId}`);
          // Use placeholder if mapping fails
          finalIpcSection = finalIpcSection || `IPC for ${selectedBnsId}`;
          finalBnsSection = finalBnsSection || `BNS for ${selectedBnsId}`;
        }
      } catch (err) {
        console.error("Failed to fetch mapping:", err);
        openAlert("error", "Failed to fetch section mapping.");
        // Use placeholder on error
        finalIpcSection = finalIpcSection || `IPC for ${selectedBnsId}`;
        finalBnsSection = finalBnsSection || `BNS for ${selectedBnsId}`;
      } finally {
        setIsLoading(false);
      }
    }

    // Add the complete section data to the state
    setSelectedIpcSections(prev => [
      ...prev,
      {
        bnsId: selectedBnsId,
        ipcSection: finalIpcSection || 'N/A', // Ensure fallback
        bnsSection: finalBnsSection || 'N/A' // Ensure fallback
      }
    ]);
  };

  const removeIpcSection = (bnsIdToRemove) => {
    setSelectedIpcSections(prev => prev.filter(item => item.bnsId !== bnsIdToRemove));
  };

  const addOtherSectionRow = () => {
    const currentTotal = selectedIpcSections.length + otherSectionsList.length;
    if (currentTotal >= MAX_TOTAL_SECTION_ENTRIES) { openAlert("error", `Maximum ${MAX_TOTAL_SECTION_ENTRIES} sections allowed.`); return; }
    if (otherSectionsList.length >= MAX_OTHER_ROWS) { openAlert("error", `Maximum ${MAX_OTHER_ROWS} 'Other' section rows allowed.`); return; }
    const ipcInput = currentOtherIpc.trim();
    const bnsInput = currentOtherBns.trim();
    if (!ipcInput && !bnsInput) { openAlert("error", "Please enter at least an IPC Act or BNS Section."); return; }
    setOtherSectionsList(prev => [...prev, { id: Date.now(), ipcValue: ipcInput, bnsValue: bnsInput }]);
    setCurrentOtherIpc(""); setCurrentOtherBns("");
  };

  const removeOtherSectionRow = (idToRemove) => {
    setOtherSectionsList(prev => prev.filter(section => section.id !== idToRemove));
  };

  const addReference = () => {
    if (selectedReferences.length >= MAX_STANDARD_SECTIONS) {
      openAlert("error", `Maximum ${MAX_STANDARD_SECTIONS} references allowed!`);
      return
    }

    if (!currentReference.crmID || !currentReference.refferenceNumber) {
      openAlert("error", "Please fill all reference fields")
      return
    }

    if (
      selectedReferences.some(
        (ref) =>
          ref.crmID === currentReference.crmID &&
          ref.refferenceNumber === currentReference.refferenceNumber &&
          ref.refferenceyear === currentReference.refferenceyear,
      )
    ) {
      openAlert("error", "This reference is already added")
      return
    }

    setSelectedReferences((prev) => [...prev, { ...currentReference }])
    setCurrentReference({
      crmID: "",
      refferenceNumber: "",
      refferenceyear: new Date().getFullYear().toString(),
    })
  }

  // --- CRAN Entry Handlers ---
  const handleCranInputChange = (cranEntryId, field, value) => {
    setCranEntries(prev => prev.map(entry =>
      entry.id === cranEntryId ? { ...entry, [field]: value } : entry
    ));
  };

  const handleCranYearSelect = (cranEntryId, year) => {
    handleCranInputChange(cranEntryId, 'cranYear', year);
    setOpenYearSelects(prev => ({ ...prev, [cranEntryId]: false }));
  };

  const toggleCranYearPopover = (cranEntryId, isOpen) => {
    setOpenYearSelects(prev => ({ ...prev, [cranEntryId]: isOpen }));
  };

  const addCranEntry = () => {
    if (cranEntries.length >= MAX_CRAN_PER_REF) {
      openAlert("warning", `Maximum ${MAX_CRAN_PER_REF} CRAN entries allowed per reference.`);
      return;
    }
    setCranEntries(prev => [
      ...prev,
      { id: `new_cran_${Date.now()}`, cranNumber: "", cranYear: currentYear.toString(), documents: [] }
    ]);
  };

  const removeCranEntry = (cranEntryId) => {
    setCranEntries(prev => prev.filter(entry => entry.id !== cranEntryId));
  };

  // Document Handling per CRAN Entry
  const handleCranFileChange = (e, cranEntryId) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { openAlert("error", `${file.name} exceeds ${MAX_FILE_SIZE_MB} MB`); return false; }
      if (!["application/pdf"].includes(file.type)) { openAlert("error", `${file.name} is not a valid format (PDF only)`); return false; }
      return true;
    });

    setCranEntries(prev => prev.map(entry => {
      if (entry.id === cranEntryId) {
        const currentDocs = entry.documents || [];
        const newDocs = [...currentDocs, ...validFiles].filter((file, index, self) =>
          index === self.findIndex((f) => (f.name === file.name && f.size === file.size)));
        return { ...entry, documents: newDocs };
      }
      return entry;
    }));
    e.target.value = null; // Clear input
  };

  const removeCranDocument = (cranEntryId, docIndex) => {
    setCranEntries(prev => prev.map(entry => {
      if (entry.id === cranEntryId) {
        return { ...entry, documents: entry.documents.filter((_, i) => i !== docIndex) };
      }
      return entry;
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter((file) => {
      if (file.size > 50000 * 1024) {
        openAlert("error", `${file.name} exceeds 50 MB`)
        return false
      }
      // if (!["image/jpeg", "image/jpg", "application/pdf"].includes(file.type)) {
      if (!["application/pdf"].includes(file.type)) {
        openAlert("error", `${file.name} is not a valid format (PDF only)`)
        return false
      }
      return true
    })

    setDocuments((prev) => [...prev, ...validFiles])
  }

  // const removeDocument = (index) => {
  //   setDocuments((prev) => prev.filter((_, i) => i !== index))
  // }

  // --- Main Case Document Handlers ---
  const handleMainCaseFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { openAlert("error", `${file.name} exceeds ${MAX_FILE_SIZE_MB} MB`); return false; }
      if (!["application/pdf"].includes(file.type)) { openAlert("error", `${file.name} is not a valid format (PDF only)`); return false; }
      return true;
    });
    const newFiles = validFiles.filter(vf => !mainCaseDocuments.some(df => df.name === vf.name && df.size === vf.size));
    setMainCaseDocuments(prev => [...prev, ...newFiles]);
    e.target.value = null;
  };

  const removeMainCaseDocument = (index) => {
    setMainCaseDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // --- CRAN Modal and Entry Handlers ---
  const openCranModal = (cranToEdit = null) => {
    if (cranToEdit) {
      setEditingCran(cranToEdit); // Store the original object for reference/ID
      setCurrentCranDataInModal({ ...cranToEdit }); // Populate modal form with a copy
    } else {
      setEditingCran(null); // Clear editing state for new CRAN
      setCurrentCranDataInModal({ // Reset modal form for new CRAN
        id: `new_cran_${Date.now()}`, // Temporary ID for new
        cranNumber: "",
        cranYear: currentYear.toString(),
        documents: []
      });
    }
    setIsCranModalOpen(true);
  };

  const handleCranModalInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCranDataInModal(prev => ({ ...prev, [name]: value }));
  };

  const handleCranModalYearSelect = (year) => {
    setCurrentCranDataInModal(prev => ({ ...prev, cranYear: year }));
    setOpenCranModalYear(false);
  };

  const handleCranModalFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => { /* ... validation ... */ return true; });
    const newFiles = validFiles.filter(vf => !currentCranDataInModal.documents.some(df => df.name === vf.name && df.size === vf.size));
    setCurrentCranDataInModal(prev => ({ ...prev, documents: [...prev.documents, ...newFiles] }));
    e.target.value = null;
  };

  const removeCranModalDocument = (index) => {
    setCurrentCranDataInModal(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSaveCranFromModal = () => {
    if (!currentCranDataInModal.cranNumber?.trim() || !currentCranDataInModal.cranYear) {
      openAlert("error", "CRAN Number and CRAN Year are required in the modal.");
      return;
    }

    if (editingCran) { // Editing existing CRAN
      setCranEntries(prev => prev.map(cran =>
        cran.id === editingCran.id ? { ...currentCranDataInModal, id: editingCran.id } : cran // Ensure original ID is kept
      ));
    } else { // Adding new CRAN
      if (cranEntries.length >= MAX_CRAN_PER_REF) {
        openAlert("warning", `Maximum ${MAX_CRAN_PER_REF} CRAN entries allowed.`);
        setIsCranModalOpen(false); // Close modal as limit reached
        return;
      }
      setCranEntries(prev => [...prev, { ...currentCranDataInModal }]);
    }
    setIsCranModalOpen(false);
    setEditingCran(null); // Reset editing state
  };

  const removeCranEntryFromTable = (cranId) => { // Renamed to avoid conflict
    setCranEntries(prev => prev.filter(entry => entry.id !== cranId));
  };

  const handleAddCase = async () => {
    setIsLoading(true)
    setIsSubmitting(true);
    let savedCaseId = null;
    let savedReferenceId = null;
    let cranSaveErrors = [];
    let successfulCrans = 0;
    let mainDocsUploadError = false;

    try {
      // --- Validation ---
      const requiredFields = [
        { field: "caseNumber", label: "Case Number" }, { field: "CaseDate", label: "Case Date" },
        { field: "districtId", label: "District" }, { field: "psId", label: "Police Station" },
        { field: "caseTypeId", label: "Case Type" }, { field: "hearingDate", label: "Hearing Date" },
        { field: "filingDate", label: "Filing Date" }, { field: "petitionName", label: "Petitioner Name" },
        { field: "CourtCaseDescription", label: "Court Case Description" },
        { field: "crmID", label: "Reference Type" }, { field: "refferenceNumber", label: "Reference Number" }, { field: "refferenceyear", label: "Reference Year" },
      ]
      const missingFields = requiredFields.filter(({ field }) => !addFormData[field]);
      if (missingFields.length > 0) { throw `Please fill required fields: ${missingFields.map(f => f.label).join(", ")}`; }
      if (addFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length > 100) { throw "Description cannot exceed 100 words."; }
      if (selectedIpcSections.length === 0 && otherSectionsList.length === 0) { throw "Please add at least one IPC/BNS section."; }

      // --- Prepare Payload for Case + Single Reference ---
      const finalStandardSections = selectedIpcSections.map(section => ({
        bnsId: section.bnsId.toString(), otherIpcAct: "", otherBnsAct: ""
      }));
      const finalOtherSections = otherSectionsList.map(row => ({
        bnsId: OTHER_SECTION_BNS_ID.toString(), otherIpcAct: row.ipcValue, otherBnsAct: row.bnsValue
      }));
      const combinedIpcSections = [...finalStandardSections, ...finalOtherSections];

      // The single reference is already part of addFormData.
      // createCaseV3 expects 'refferences' as an array.
      const singleReferencePayload = [{
        crmID: addFormData.crmID,
        refferenceNumber: addFormData.refferenceNumber,
        refferenceyear: addFormData.refferenceyear
        // If SP needs InreffeeenceID: 0 for new, will add it here: InreffeeenceID: 0
      }];

      const caseApiData = {
        ...addFormData,
        ipcSections: combinedIpcSections,
        refferences: singleReferencePayload, // Send the single reference as an array
        removedSections: [], // Required by createCaseV3 for add operations
      };

      console.log("Submitting Case Data (V3):", caseApiData);
      const caseResult = await createOrUpdateCaseV3(caseApiData);

      if (caseResult && caseResult.status === 0 && caseResult.data?.CaseID && caseResult.data?.CrmID) { // Expecting CrmID as ReferenceID
        savedCaseId = caseResult.data.CaseID;
        savedReferenceId = caseResult.data.CrmID; // This is the @Out_crmID from sp_Createcase_v2
        console.log(`Case created: ${savedCaseId}, Reference saved with ID: ${savedReferenceId}`);

        // --- Upload Main Case Documents (if any) ---
        if (mainCaseDocuments.length > 0) {
          try {
            console.log(`Uploading ${mainCaseDocuments.length} main case documents for CaseID: ${savedCaseId}`);
            await uploadCaseDocuments(savedCaseId, mainCaseDocuments, user.AuthorityUserID); // Original doc upload
            console.log("Main case documents uploaded successfully.");
          } catch (docUploadError) {
            mainDocsUploadError = true;
            console.error("Main case document upload failed:", docUploadError);
            cranSaveErrors.push(`Main case documents failed to upload: ${docUploadError.message || String(docUploadError)}`);
          }
        }

        // --- Save CRAN Entries (if any) ---
        if (cranEntries.length > 0) {
          for (const entry of cranEntries) { // entry here is from cranEntries state
            // Validate CRAN entry from state
            if (!entry.cranNumber?.trim() || !entry.cranYear) {
              cranSaveErrors.push(`Skipping CRAN (Temp ID: ${entry.id}) due to missing Number/Year.`);
              continue;
            }
            try {
              const cranPayload = {
                caseId: savedCaseId, refferenceId: savedReferenceId, cranNumber: entry.cranNumber,
                cranYear: entry.cranYear, EntryUserID: user.AuthorityUserID
              };
              const cranSaveResult = await createCranOfficeAdmin(cranPayload);

              if (cranSaveResult && cranSaveResult.status === 0 && cranSaveResult.data?.CranID) {
                const savedCranId = cranSaveResult.data.CranID;

                if (entry.documents && entry.documents.length > 0) {
                  try {
                    const safeDocuments = Array.isArray(entry.documents)
                      ? entry.documents
                      : Array.from(entry.documents || []);

                    console.log(`Uploading ${safeDocuments.length} documents for CRAN ID: ${savedCranId}`);
                    await uploadCaseDocumentsV1(
                      savedCaseId.toString(),
                      savedReferenceId.toString(),
                      savedCranId.toString(),
                      safeDocuments,
                      user.AuthorityUserID
                    );
                    console.log(`Documents uploaded successfully for CRAN ID: ${savedCranId}`);
                  } catch (uploadError) {
                    console.error(`Document upload failed for CRAN ID ${savedCranId}:`, uploadError);
                    submissionErrors.push(`CRAN ${entry.cranNumber}/${entry.cranYear} (ID: ${savedCranId}) saved, but document upload failed: ${uploadError}`);
                  }
                }
                successfulCrans++;

              } else { throw new Error(cranSaveResult?.message || `Failed to create CRAN ${entry.cranNumber}/${entry.cranYear}.`); }
            } catch (cranError) { cranSaveErrors.push(`Error saving CRAN ${entry.cranNumber}/${entry.cranYear}: ${cranError.message || String(cranError)}`); }
          }
        }
      } else { throw new Error(caseResult?.message || "Failed to create Case or get required IDs (CaseID/ReferenceID)."); }

      // --- Final Feedback ---
      let finalAlertMessage = "";
      let finalAlertType = "success";

      if (savedCaseId) {
        finalAlertMessage = `Case ${savedCaseId} created.`;

        if (cranEntries.length > 0) {
          finalAlertMessage += ` ${successfulCrans} CRAN(s) processed.`;
        }

        if (mainDocsUploadError || cranSaveErrors.length > 0) {
          finalAlertType = "warning";
          finalAlertMessage += `\nSome operations had issues:\n`;

          if (mainDocsUploadError) {
            finalAlertMessage += "- Main document upload failed.\n";
          }

          cranSaveErrors.forEach(err => {
            finalAlertMessage += `- ${err}\n`;
          });
        } else {
          finalAlertMessage += " All operations successful!";
        }
      } else {
        // Should not happen if case creation is mandatory
        finalAlertType = "error";
        finalAlertMessage = "Case creation failed.";
      }

      openAlert(finalAlertType, finalAlertMessage.trim());


      // --- Reset Form (only on full or partial success where case is created) ---
      if (savedCaseId) {
        setAddFormData({
          caseNumber: "", EntryUserID: user?.AuthorityUserID || "", CaseDate: "", districtId: "", psId: "", caseTypeId: "",
          filingDate: new Date().toISOString().split("T")[0], petitionName: "", hearingDate: "", CourtCaseDescription: "",
          crmID: "", refferenceNumber: "", refferenceyear: currentYear.toString(),
        });
        setSelectedIpcSections([]); setOtherSectionsList([]);
        setCurrentOtherIpc(""); setCurrentOtherBns("");
        setCranEntries([]); setMainCaseDocuments([]);
        setOpenDistrict(false); setOpenPS(false); setOpenCaseType(false); setOpenReference(false); setOpenYear(false); setOpenIpcAct(false); setOpenYearSelects({});
      }

    } catch (err) {
      console.error("Error in handleAddCase:", err);
      openAlert("error", err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const handleUpdateCase = async () => {
    setIsLoading(true);
    setIsSubmitting(true);

    let savedCaseId = null;
    let savedReferenceId = null;
    let cranSaveErrors = [];
    let successfulCrans = 0;
    let mainDocsUploadError = false;

    try {
      const requiredFields = [
        { field: "hearingDate", label: "Hearing Date" },
        { field: "filingDate", label: "Filing Date" },
        { field: "petitionName", label: "Petitioner Name" },
        { field: "CourtCaseDescription", label: "Court Case Description" },
        { field: "crmID", label: "Reference Type" },
        { field: "refferenceNumber", label: "Reference Number" },
        { field: "refferenceyear", label: "Reference Year" },
      ];
      const missingFields = requiredFields.filter(({ field }) => !updateFormData[field]);
      if (missingFields.length > 0) {
        throw `Please fill required fields: ${missingFields.map(f => f.label).join(", ")}`;
      }

      if (updateFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length > 100) {
        throw "Description cannot exceed 100 words.";
      }

      if (selectedIpcSections.length === 0 && otherSectionsList.length === 0) {
        throw "Please add at least one IPC/BNS section.";
      }

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
        ...updateFormData,
        ipcSections: combinedIpcSections,
        refferences: selectedReferences,
        removedSections: [],
      };

      const caseResult = await createOrUpdateCaseV3(apiData);

      if (caseResult && caseResult.status === 0 && caseResult.data?.CaseID && caseResult.data?.CrmID) {
        savedCaseId = caseResult.data.CaseID;
        savedReferenceId = caseResult.data.CrmID;

        if (documents.length > 0) {
          try {
            await uploadCaseDocuments(savedCaseId, documents, user.AuthorityUserID);
          } catch (docUploadError) {
            mainDocsUploadError = true;
            cranSaveErrors.push(`Main case documents failed to upload: ${docUploadError.message || String(docUploadError)}`);
          }
        }

        if (cranEntries.length > 0) {
          for (const entry of cranEntries) {
            if (!entry.cranNumber?.trim() || !entry.cranYear) {
              cranSaveErrors.push(`Skipping CRAN (Temp ID: ${entry.id}) due to missing Number/Year.`);
              continue;
            }

            try {
              const cranPayload = {
                caseId: savedCaseId,
                refferenceId: savedReferenceId,
                cranNumber: entry.cranNumber,
                cranYear: entry.cranYear,
                EntryUserID: user.AuthorityUserID,
              };

              const cranSaveResult = await createCranOfficeAdmin(cranPayload);

              if (cranSaveResult && cranSaveResult.status === 0 && cranSaveResult.data?.CranID) {
                const savedCranId = cranSaveResult.data.CranID;

                if (entry.documents && entry.documents.length > 0) {
                  try {
                    const safeDocuments = Array.isArray(entry.documents)
                      ? entry.documents
                      : Array.from(entry.documents || []);

                    await uploadCaseDocumentsV1(
                      savedCaseId.toString(),
                      savedReferenceId.toString(),
                      savedCranId.toString(),
                      safeDocuments,
                      user.AuthorityUserID
                    );
                  } catch (uploadError) {
                    cranSaveErrors.push(`CRAN ${entry.cranNumber}/${entry.cranYear} (ID: ${savedCranId}) saved, but document upload failed: ${uploadError}`);
                  }
                }

                successfulCrans++;
              } else {
                throw new Error(cranSaveResult?.message || `Failed to create CRAN ${entry.cranNumber}/${entry.cranYear}.`);
              }
            } catch (cranError) {
              cranSaveErrors.push(`Error saving CRAN ${entry.cranNumber}/${entry.cranYear}: ${cranError.message || String(cranError)}`);
            }
          }
        }
      } else {
        throw new Error(caseResult?.message || "Failed to update Case or get required IDs (CaseID/ReferenceID).");
      }

      // --- Final feedback
      let finalAlertMessage = `Case ${savedCaseId} updated.`;
      let finalAlertType = "success";

      if (cranEntries.length > 0) {
        finalAlertMessage += ` ${successfulCrans} CRAN(s) processed.`;
      }

      if (mainDocsUploadError || cranSaveErrors.length > 0) {
        finalAlertType = "warning";
        finalAlertMessage += `\nSome operations had issues:\n`;

        if (mainDocsUploadError) {
          finalAlertMessage += "- Main document upload failed.\n";
        }

        cranSaveErrors.forEach(err => {
          finalAlertMessage += `- ${err}\n`;
        });
      } else {
        finalAlertMessage += " All operations successful!";
      }

      openAlert(finalAlertType, finalAlertMessage.trim());

      // --- Reset if success
      if (savedCaseId) {
        setUpdateFormData({
          CaseId: "", caseNumber: "", EntryUserID: user?.AuthorityUserID || "", CaseDate: "",
          districtId: "", psId: "", caseTypeId: "", filingDate: "",
          petitionName: "", hearingDate: "", CourtCaseDescription: "",
          crmID: "", refferenceNumber: "", refferenceyear: currentYear.toString(),
        });
        setSelectedIpcSections([]);
        setOtherSectionsList([]);
        setDocuments([]);
        setCranEntries([]);
        setSelectedReferences([]);
        setMatchedCases([]);
      }

    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : err.message || "Unknown error";
      openAlert("error", errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
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
            <CardTitle className="text-white text-xl">Case Management</CardTitle>
          </CardHeader>

          <Tabs defaultValue="add" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mx-6 mt-4">
              <TabsTrigger value="add">Add New Case</TabsTrigger>
              <TabsTrigger value="update">Add Ref. to Existing Case</TabsTrigger>
            </TabsList>

            {/* Add New Case Tab */}
            <TabsContent value="add">
              <div>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-5">
                    {/* Case Details Fields (Rows 1-4) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="caseNumber">PS Case No.<span className="text-red-500">*</span></Label> <Input id="caseNumber" name="caseNumber" value={addFormData.caseNumber} onChange={handleAddChange} disabled={isSubmitting} /> </div>
                      <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="CaseDate">PS Case Date<span className="text-red-500">*</span></Label> <Input id="CaseDate" name="CaseDate" type="date" value={addFormData.CaseDate} onChange={handleAddChange} max={new Date().toISOString().split("T")[0]} disabled={isSubmitting} /> </div>
                    </div>
                    {/* ... other case detail rows (Petitioner, Filing, District, PS, Case Type, Hearing) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="petitionName">Petitioner Name<span className="text-red-500">*</span></Label> <Input id="petitionName" name="petitionName" value={addFormData.petitionName} onChange={handleAddChange} disabled={isSubmitting} /> </div>
                      <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="filingDate">Filing Date<span className="text-red-500">*</span></Label> <Input id="filingDate" name="filingDate" type="date" value={addFormData.filingDate} onChange={handleAddChange} max={new Date().toISOString().split("T")[0]} disabled={isSubmitting} /> </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-semibold" htmlFor="districtId">
                          District<span className="text-red-500">*</span>
                        </Label>
                        <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between font-normal" disabled={isSubmitting}> {addFormData.districtId ? allDistrictList.find(d => d.districtId.toString() === addFormData.districtId)?.districtName : "Select District"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput />
                              <CommandList>
                                <CommandEmpty />
                                <CommandGroup>{(allDistrictList || []).map(d => (<CommandItem key={d.districtId} value={d.districtName} onSelect={() => { handleAddSelectChange("districtId", d.districtId.toString()); setOpenDistrict(false); }}>
                                  <Check className={cn(addFormData.districtId === d.districtId.toString() ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{d.districtName}</CommandItem>))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-semibold" htmlFor="psId">
                          Police Station<span className="text-red-500">*</span>
                        </Label>
                        <Popover open={openPS} onOpenChange={setOpenPS}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between font-normal" disabled={!addFormData.districtId || allPSList.length === 0 || isSubmitting}> {addFormData.psId ? allPSList.find(ps => ps.id.toString() === addFormData.psId)?.ps_name : "Select PS"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput />
                              <CommandList>
                                <CommandEmpty />
                                <CommandGroup>
                                  {(allPSList || []).map(ps => (<CommandItem key={ps.id} value={ps.ps_name} onSelect={() => { handleAddSelectChange("psId", ps.id.toString()); setOpenPS(false); }}><Check className={cn(addFormData.psId === ps.id.toString() ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{ps.ps_name}</CommandItem>))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-semibold" htmlFor="caseTypeId">
                          Case Type<span className="text-red-500">*</span>
                        </Label>
                        <Popover open={openCaseType} onOpenChange={setOpenCaseType}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between font-normal" disabled={isSubmitting}> {addFormData.caseTypeId ? caseTypeList.find(ct => ct.CasetypeId.toString() === addFormData.caseTypeId)?.CasetypeName : "Select Case Type"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput />
                              <CommandList>
                                <CommandEmpty />
                                <CommandGroup>
                                  {(caseTypeList || []).map(ct => (<CommandItem key={ct.CasetypeId} value={ct.CasetypeName} onSelect={() => { handleAddSelectChange("caseTypeId", ct.CasetypeId.toString()); setOpenCaseType(false); }}>
                                    <Check className={cn(addFormData.caseTypeId === ct.CasetypeId.toString() ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{ct.CasetypeName}</CommandItem>))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-semibold" htmlFor="hearingDate">
                          Hearing Date<span className="text-red-500">*</span>
                        </Label>
                        <Input id="hearingDate" name="hearingDate" type="date" value={addFormData.hearingDate} onChange={handleAddChange} min={addFormData.CaseDate || undefined} disabled={isSubmitting} />
                      </div>
                    </div>

                    <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="CourtCaseDescription">Description<span className="text-red-500">*</span> (Max 100 words)</Label> <textarea id="CourtCaseDescription" name="CourtCaseDescription" rows={3} value={addFormData.CourtCaseDescription} onChange={handleAddChange} className="w-full border rounded-md px-3 py-2 text-sm" disabled={isSubmitting} /> <p className={cn("text-xs text-right", addFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length > 100 ? "text-red-600" : "text-gray-500")}> {addFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length} / 100 words </p> </div>

                    {/* --- Single Reference Section --- */}
                    <div className="space-y-3 border-t pt-4 mt-2">
                      <Label className="font-semibold text-gray-700 text-md">Reference Details <span className="text-red-500">*</span></Label>
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          {/* <Label className="text-xs text-gray-600" htmlFor="crmID">Reference Type</Label>
                        <div className="space-y-1.5"> */}
                          <Label className="text-xs text-gray-600" htmlFor="crmID">Reference Type</Label>
                          <Popover open={openReference} onOpenChange={setOpenReference}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-sm" disabled={isLoading || isSubmitting}> {addFormData.crmID ? referenceList.find(r => r.refferenceId.toString() === addFormData.crmID)?.refferenceName : "Select Reference Type..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput />
                                <CommandList>
                                  <CommandEmpty />
                                  <CommandGroup>
                                    {(referenceList || []).map(r => (<CommandItem key={r.refferenceId} value={r.refferenceName} onSelect={() => { handleAddSelectChange("crmID", r.refferenceId.toString()); setOpenReference(false); }}>
                                      <Check className={cn(addFormData.crmID === r.refferenceId.toString() ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{r.refferenceName}</CommandItem>))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {/* </div> */}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-600" htmlFor="refferenceNumber">
                            Reference Number
                          </Label>
                          <Input id="refferenceNumber" name="refferenceNumber" value={addFormData.refferenceNumber} onChange={handleAddChange} className="text-sm" disabled={isSubmitting} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-600" htmlFor="refferenceyear">
                            Reference Year
                          </Label>
                          <Popover open={openYear} onOpenChange={setOpenYear}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between text-sm font-normal" disabled={isSubmitting}> {addFormData.refferenceyear || "Select Year..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput />
                                <CommandList>
                                  <CommandEmpty />
                                  <CommandGroup>
                                    {years.map(y => (<CommandItem key={y} value={y} onSelect={() => { handleAddSelectChange("refferenceyear", y); setOpenYear(false); }}>
                                      <Check className={cn(addFormData.refferenceyear === y ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{y}</CommandItem>))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    {/* --- IPC/BNS Sections --- */}
                    <div className="space-y-3 border-t pt-4 mt-2">
                      <Label className="font-semibold text-gray-700 text-md">IPC / BNS Sections <span className="text-red-500">*</span></Label>
                      <div className={`relative w-20 h-8 rounded-full flex items-center cursor-pointer transition-all ${useIpcDisplay ? "bg-blue-600" : "bg-green-600"} mb-2`} onClick={() => setUseIpcDisplay(prev => !prev)}> <span className="absolute w-full text-xs font-bold text-white flex justify-center transition-all"> {useIpcDisplay ? "IPC" : "BNS"} </span> <div className={`absolute w-7 h-7 bg-white rounded-full shadow-md transform transition-all ${useIpcDisplay ? "translate-x-1" : "translate-x-12"}`} /> </div>
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                        {selectedIpcSections.map((section) => (<Badge key={section.bnsId} variant="secondary" className="flex items-center gap-2 py-1.5 px-2.5 text-xs"> <div>{useIpcDisplay ? section.ipcSection : section.bnsSection}</div> <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => removeIpcSection(section.bnsId)} disabled={isSubmitting}><X className="h-3 w-3" /></Button> </Badge>))}
                      </div>
                      <Popover open={openIpcAct} onOpenChange={setOpenIpcAct}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-sm" disabled={isLoading || isSubmitting || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_SECTION_ENTRIES}> {useIpcDisplay ? "Select IPC..." : "Select BNS..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder={`Search ${useIpcDisplay ? 'IPC' : 'BNS'}...`} />
                            <CommandList>
                              <CommandEmpty />
                              <CommandGroup>{(useIpcDisplay ? ipcActList : bnsSectionList).filter(e => !selectedIpcSections.some(s => s.bnsId.toString() === e.bnsId.toString())).map(e => (<CommandItem key={e.bnsId} value={useIpcDisplay ? e.ipcSection : e.bnsSection} onSelect={() => { addIpcSection(e.bnsId.toString()); setOpenIpcAct(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />{useIpcDisplay ? e.ipcSection : e.bnsSection}</CommandItem>))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* --- Other Sections --- */}
                    <div className="space-y-3 mt-2">
                      <Label className="font-semibold text-gray-700 text-md">Other Sections</Label>
                      <div className="flex items-end gap-2 mb-2">
                        <div className="flex-1 space-y-1"><Label htmlFor="otherIpc" className="text-xs">Other IPC Act</Label><Input id="otherIpc" value={currentOtherIpc} onChange={e => setCurrentOtherIpc(e.target.value)} className="text-sm" disabled={isSubmitting || otherSectionsList.length >= MAX_OTHER_ROWS || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_SECTION_ENTRIES} /></div>
                        <div className="flex-1 space-y-1"><Label htmlFor="otherBns" className="text-xs">Corresp. BNS</Label><Input id="otherBns" value={currentOtherBns} onChange={e => setCurrentOtherBns(e.target.value)} className="text-sm" disabled={isSubmitting || otherSectionsList.length >= MAX_OTHER_ROWS || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_SECTION_ENTRIES} /></div>
                        <Button size="icon" onClick={addOtherSectionRow} className="h-9 w-9 shrink-0" disabled={isLoading || isSubmitting || (!currentOtherIpc.trim() && !currentOtherBns.trim()) || otherSectionsList.length >= MAX_OTHER_ROWS || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_SECTION_ENTRIES}><Plus className="h-4 w-4" /></Button>
                      </div>
                      {otherSectionsList.length > 0 && (<div className="border rounded-md overflow-hidden mt-4"><Table><TableHeader><TableRow><TableHead>Other IPC</TableHead><TableHead>Other BNS</TableHead><TableHead className="w-[50px] text-right">Act</TableHead></TableRow></TableHeader><TableBody>{otherSectionsList.map(s => (<TableRow key={s.id}><TableCell className="text-sm">{s.ipcValue || "-"}</TableCell><TableCell className="text-sm">{s.bnsValue || "-"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeOtherSectionRow(s.id)} className="h-7 w-7 text-red-500 hover:bg-red-100" disabled={isSubmitting}><Trash className="h-3.5 w-3.5" /></Button></TableCell></TableRow>))}</TableBody></Table></div>)}
                    </div>

                    {/* --- Main Case Document Upload --- */}
                    <div className="space-y-3 border-t pt-4 mt-2">
                      <Label className="font-semibold text-gray-700 text-md">Upload Case Documents (Optional)</Label>
                      <Input type="file" multiple onChange={handleMainCaseFileChange} accept=".pdf" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 h-11" disabled={isSubmitting} />
                      {mainCaseDocuments.length > 0 && (<div className="mt-3 space-y-2"> <p className="text-sm font-medium text-gray-600">Selected Case Documents:</p> <ul className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50"> {mainCaseDocuments.map((file, index) => (<li key={index} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-gray-100"> <div className="flex items-center overflow-hidden mr-2"> <FileText className="h-4 w-4 mr-2 text-gray-500 shrink-0" /> <span className="truncate" title={file.name}>{file.name}</span> <span className="ml-2 text-gray-500 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span> </div> <Button size="sm" variant="ghost" onClick={() => removeMainCaseDocument(index)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-100" disabled={isSubmitting}><Trash className="h-3.5 w-3.5" /></Button> </li>))} </ul> </div>)}
                      <p className="text-xs text-gray-500">Max file size: {MAX_FILE_SIZE_MB} MB. Allowed format: PDF</p>
                    </div>


                    {/* --- CRAN Entry Section (Conditional on Reference Selection) --- */}
                    <div className="space-y-4 border-t pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <Label className="font-semibold text-gray-700 text-lg block">
                          CRAN Details for Reference
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCranModal()} // Opens modal for NEW CRAN
                          disabled={!addFormData.crmID || !addFormData.refferenceNumber || !addFormData.refferenceyear || isSubmitting || cranEntries.length >= MAX_CRAN_PER_REF}
                          className="text-xs"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add CRAN Entry
                        </Button>
                      </div>
                      {addFormData.crmID && (
                        <p className="text-sm text-gray-600">
                          CRANs will be associated with reference: <span className="font-medium">{referenceList.find(r => r.refferenceId.toString() === addFormData.crmID)?.refferenceName || addFormData.crmID} - {addFormData.refferenceNumber}/{addFormData.refferenceyear}</span>
                        </p>
                      )}
                      {!addFormData.crmID && <p className="text-sm text-muted-foreground">Please fill in reference details above to add CRAN entries.</p>}

                      {/* Table to display added CRAN entries */}
                      {cranEntries.length > 0 && (
                        <div className="border rounded-md overflow-hidden mt-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[30%]">CRAN Number</TableHead>
                                <TableHead className="w-[20%]">CRAN Year</TableHead>
                                <TableHead>Documents</TableHead>
                                <TableHead className="text-right w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cranEntries.map((entry) => (
                                <TableRow key={entry.id}>
                                  <TableCell className="text-sm font-medium">{entry.cranNumber}</TableCell>
                                  <TableCell className="text-sm">{entry.cranYear}</TableCell>
                                  <TableCell className="text-xs">
                                    {entry.documents.length > 0 ? `${entry.documents.length} file(s)` : "No documents"}
                                  </TableCell>
                                  <TableCell className="text-right space-x-1">
                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openCranModal(entry)} disabled={isSubmitting}>
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-100" onClick={() => removeCranEntryFromTable(entry.id)} disabled={isSubmitting}>
                                      <Trash className="h-3.5 w-3.5" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      {cranEntries.length >= MAX_CRAN_PER_REF && addFormData.crmID && (
                        <p className="text-xs text-muted-foreground mt-2">Maximum {MAX_CRAN_PER_REF} CRAN entries reached for this reference.</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center mt-6 border-t pt-6">
                      <Button onClick={handleAddCase} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md shadow-md text-base" disabled={isSubmitting || isLoading}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Add Case and Associated CRANs"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </TabsContent>

            {/* Update Existing Case Tab */}
            <TabsContent value="update">
              <div>

                <CardContent className="p-6">
                  <Card className="mb-6 border bg-gray-50 shadow-sm p-4">
                    <CardTitle className="text-base font-semibold text-gray-700 mb-5">🔍 Search for a Case</CardTitle>

                    {/* Step 1: Search Type Selector */}
                    <div className="flex gap-4 mb-4">
                      <Label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="searchType"
                          value="1"
                          checked={searchType === "1"}
                          onChange={() => setSearchType("1")}
                        />
                        Search by Case
                      </Label>
                      <Label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="searchType"
                          value="2"
                          checked={searchType === "2"}
                          onChange={() => setSearchType("2")}
                        />
                        Search by Reference
                      </Label>
                    </div>

                    {/* Step 2: Conditional Inputs */}
                    {searchType === "1" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Case Number</Label>
                          <Input value={searchInput.caseNumber} onChange={(e) => setSearchInput({ ...searchInput, caseNumber: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Case Date</Label>
                          <Input type="date" value={searchInput.caseDate} onChange={(e) => setSearchInput({ ...searchInput, caseDate: e.target.value })} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

                          <div className="space-y-1.5">
                            <Label>Reference Type</Label>
                            <Popover open={openReference} onOpenChange={setOpenReference}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                  {searchInput.referenceId ? referenceList.find(r => r.refferenceId.toString() === searchInput.referenceId)?.refferenceName : "Select Reference"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search reference..." />
                                  <CommandList>
                                    <CommandEmpty>No references found</CommandEmpty>
                                    <CommandGroup>
                                      {referenceList.map(r => (
                                        <CommandItem key={r.refferenceId} onSelect={() => { setSearchInput({ ...searchInput, referenceId: r.refferenceId.toString() }); setOpenReference(false); }}>
                                          <Check className="mr-2 h-4 w-4" /> {r.refferenceName}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                          <div className="space-y-1.5">
                            <Label>Reference Number</Label>
                            <Input value={searchInput.referenceNumber} onChange={(e) => setSearchInput({ ...searchInput, referenceNumber: e.target.value })} />
                          </div>

                          <div className="space-y-1.5">
                            <Label>Reference Year</Label>
                            <Popover open={openYear} onOpenChange={setOpenYear}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                  {searchInput.referenceYear || "Select Year"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search year..." />
                                  <CommandList>
                                    <CommandEmpty>No years found</CommandEmpty>
                                    <CommandGroup>
                                      {years.map((year) => (
                                        <CommandItem key={year} onSelect={() => { setSearchInput({ ...searchInput, referenceYear: year }); setOpenYear(false); }}>
                                          <Check className="mr-2 h-4 w-4" /> {year}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                        </div>
                      </>
                    )}

                    {/* Step 3: Search Button */}
                    <div className="mt-4">
                      <Button onClick={handleSearchCase}>Search Case</Button>
                    </div>

                    {/* Step 4: Populate Select Dropdown */}
                    {matchedCases.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <Label>Select Case</Label>
                        <Popover open={openCaseSelect} onOpenChange={setOpenCaseSelect}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              {updateFormData.caseNumber || "Select a Case"}
                              <ChevronsUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search cases..." />
                              <CommandList>
                                <CommandEmpty>No cases found</CommandEmpty>
                                <CommandGroup>
                                  {matchedCases.map(c => (
                                    <CommandItem key={c.CaseId} onSelect={() => handleSelectMatchedCase(c)}>
                                      <Check className="mr-2 h-4 w-4" /> {`${c.CaseType} ${c.CaseNumber} | Dept.- ${c.DistrictName} | PS - ${c.PoliceName} | ${formatDate(c.CaseDate)} | Ref.- ${c.RefferenceName.length > 20 ? c.RefferenceName.substring(0, 20) + '...' : c.RefferenceName} - ${c.RefferenceNumber} - ${c.RefferenceYear}`}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </Card>

                  <Card className="mt-6 border bg-white shadow p-4">
                    <CardTitle className="text-base font-semibold text-gray-700 mb-4">📝 Update Selected Case</CardTitle>


                    {/* Step 5: Render Update Form if Case Selected */}
                    {updateFormData.CaseId && (
                      <div className="mt-6 border-t pt-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="petitionName">Petitioner Name<span className="text-red-500">*</span></Label> <Input id="petitionName" name="petitionName" value={updateFormData.petitionName} onChange={handleUpdateChange} disabled={isSubmitting} /> </div>
                          <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="filingDate">Filing Date<span className="text-red-500">*</span></Label> <Input id="filingDate" name="filingDate" type="date" value={updateFormData.filingDate} onChange={handleUpdateChange} max={new Date().toISOString().split("T")[0]} disabled={isSubmitting} /> </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                            <Label className="font-semibold" htmlFor="hearingDate">
                              Hearing Date<span className="text-red-500">*</span>
                            </Label>
                            <Input id="hearingDate" name="hearingDate" type="date" value={updateFormData.hearingDate} onChange={handleUpdateChange} min={updateFormData.CaseDate || undefined} disabled={isSubmitting} />
                          </div>
                        </div>

                        <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="CourtCaseDescription">Description<span className="text-red-500">*</span> (Max 100 words)</Label> <textarea id="CourtCaseDescription" name="CourtCaseDescription" rows={3} value={updateFormData.CourtCaseDescription} onChange={handleUpdateChange} className="w-full border rounded-md px-3 py-2 text-sm" disabled={isSubmitting} /> <p className={cn("text-xs text-right", updateFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length > 100 ? "text-red-600" : "text-gray-500")}> {updateFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length} / 100 words </p> </div>

                        {/* --- Single Reference Section --- */}
                        <div className="space-y-3 border-t pt-4 mt-2">

                          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <Label className="font-semibold text-gray-700 text-md">Reference Details <span className="text-red-500">*</span></Label>
                            <div className="space-y-1.5">
                              <Label className="text-sm text-gray-700" htmlFor="crmID">Reference Type</Label>
                              <Popover open={openUpdateReference} onOpenChange={setOpenUpdateReference}>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" role="combobox" className="w-full justify-between text-sm font-normal">
                                    {updateFormData.crmID
                                      ? referenceList.find(r => r.refferenceId.toString() === updateFormData.crmID)?.refferenceName
                                      : "Select Reference Type"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                  <Command>
                                    <CommandInput />
                                    <CommandList>
                                      <CommandEmpty />
                                      <CommandGroup>
                                        {referenceList.map(r => (
                                          <CommandItem key={r.refferenceId} value={r.refferenceName} onSelect={() => {
                                            handleUpdateSelectChange("crmID", r.refferenceId.toString());
                                            setOpenUpdateReference(false);
                                          }}>
                                            <Check className={cn(updateFormData.crmID === r.refferenceId.toString() ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />
                                            {r.refferenceName}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label className="text-sm text-gray-700" htmlFor="refferenceNumber">Reference Number</Label>
                                <Input id="refferenceNumber" name="refferenceNumber" value={updateFormData.refferenceNumber} onChange={handleUpdateChange} className="text-sm" />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-sm text-gray-700" htmlFor="refferenceyear">Reference Year</Label>
                                <Popover open={openUpdateYear} onOpenChange={setOpenUpdateYear}>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between text-sm font-normal">
                                      {updateFormData.refferenceyear || "Select Year"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                      <CommandInput />
                                      <CommandList>
                                        <CommandEmpty />
                                        <CommandGroup>
                                          {years.map(y => (
                                            <CommandItem key={y} value={y} onSelect={() => {
                                              handleUpdateSelectChange("refferenceyear", y);
                                              setOpenUpdateYear(false);
                                            }}>
                                              <Check className={cn(updateFormData.refferenceyear === y ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />
                                              {y}
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
                        </div>

                        {/* --- IPC/BNS Sections --- */}
                        <div className="space-y-3 border-t pt-4 mt-2">
                          <Label className="font-semibold text-gray-700 text-md">IPC / BNS Sections <span className="text-red-500">*</span></Label>
                          <div className={`relative w-20 h-8 rounded-full flex items-center cursor-pointer transition-all ${useIpcDisplay ? "bg-blue-600" : "bg-green-600"} mb-2`} onClick={() => setUseIpcDisplay(prev => !prev)}> <span className="absolute w-full text-xs font-bold text-white flex justify-center transition-all"> {useIpcDisplay ? "IPC" : "BNS"} </span> <div className={`absolute w-7 h-7 bg-white rounded-full shadow-md transform transition-all ${useIpcDisplay ? "translate-x-1" : "translate-x-12"}`} /> </div>
                          <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                            {selectedIpcSections.map((section) => (<Badge key={section.bnsId} variant="secondary" className="flex items-center gap-2 py-1.5 px-2.5 text-xs"> <div>{useIpcDisplay ? section.ipcSection : section.bnsSection}</div> <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => removeIpcSection(section.bnsId)} disabled={isSubmitting}><X className="h-3 w-3" /></Button> </Badge>))}
                          </div>
                          <Popover open={openIpcAct} onOpenChange={setOpenIpcAct}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-sm" disabled={isLoading || isSubmitting || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_SECTION_ENTRIES}> {useIpcDisplay ? "Select IPC..." : "Select BNS..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder={`Search ${useIpcDisplay ? 'IPC' : 'BNS'}...`} />
                                <CommandList>
                                  <CommandEmpty />
                                  <CommandGroup>{(useIpcDisplay ? ipcActList : bnsSectionList).filter(e => !selectedIpcSections.some(s => s.bnsId.toString() === e.bnsId.toString())).map(e => (<CommandItem key={e.bnsId} value={useIpcDisplay ? e.ipcSection : e.bnsSection} onSelect={() => { addIpcSection(e.bnsId.toString()); setOpenIpcAct(false); }}>
                                    <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />{useIpcDisplay ? e.ipcSection : e.bnsSection}</CommandItem>))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* --- Other Sections --- */}
                        <div className="space-y-3 mt-2">
                          <Label className="font-semibold text-gray-700 text-md">Other Sections</Label>
                          <div className="flex items-end gap-2 mb-2">
                            <div className="flex-1 space-y-1"><Label htmlFor="otherIpc" className="text-xs">Other IPC Act</Label><Input id="otherIpc" value={currentOtherIpc} onChange={e => setCurrentOtherIpc(e.target.value)} className="text-sm" disabled={isSubmitting || otherSectionsList.length >= MAX_OTHER_ROWS || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_SECTION_ENTRIES} /></div>
                            <div className="flex-1 space-y-1"><Label htmlFor="otherBns" className="text-xs">Corresp. BNS</Label><Input id="otherBns" value={currentOtherBns} onChange={e => setCurrentOtherBns(e.target.value)} className="text-sm" disabled={isSubmitting || otherSectionsList.length >= MAX_OTHER_ROWS || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_SECTION_ENTRIES} /></div>
                            <Button size="icon" onClick={addOtherSectionRow} className="h-9 w-9 shrink-0" disabled={isLoading || isSubmitting || (!currentOtherIpc.trim() && !currentOtherBns.trim()) || otherSectionsList.length >= MAX_OTHER_ROWS || selectedIpcSections.length + otherSectionsList.length >= MAX_TOTAL_SECTION_ENTRIES}><Plus className="h-4 w-4" /></Button>
                          </div>
                          {otherSectionsList.length > 0 && (<div className="border rounded-md overflow-hidden mt-4"><Table><TableHeader><TableRow><TableHead>Other IPC</TableHead><TableHead>Other BNS</TableHead><TableHead className="w-[50px] text-right">Act</TableHead></TableRow></TableHeader><TableBody>{otherSectionsList.map(s => (<TableRow key={s.id}><TableCell className="text-sm">{s.ipcValue || "-"}</TableCell><TableCell className="text-sm">{s.bnsValue || "-"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeOtherSectionRow(s.id)} className="h-7 w-7 text-red-500 hover:bg-red-100" disabled={isSubmitting}><Trash className="h-3.5 w-3.5" /></Button></TableCell></TableRow>))}</TableBody></Table></div>)}
                        </div>

                        {/* --- Main Case Document Upload --- */}
                        <div className="space-y-3 border-t pt-4 mt-2">
                          <Label className="font-semibold text-gray-700 text-md">Upload Case Documents (Optional)</Label>
                          <Input type="file" multiple onChange={handleMainCaseFileChange} accept=".pdf" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 h-11" disabled={isSubmitting} />
                          {mainCaseDocuments.length > 0 && (<div className="mt-3 space-y-2"> <p className="text-sm font-medium text-gray-600">Selected Case Documents:</p> <ul className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50"> {mainCaseDocuments.map((file, index) => (<li key={index} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-gray-100"> <div className="flex items-center overflow-hidden mr-2"> <FileText className="h-4 w-4 mr-2 text-gray-500 shrink-0" /> <span className="truncate" title={file.name}>{file.name}</span> <span className="ml-2 text-gray-500 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span> </div> <Button size="sm" variant="ghost" onClick={() => removeMainCaseDocument(index)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-100" disabled={isSubmitting}><Trash className="h-3.5 w-3.5" /></Button> </li>))} </ul> </div>)}
                          <p className="text-xs text-gray-500">Max file size: {MAX_FILE_SIZE_MB} MB. Allowed format: PDF</p>
                        </div>


                        {/* --- CRAN Entry Section (Conditional on Reference Selection) --- */}
                        <div className="space-y-4 border-t pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <Label className="font-semibold text-gray-700 text-lg block">
                              CRAN Details for Reference
                            </Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCranModal()} // Opens modal for NEW CRAN
                              disabled={!updateFormData.crmID || !updateFormData.refferenceNumber || !updateFormData.refferenceyear || isSubmitting || cranEntries.length >= MAX_CRAN_PER_REF}
                              className="text-xs"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add CRAN Entry
                            </Button>
                          </div>
                          {updateFormData.crmID && (
                            <p className="text-sm text-gray-600">
                              CRANs will be associated with reference: <span className="font-medium">{referenceList.find(r => r.refferenceId.toString() === updateFormData.crmID)?.refferenceName || updateFormData.crmID} - {updateFormData.refferenceNumber}/{updateFormData.refferenceyear}</span>
                            </p>
                          )}
                          {!updateFormData.crmID && <p className="text-sm text-muted-foreground">Please fill in reference details above to add CRAN entries.</p>}

                          {/* Table to display added CRAN entries */}
                          {cranEntries.length > 0 && (
                            <div className="border rounded-md overflow-hidden mt-2">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[30%]">CRAN Number</TableHead>
                                    <TableHead className="w-[20%]">CRAN Year</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {cranEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                      <TableCell className="text-sm font-medium">{entry.cranNumber}</TableCell>
                                      <TableCell className="text-sm">{entry.cranYear}</TableCell>
                                      <TableCell className="text-xs">
                                        {entry.documents.length > 0 ? `${entry.documents.length} file(s)` : "No documents"}
                                      </TableCell>
                                      <TableCell className="text-right space-x-1">
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openCranModal(entry)} disabled={isSubmitting}>
                                          <Edit3 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-100" onClick={() => removeCranEntryFromTable(entry.id)} disabled={isSubmitting}>
                                          <Trash className="h-3.5 w-3.5" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                          {cranEntries.length >= MAX_CRAN_PER_REF && updateFormData.crmID && (
                            <p className="text-xs text-muted-foreground mt-2">Maximum {MAX_CRAN_PER_REF} CRAN entries reached for this reference.</p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center mt-6 border-t pt-6">
                          <Button onClick={handleUpdateCase} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md shadow-md text-base" disabled={isSubmitting || isLoading}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Add Case and Associated CRANs"}
                          </Button>
                        </div>

                      </div>
                    )}
                  </Card>
                </CardContent>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* CRAN Add/Edit Modal */}
        <Dialog open={isCranModalOpen} onOpenChange={setIsCranModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCran ? "Edit CRAN Entry" : "Add New CRAN Entry"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modalCranNumber" className="text-right col-span-1 text-sm">CRAN No.<span className="text-red-500">*</span></Label>
                <Input id="modalCranNumber" name="cranNumber" value={currentCranDataInModal.cranNumber} onChange={handleCranModalInputChange} className="col-span-3 text-sm" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modalCranYear" className="text-right col-span-1 text-sm">CRAN Year<span className="text-red-500">*</span></Label>
                <Popover open={openCranModalYear} onOpenChange={setOpenCranModalYear}>
                  <PopoverTrigger asChild className="col-span-3">
                    <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-sm">
                      {currentCranDataInModal.cranYear || "Select Year..."} <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput /><CommandList><CommandEmpty /><CommandGroup>{years.map(y => (<CommandItem key={y} value={y} onSelect={() => handleCranModalYearSelect(y)}><Check className={cn(currentCranDataInModal.cranYear === y ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{y}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
                </Popover>
              </div>
              <div className="col-span-4 space-y-2">
                <Label htmlFor="modalCranDocs" className="text-sm flex items-center gap-1"><FileUp className="h-4 w-4" />Attach Documents (PDF)</Label>
                <Input id="modalCranDocs" type="file" multiple accept=".pdf" onChange={handleCranModalFileChange} className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {currentCranDataInModal.documents && currentCranDataInModal.documents.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs max-h-24 overflow-y-auto border p-1 rounded bg-gray-50">
                    {currentCranDataInModal.documents.map((f, di) => (<li key={di} className="flex justify-between items-center hover:bg-gray-100 px-1 py-0.5 rounded"><span className="truncate mr-1" title={f.name}>{f.name}</span><Button variant="ghost" size="icon" className="h-5 w-5 text-red-500 hover:bg-red-100 shrink-0" onClick={() => removeCranModalDocument(di)}><Trash className="h-3 w-3" /></Button></li>))}
                  </ul>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
              <Button type="button" onClick={handleSaveCranFromModal}>{editingCran ? "Update CRAN" : "Add CRAN to List"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default AddCasePage