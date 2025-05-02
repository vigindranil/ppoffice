"use client"

import { useState, useEffect } from "react"
import {
  createOrUpdateCaseV2,
  uploadCaseDocuments,
  getcasetype,
  showRefferenceDetails,
  alldistrict,
  showpoliceBydistrict,
  showIpcSection,
  showBnsSection,
  showIbsByBnsId,
  showJustSectionByCase,
  showJustReferenceByCase
} from "@/app/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { useSelector } from "react-redux"
import { Calendar, FileText, Hash, Clock, Trash, Plus, X, Pencil } from "lucide-react"
import { decrypt } from "@/utils/crypto"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { postRequest } from "@/app/commonAPI"
import { Badge } from "@/components/ui/badge"
import { EditSectionModal } from '@/components/modals/EditSectionModal';
import { EditReferenceModal } from '@/components/modals/EditReferenceModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

const AddCasePage = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [user, setUser] = useState(null)
  const encryptedUser = useSelector((state) => state.auth.user)
  const [allCases, setAllCases] = useState([])
  const [referenceList, setReferenceList] = useState([])
  const [allDistrictList, setAllDistrictList] = useState([])
  const [allPSList, setAllPSList] = useState([])
  const [caseTypeList, setCaseTypeList] = useState([])
  const [bnsSectionList, setBnsSectionList] = useState([])
  const [ipcActList, setIpcActList] = useState([])
  const [documents, setDocuments] = useState([])
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("add")
  const [openCaseSelect, setOpenCaseSelect] = useState(false)
  const [useIpcDisplay, setUseIpcDisplay] = useState(true)
  const [ipcToBnsMap, setIpcToBnsMap] = useState({})
  const [otherSectionsList, setOtherSectionsList] = useState([])
  const [currentOtherIpc, setCurrentOtherIpc] = useState("")
  const [currentOtherBns, setCurrentOtherBns] = useState("")

  // Dropdown state
  const [openDistrict, setOpenDistrict] = useState(false)
  const [openPS, setOpenPS] = useState(false)
  const [openCaseType, setOpenCaseType] = useState(false)
  const [openReference, setOpenReference] = useState(false)
  const [openIpcAct, setOpenIpcAct] = useState(false)
  const [openYear, setOpenYear] = useState(false)

  const OTHER_SECTION_BNS_ID = 534;

  const MAX_STANDARD_SECTIONS = 10;
  const MAX_OTHER_ROWS = 10;
  const MAX_TOTAL_ENTRIES = 20;
  const MAX_REFERENCES = 10;

  // Multiple selections
  const [selectedIpcSections, setSelectedIpcSections] = useState([])
  const [selectedReferences, setSelectedReferences] = useState([])
  const [currentReference, setCurrentReference] = useState({
    crmID: "",
    refferenceNumber: "",
    refferenceyear: new Date().getFullYear().toString(),
  })

  // ---> State for Edit Modals <---
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // Holds the section object being edited { type: 'standard'/'other', data: {...} }
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [editingReference, setEditingReference] = useState(null); // Holds the reference object being edited

  // Form data for adding new case
  const [addFormData, setAddFormData] = useState({
    CaseNumber: "",
    EntryUserID: "",
    CaseDate: "",
    districtId: "",
    psId: "",
    caseTypeId: "",
    filingDate: "",
    petitionName: "",
    hearingDate: "",
    CourtCaseDescription: "",
  })

  // Form data for updating existing case
  const [updateFormData, setUpdateFormData] = useState({
    CaseId: "",
    CaseNumber: "",
    EntryUserID: "",
    CaseDate: "",
    districtId: "",
    psId: "",
    caseTypeId: "",
    filingDate: "",
    petitionName: "",
    hearingDate: "",
  })

  // Years for reference dropdown
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString())

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser));
    setUser(decoded_user);
    const today = new Date().toISOString().split("T")[0];
    const commonData = { EntryUserID: decoded_user.AuthorityUserID, filingDate: today };
    setAddFormData(prev => ({ ...prev, ...commonData, CaseNumber: "", CaseDate: "", districtId: "", psId: "", caseTypeId: "", petitionName: "", hearingDate: "", CourtCaseDescription: "" }));
    setUpdateFormData(prev => ({ ...prev, ...commonData, CaseId: "", CaseNumber: "", CaseDate: "", districtId: "", psId: "", caseTypeId: "", petitionName: "", hearingDate: "", CourtCaseDescription: "" }));
  }, [encryptedUser]);

  useEffect(() => {
    if (user) {
      const fetchInitialData = async () => {
        try {
          const [caseTypes, references, districts, ipcSections, bnsSections] = await Promise.all([
            getcasetype(),
            showRefferenceDetails(),
            alldistrict(),
            showIpcSection(),
            showBnsSection(),
          ])

          setCaseTypeList(caseTypes)
          setReferenceList(references)
          setAllDistrictList(districts)
          setIpcActList(ipcSections)
          setBnsSectionList(bnsSections)
        } catch (err) {
          openAlert("error", err?.message || "Failed to load initial data")
        }
      }

      fetchInitialData()
      fetchCases()
    }
  }, [user])

  // Fetch PS list when district changes (for Add tab)
  useEffect(() => {
    if (activeTab === 'add' && addFormData.districtId) {
      showpoliceBydistrict(addFormData.districtId)
        .then(setAllPSList)
        .catch(err => openAlert("error", "Failed to load police stations"));
    }
  }, [addFormData.districtId, activeTab]);

  // Fetch PS list when district changes (for Update tab)
  useEffect(() => {
    if (activeTab === 'update' && updateFormData.districtId) {
      showpoliceBydistrict(updateFormData.districtId)
        .then(setAllPSList)
        .catch(err => openAlert("error", "Failed to load police stations"));
    }
  }, [updateFormData.districtId, activeTab]);

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

  // useEffect(() => {
  //   if (addFormData.districtId) {
  //     showpoliceBydistrict(addFormData.districtId)
  //       .then((result) => {
  //         setAllPSList(result)
  //       })
  //       .catch((err) => {
  //         openAlert("error", err?.message || "Failed to load police stations")
  //       })
  //   }
  // }, [addFormData.districtId])

  const handleAddChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value })
  }

  const handleUpdateChange = (e) => {
    setUpdateFormData({ ...updateFormData, [e.target.name]: e.target.value })
  }

  const handleAddSelectChange = (name, value) => {
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleReferenceChange = (field, value) => {
    setCurrentReference((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // --- Update Tab: Populate form when case is selected ---
  const handleUpdateSelectChange = async (name, value) => {
    if (name === "CaseNumber") {
      const selectedCase = allCases.find((c) => c.CaseNumber === value)
      if (!selectedCase) return;

      setIsLoading(true); // Show loading indicator for details fetch
      setIsFetchingDetails(true);
      // Clear previous selections first
      setSelectedIpcSections([]);
      setOtherSectionsList([]);
      setSelectedReferences([]);
      setIpcToBnsMap({});
      setExistingDocuments([]); // Clear existing docs

      try {
        const districtId = selectedCase.SpId ? selectedCase.SpId.toString() : "";
        // Fetch PS list for the selected district
        if (districtId) {
          const psResult = await showpoliceBydistrict(districtId);
          setAllPSList(psResult);
        } else {
          setAllPSList([]);
        }

        // Format dates
        const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split("T")[0] : "";
        const formatHearingDate = (dateString) => dateString ? dateString.split(" ")[0] : ""; // Assuming "YYYY-MM-DD HH:MM:SS"

        // Populate main form data
        setUpdateFormData({
          CaseId: selectedCase.CaseId.toString(), // IMPORTANT: Set CaseId for update
          CaseNumber: selectedCase.CaseNumber,
          EntryUserID: user.AuthorityUserID,
          CaseDate: formatDate(selectedCase.CaseDate),
          districtId: districtId,
          psId: selectedCase.PsId ? selectedCase.PsId.toString() : "",
          caseTypeId: selectedCase.caseTypeID ? selectedCase.caseTypeID.toString() : "",
          filingDate: formatDate(selectedCase.CaseDate), // Or maybe FilingDate if available? Check response
          petitionName: selectedCase.petitionName || selectedCase.CaseNumber, // Use petitionName if available
          hearingDate: formatHearingDate(selectedCase.CaseHearingDate),
          CourtCaseDescription: selectedCase.CourtCaseDescription || "", // Populate description
        });

        // --- Fetch and Populate Sections ---
        const sectionsResponse = await showJustSectionByCase(selectedCase.CaseId,user.AuthorityUserID);
        if (sectionsResponse && sectionsResponse.status === 0 && Array.isArray(sectionsResponse.data)) {
          const fetchedSections = sectionsResponse.data;
          const standard = [];
          const others = [];
          const newIpcMap = {};

          // Pre-fetch all mappings for standard sections to avoid multiple calls in loop
          const bnsIdsToMap = fetchedSections
            .filter(sec => sec.ibsId !== null && sec.ibsId !== OTHER_SECTION_BNS_ID) // Assuming standard have non-null/non-other ibsId
            .map(sec => sec.ibsId?.toString()); // Use ibsId as the identifier for standard

          if (bnsIdsToMap.length > 0) {
            // This part might need adjustment based on how `showIbsByBnsId` works with multiple IDs
            // If it only takes one ID, you might need to loop or adjust the API
            // For now, assuming it fetches necessary info - simplified example:
            for (const bnsId of [...new Set(bnsIdsToMap)]) { // Use Set to avoid duplicates
              try {
                const mapResult = await showIbsByBnsId(bnsId);
                if (mapResult && mapResult.length > 0) {
                  newIpcMap[bnsId] = useIpcDisplay ? mapResult[0].BnsSection : mapResult[0].IpcSection;
                }
              } catch (mapErr) { console.error(`Mapping failed for ${bnsId}`, mapErr); }
            }
            setIpcToBnsMap(newIpcMap);
          }


          fetchedSections.forEach(sec => {
            // Logic to differentiate standard vs other might need refinement based on actual data/SPs
            // Assumption: Standard sections have a valid ibsId that's not the OTHER_SECTION_BNS_ID
            // Assumption: Other sections have ibsId = OTHER_SECTION_BNS_ID or null/undefined
            const isStandard = sec.ibsId && sec.ibsId !== OTHER_SECTION_BNS_ID; // Adjust this condition if needed

            if (isStandard) {
              // Find matching entry in full lists to get the display label (IpcSection)
              const masterSection = ipcActList.find(item => item.bnsId === sec.ibsId);
              standard.push({
                InIpcID: sec.caseIpcBnsId, // Store the primary key
                bnsId: sec.ibsId,          // Store the reference ID (foreign key)
                ipcSection: masterSection?.ipcSection || sec.IpcSection || `Section ID ${sec.ibsId}` // Display label
              });
            } else {
              // This is an 'other' section row
              others.push({
                id: sec.caseIpcBnsId, // Use caseIpcBnsId as unique ID for the row
                InIpcID: sec.caseIpcBnsId, // Store the primary key
                // Assuming showJustSectionByCase returns OtherIpcAct and OtherBnsAct based on new SPs
                // If not, API needs adjustment. Using IpcSection/BnsSection as fallback for now.
                ipcValue: sec.OtherIpcAct || sec.IpcSection || "",
                bnsValue: sec.OtherBnsAct || sec.BnsSection || ""
              });
            }
          });
          setSelectedIpcSections(standard);
          setOtherSectionsList(others);
        } else {
          console.warn("No sections found or error fetching sections:", sectionsResponse?.message);
        }

        // --- Fetch and Populate References ---
        const refsResponse = await showJustReferenceByCase(selectedCase.CaseId,user.AuthorityUserID);
        if (refsResponse && refsResponse.status === 0 && Array.isArray(refsResponse.data)) {
          const fetchedRefs = refsResponse.data.map(ref => ({
            InreffeeenceID: ref.ccnId, // Store the primary key
            crmID: ref.RefferenceId?.toString(), // Ensure string if needed by dropdown
            refferenceNumber: ref.RefferenceNumber || "",
            refferenceyear: ref.RefferenceYear?.toString() || "",
            // Store label for display if needed, fetched from referenceList
            // crmName: referenceList.find(rl => rl.refferenceId === ref.RefferenceId)?.refferenceName || ref.CrmName || ""
          }));
          setSelectedReferences(fetchedRefs);
        } else {
          console.warn("No references found or error fetching references:", refsResponse?.message);
        }

        // --- Fetch and Populate Existing Documents (Requires a new API endpoint) ---
        // Example: const docsResponse = await getCaseDocuments(selectedCase.CaseId);
        // if (docsResponse && docsResponse.status === 0) { setExistingDocuments(docsResponse.data); }
        console.warn("Fetching existing documents is not implemented.");


      } catch (error) {
        console.error("Error fetching case details:", error);
        openAlert("error", `Failed to load details for case ${value}: ${error.message}`);
        // Reset form partially on error?
        setUpdateFormData(prev => ({ ...prev, CaseId: "", CaseNumber: "" })); // Clear selected case
      } finally {
        setIsLoading(false);
        setIsFetchingDetails(false);
      }
    } else {
      // Handle changes to other fields in update form if necessary
      setUpdateFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addIpcSection = async (bnsId) => {
    // Check limits based on the current active tab
    const currentSelected = activeTab === 'add' ? selectedIpcSections : selectedIpcSections; // Assuming same state for both tabs
    const currentOther = activeTab === 'add' ? otherSectionsList : otherSectionsList;
    const currentTotal = currentSelected.length + currentOther.length;

    if (currentTotal >= MAX_TOTAL_ENTRIES) { /* ... alert ... */ return; }
    if (currentSelected.length >= MAX_STANDARD_SECTIONS) { /* ... alert ... */ return; }
    if (currentSelected.some(item => item.bnsId?.toString() === bnsId)) { /* ... alert ... */ return; }

    // Find section details from master lists
    const ipcItem = ipcActList.find(ipc => ipc.bnsId.toString() === bnsId);
    const bnsItem = bnsSectionList.find(bns => bns.bnsId.toString() === bnsId);
    const sectionData = ipcItem || { bnsId: bnsItem?.bnsId, ipcSection: bnsItem?.bnsSection }; // Get data for label

    if (!sectionData?.bnsId) { /* ... alert invalid ... */ return; }

    // Add section with InIpcID: null (or 0) for new sections in both add/update modes
    const newSection = {
      InIpcID: null, // Mark as new/unsaved
      bnsId: sectionData.bnsId,
      ipcSection: sectionData.ipcSection || `Section ID ${sectionData.bnsId}`
    };
    setSelectedIpcSections(prev => [...prev, newSection]);

    // Fetch mapping if needed (no change here)
    try { /* ... fetch mapping ... */ } catch (err) { /* ... handle mapping error ... */ }
  };

  const removeIpcSection = (bnsId, inIpcID) => { // Pass InIpcID if available
    // If inIpcID exists, we might need to mark it for deletion on the backend later
    // For now, just remove from the UI state
    console.log(`Removing standard section: bnsId=${bnsId}, InIpcID=${inIpcID}`); // Log for debugging
    setSelectedIpcSections((prev) => prev.filter((item) => {
      // Remove based on bnsId if InIpcID is null (newly added), otherwise use InIpcID if available
      return inIpcID ? item.InIpcID !== inIpcID : item.bnsId?.toString() !== bnsId?.toString();
    }));
    // Remove mapping if needed
    if (bnsId && ipcToBnsMap[bnsId]) {
      setIpcToBnsMap(prev => {
        const newMap = { ...prev };
        delete newMap[bnsId];
        return newMap;
      });
    }
    // TODO: Add logic here or in handleUpdateCase to track deleted InIpcIDs for backend processing.
  };

  const addOtherSectionRow = () => {
    // Check limits based on active tab state
    const currentSelected = activeTab === 'add' ? selectedIpcSections : selectedIpcSections;
    const currentOther = activeTab === 'add' ? otherSectionsList : otherSectionsList;
    const currentTotal = currentSelected.length + currentOther.length;

    if (currentTotal >= MAX_TOTAL_ENTRIES) { /* ... alert ... */ return; }
    if (currentOther.length >= MAX_OTHER_ROWS) { /* ... alert ... */ return; }

    const ipcInput = currentOtherIpc.trim();
    const bnsInput = currentOtherBns.trim();
    if (!ipcInput && !bnsInput) { /* ... alert ... */ return; }

    // Add row with InIpcID: null (mark as new)
    setOtherSectionsList(prev => [
      ...prev,
      {
        id: `new_${Date.now()}`, // Temporary ID for React key, use 'new_' prefix
        InIpcID: null, // Mark as new/unsaved
        ipcValue: ipcInput,
        bnsValue: bnsInput
      }
    ]);
    setCurrentOtherIpc("");
    setCurrentOtherBns("");
  };

  const removeOtherSectionRow = (idToRemove, inIpcID) => { // Pass InIpcID if available
    // If inIpcID exists, mark for deletion on backend
    console.log(`Removing other section row: id=${idToRemove}, InIpcID=${inIpcID}`); // Log
    setOtherSectionsList(prev => prev.filter(section => section.id !== idToRemove));
    // TODO: Add logic here or in handleUpdateCase to track deleted InIpcIDs for backend processing.
  };

  const addReference = () => {
    // Check limit
    if (selectedReferences.length >= MAX_REFERENCES) { /* ... alert ... */ return; }
    if (!currentReference.crmID || !currentReference.refferenceNumber || !currentReference.refferenceyear) { /* ... alert ... */ return; }

    // Check for duplicates (consider InreffeeenceID potentially being null for new ones)
    // if (selectedReferences.some(ref => ref.crmID === currentReference.crmID && ...)) { /* ... alert ... */ return; }

    // Add reference with InreffeeenceID: null (mark as new)
    setSelectedReferences((prev) => [...prev, {
      InreffeeenceID: null, // Mark as new/unsaved
      id: `new_${Date.now()}`, // Temporary ID for React key
      ...currentReference
    }]);
    setCurrentReference({ crmID: "", refferenceNumber: "", refferenceyear: new Date().getFullYear().toString() });
  };

  const removeReference = (idToRemove, inRefID) => { // Pass InreffeeenceID if available
    console.log(`Removing reference: id=${idToRemove}, InreffeeenceID=${inRefID}`); // Log
    setSelectedReferences((prev) => prev.filter(ref => ref.id !== idToRemove));
    // TODO: Add logic here or in handleUpdateCase to track deleted InreffeeenceIDs for backend processing.
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

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingDocument = async (docIdToRemove) => {
    console.log("Attempting to remove existing document:", docIdToRemove);
    // Example: await deleteCaseDocument(updateFormData.CaseId, docIdToRemove);
    // setExistingDocuments(prev => prev.filter(doc => doc.id !== docIdToRemove));
    openAlert("info", "Removing existing documents needs backend implementation.");
  };

  const openSectionEditModal = (sectionData, type) => {
    console.log("Editing section:", type, sectionData);
    setEditingSection({ type, data: sectionData });
    setIsSectionModalOpen(true);
  };

  const handleSaveSectionChanges = (updatedData) => {
    console.log("Saving section changes:", updatedData);
    const { type, data } = editingSection;
    const idToUpdate = type === 'standard' ? data.InIpcID : data.id; // Use InIpcID or temp id

    if (type === 'standard') {
      setSelectedIpcSections(prev => prev.map(sec =>
        sec.InIpcID === idToUpdate || sec.bnsId === data.bnsId // Match existing or newly added standard
          ? { ...sec, ...updatedData, InIpcID: sec.InIpcID } // Ensure InIpcID is preserved
          : sec
      ));
    } else { // type === 'other'
      setOtherSectionsList(prev => prev.map(sec =>
        sec.id === idToUpdate
          ? { ...sec, ...updatedData, InIpcID: sec.InIpcID } // Ensure InIpcID is preserved
          : sec
      ));
    }
    setIsSectionModalOpen(false);
    setEditingSection(null);
  };

  const openReferenceEditModal = (refData) => {
    console.log("Editing reference:", refData);
    setEditingReference(refData);
    setIsRefModalOpen(true);
  };

  const handleSaveReferenceChanges = (updatedData) => {
    console.log("Saving reference changes:", updatedData);
    const idToUpdate = editingReference.id; // Use temp id or InreffeeenceID
    setSelectedReferences(prev => prev.map(ref =>
      ref.id === idToUpdate
        ? { ...ref, ...updatedData, InreffeeenceID: ref.InreffeeenceID } // Ensure InreffeeenceID is preserved
        : ref
    ));
    setIsRefModalOpen(false);
    setEditingReference(null);
  };

  const handleAddCase = async () => {
    setIsLoading(true)

    try {
      // ... existing validations for main form fields ...
      const requiredFields = [
        { field: "CaseNumber", label: "Case Number" },
        { field: "CaseDate", label: "Case Date" },
        { field: "districtId", label: "District" },
        { field: "psId", label: "Police Station" },
        { field: "caseTypeId", label: "Case Type" },
        { field: "hearingDate", label: "Hearing Date" },
        { field: "filingDate", label: "Filing Date" },
        { field: "petitionName", label: "Petitioner Name" },
        { field: "CourtCaseDescription", label: "Court Case Description" },
      ]
      const missingFields = requiredFields.filter(({ field }) => !addFormData[field])
      if (missingFields.length > 0) {
        throw `Please fill in the following required fields: ${missingFields.map((f) => f.label).join(", ")}`
      }
      // --- End of main field validations ---

      if (selectedIpcSections.length === 0 && otherSectionsList.length === 0) {
        throw "Please add at least one Standard or Other section.";
      }

      const finalStandardSections = selectedIpcSections.map(section => ({
        InIpcID: 0, // Always 0 for new case sections
        bnsId: section.bnsId.toString(),
        otherIpcAct: "",
        otherBnsAct: ""
      }));

      const finalOtherSections = otherSectionsList.map(row => ({
        InIpcID: 0, // Always 0 for new case sections
        bnsId: OTHER_SECTION_BNS_ID.toString(),
        otherIpcAct: row.ipcValue,
        otherBnsAct: row.bnsValue
      }));

      const combinedIpcSections = [...finalStandardSections, ...finalOtherSections];

      const finalReferences = selectedReferences.map(ref => ({
        InreffeeenceID: 0, // Always 0 for new case references
        crmID: ref.crmID,
        refferenceNumber: ref.refferenceNumber,
        refferenceyear: ref.refferenceyear
      }));

      // // Validating total number of sections/rows
      // if (combinedIpcSections.length === 0) {
      //   throw "Please add at least one Standard IPC/BNS Section or one Other Section row."
      // }
      // if (combinedIpcSections.length > MAX_TOTAL_ENTRIES) { // Just a double-check
      //   throw `Maximum ${MAX_TOTAL_ENTRIES} total entries (Standard + Other Rows) allowed.`
      // }


      const apiData = {
        CaseId: 0, // Explicitly 0 for create operation via V2 endpoint
        ...addFormData,
        ipcSections: combinedIpcSections,
        refferences: finalReferences,
      };

      console.log("Submitting ADD Data (V2):", apiData);

      const caseResult = await createOrUpdateCaseV2(apiData); // Use the new API function
      const caseId = caseResult.data.CaseID;

      // Upload documents if any
      if (documents.length > 0) {
        await uploadCaseDocuments(caseId, documents, user.AuthorityUserID)
      }

      openAlert("success", "Case created successfully")

      // Reset form including the new other section states
      setAddFormData({
        CaseNumber: "", EntryUserID: user.AuthorityUserID, CaseDate: "",
        districtId: "", psId: "", caseTypeId: "",
        filingDate: new Date().toISOString().split("T")[0],
        petitionName: "", hearingDate: "", CourtCaseDescription: "",
      })
      setSelectedIpcSections([]);
      setOtherSectionsList([]);
      setCurrentOtherIpc("");
      setCurrentOtherBns("");
      setSelectedReferences([]);
      setDocuments([]);
      setIpcToBnsMap({});

      fetchCases(); // Refresh case list for update tab

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (typeof err === 'string' ? err : "An unknown error occurred");
      openAlert("error", errorMessage instanceof Array ? errorMessage.join(", ") : errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateCase = async () => {
    setIsLoading(true);
    try {
      // --- Basic Validations ---
      if (!updateFormData.CaseId) throw "Please select a case to update.";
      if (!updateFormData.hearingDate) throw "Please provide a hearing date.";
      if (selectedIpcSections.length === 0 && otherSectionsList.length === 0) {
        throw "Please ensure at least one Standard or Other section exists.";
      }

      const finalStandardSections = selectedIpcSections.map(section => ({
        InIpcID: section.InIpcID || 0, // Use existing ID or 0 if newly added during edit
        bnsId: section.bnsId.toString(),
        otherIpcAct: "",
        otherBnsAct: ""
      }));

      const finalOtherSections = otherSectionsList.map(row => ({
        InIpcID: row.InIpcID || 0, // Use existing ID or 0 if newly added during edit
        bnsId: OTHER_SECTION_BNS_ID.toString(),
        otherIpcAct: row.ipcValue,
        otherBnsAct: row.bnsValue
      }));

      const combinedIpcSections = [...finalStandardSections, ...finalOtherSections];

      // // Validate total number of sections/rows
      // if (combinedIpcSections.length === 0) {
      //   throw "Please add at least one Standard IPC/BNS Section or one Other Section row.";
      // }
      // if (combinedIpcSections.length > MAX_TOTAL_ENTRIES) {
      //   throw `Maximum ${MAX_TOTAL_ENTRIES} total entries (Standard + Other Rows) allowed.`
      // }

      const finalReferences = selectedReferences.map(ref => ({
        InreffeeenceID: ref.InreffeeenceID || 0, // Use existing ID or 0 if newly added
        crmID: ref.crmID,
        refferenceNumber: ref.refferenceNumber,
        refferenceyear: ref.refferenceyear
      }));

      const apiData = {
        ...updateFormData, // Includes the CaseId for update
        ipcSections: combinedIpcSections,
        refferences: finalReferences,
      };

      console.log("Submitting UPDATE Data (V2):", apiData);

      // Call update API
      const caseResult = await createOrUpdateCaseV2(apiData);

      // Upload *newly added* documents
      if (documents.length > 0) {
        await uploadCaseDocuments(updateFormData.CaseId, documents, user.AuthorityUserID);
      }

      openAlert("success", "Case updated successfully");

      // Reset form
      setUpdateFormData({
        CaseId: "", CaseNumber: "", EntryUserID: user.AuthorityUserID, CaseDate: "",
        districtId: "", psId: "", caseTypeId: "", filingDate: "",
        petitionName: "", hearingDate: "",
      });
      setSelectedIpcSections([]);
      setOtherSectionsList([]);
      setCurrentOtherIpc("");
      setCurrentOtherBns("");
      setSelectedReferences([]);
      setDocuments([]);
      setExistingDocuments([]);
      setIpcToBnsMap({});
      setActiveTab("add"); // Switch back to add tab? Or stay?
      fetchCases(); // Refresh case list

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (typeof err === 'string' ? err : "An unknown error occurred");
      openAlert("error", errorMessage instanceof Array ? errorMessage.join(", ") : errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    closeAlert()
  }

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
              <TabsTrigger value="update">Update Existing Case</TabsTrigger>
            </TabsList>

            {/* Add New Case Tab */}
            <TabsContent value="add">
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="CaseNumber">
                        PS Case Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        icon={Hash}
                        id="CaseNumber"
                        name="CaseNumber"
                        placeholder="Enter case number"
                        value={addFormData.CaseNumber}
                        onChange={handleAddChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="CaseDate">
                        PS Case Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        icon={Calendar}
                        id="CaseDate"
                        name="CaseDate"
                        type="date"
                        value={addFormData.CaseDate}
                        onChange={handleAddChange}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="petitionName">
                        Petitioner Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="petitionName"
                        name="petitionName"
                        placeholder="Enter petitioner name"
                        value={addFormData.petitionName}
                        onChange={handleAddChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="filingDate">
                        Filing Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        icon={Calendar}
                        id="filingDate"
                        name="filingDate"
                        type="date"
                        value={addFormData.filingDate}
                        onChange={handleAddChange}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="districtId">
                        District <span className="text-red-500">*</span>
                      </Label>
                      <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openDistrict}
                            className="w-full justify-between"
                          >
                            {addFormData.districtId
                              ? allDistrictList.find(
                                (district) => district.districtId.toString() === addFormData.districtId,
                              )?.districtName
                              : "Select District"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search district..." />
                            <CommandList>
                              <CommandEmpty>No district found.</CommandEmpty>
                              <CommandGroup>
                                {allDistrictList.map((district) => (
                                  <CommandItem
                                    key={district.districtId}
                                    onSelect={() => {
                                      handleAddSelectChange("districtId", district.districtId.toString())
                                      setOpenDistrict(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        addFormData.districtId === district.districtId.toString()
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {district.districtName}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="psId">
                        Police Station <span className="text-red-500">*</span>
                      </Label>
                      <Popover open={openPS} onOpenChange={setOpenPS}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPS}
                            className="w-full justify-between"
                            disabled={!addFormData.districtId}
                          >
                            {addFormData.psId
                              ? allPSList.find((ps) => ps.id.toString() === addFormData.psId)?.ps_name
                              : "Select Police Station"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search police station..." />
                            <CommandList>
                              <CommandEmpty>No police station found.</CommandEmpty>
                              <CommandGroup>
                                {allPSList.map((ps) => (
                                  <CommandItem
                                    key={ps.id}
                                    onSelect={() => {
                                      handleAddSelectChange("psId", ps.id.toString())
                                      setOpenPS(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        addFormData.psId === ps.id.toString() ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {ps.ps_name}
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
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="caseTypeId">
                        Case Type <span className="text-red-500">*</span>
                      </Label>
                      <Popover open={openCaseType} onOpenChange={setOpenCaseType}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCaseType}
                            className="w-full justify-between"
                          >
                            {addFormData.caseTypeId
                              ? caseTypeList.find(
                                (caseType) => caseType.CasetypeId.toString() === addFormData.caseTypeId,
                              )?.CasetypeName
                              : "Select Case Type"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search case type..." />
                            <CommandList>
                              <CommandEmpty>No case type found.</CommandEmpty>
                              <CommandGroup>
                                {caseTypeList.map((caseType) => (
                                  <CommandItem
                                    key={caseType.CasetypeId}
                                    onSelect={() => {
                                      handleAddSelectChange("caseTypeId", caseType.CasetypeId.toString())
                                      setOpenCaseType(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        addFormData.caseTypeId === caseType.CasetypeId.toString()
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
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="hearingDate">
                        Hearing Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        icon={Clock}
                        id="hearingDate"
                        name="hearingDate"
                        type="date"
                        value={addFormData.hearingDate}
                        onChange={handleAddChange}
                        min={addFormData.CaseDate || undefined}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold" htmlFor="CourtCaseDescription">
                      Court Case Description <span className="text-red-500">*</span> (Max 100 words)
                    </Label>
                    <textarea
                      id="CourtCaseDescription"
                      name="CourtCaseDescription"
                      rows={4}
                      value={addFormData.CourtCaseDescription}
                      onChange={(e) => {
                        const wordCount = e.target.value.trim().split(/\s+/).length
                        if (wordCount <= 100) {
                          setAddFormData({ ...addFormData, CourtCaseDescription: e.target.value })
                        }
                      }}
                      placeholder="Enter a brief summary of the case (max 100 words)"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      {addFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length} / 100 words
                    </p>
                  </div>

                  {/* IPC/BNS Sections */}
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

                  {/* References */}
                  <div className="space-y-2 mt-2">
                    <Label className="font-bold">References
                      {/* (Max {MAX_STANDARD_SECTIONS}) */}
                    </Label>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedReferences.map((ref, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 py-2">
                          {referenceList.find((r) => r.refferenceId.toString() === ref.crmID)?.refferenceName} -
                          {ref.refferenceNumber} ({ref.refferenceyear})
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => removeReference(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>

                    {/* ✅ Separate line for Reference Type */}
                    <div className="w-full">
                      <Popover open={openReference} onOpenChange={setOpenReference}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openReference}
                            className="w-full justify-between"
                          >
                            {currentReference.crmID
                              ? referenceList.find((ref) => ref.refferenceId.toString() === currentReference.crmID)
                                ?.refferenceName
                              : "Select Reference Type"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] z-50" side="bottom" align="start">
                          <Command>
                            <CommandInput placeholder="Search reference..." />
                            <CommandList>
                              <CommandEmpty>No reference found.</CommandEmpty>
                              <CommandGroup>
                                {referenceList.map((ref) => (
                                  <CommandItem
                                    key={ref.refferenceId}
                                    onSelect={() => {
                                      handleReferenceChange("crmID", ref.refferenceId.toString());
                                      setOpenReference(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        currentReference.crmID === ref.refferenceId.toString()
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {ref.refferenceName}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* ✅ The remaining two inputs side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        placeholder="Reference Number"
                        value={currentReference.refferenceNumber}
                        onChange={(e) => handleReferenceChange("refferenceNumber", e.target.value)}
                      />
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

                    <div className="flex justify-end">
                      <Button type="button" size="sm" onClick={addReference} className="mt-2">
                        <Plus className="h-4 w-4 mr-1" /> Add Reference
                      </Button>
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
              </CardContent>
            </TabsContent>

            {/* Update Existing Case Tab */}
            <TabsContent value="update">
              <CardContent>
                <div className="flex flex-col gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="updateCaseDate">
                        Case Date
                      </Label>
                      <Input
                        icon={Calendar}
                        id="updateCaseDate"
                        name="CaseDate"
                        type="date"
                        value={updateFormData.CaseDate}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="updateHearingDate">
                        Hearing Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        icon={Clock}
                        id="updateHearingDate"
                        name="hearingDate"
                        type="date"
                        value={updateFormData.hearingDate}
                        onChange={handleUpdateChange}
                        min={updateFormData.CaseDate || undefined}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="updatePetitionName">
                        Petitioner Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="updatePetitionName"
                        name="petitionName"
                        value={updateFormData.petitionName}
                        onChange={handleUpdateChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="updateFilingDate">
                        Filing Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        icon={Calendar}
                        id="updateFilingDate"
                        name="filingDate"
                        type="date"
                        value={updateFormData.filingDate}
                        onChange={handleUpdateChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="updateDistrictId">
                        District
                      </Label>
                      <Input
                        id="updateDistrictId"
                        value={
                          allDistrictList.find((d) => d.districtId.toString() === updateFormData.districtId)
                            ?.districtName || ""
                        }
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="updatePsId">
                        Police Station
                      </Label>
                      <Input
                        id="updatePsId"
                        value={allPSList.find((ps) => ps.id.toString() === updateFormData.psId)?.ps_name || ""}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold" htmlFor="updateCaseTypeId">
                      Case Type
                    </Label>
                    <Input
                      id="updateCaseTypeId"
                      value={
                        caseTypeList.find((ct) => ct.CasetypeId.toString() === updateFormData.caseTypeId)
                          ?.CasetypeName || ""
                      }
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold" htmlFor="updateCourtCaseDescription">Court Case Description* (Max 100 words)</Label>
                    <textarea id="updateCourtCaseDescription" name="CourtCaseDescription" rows={4} value={updateFormData.CourtCaseDescription} onChange={handleUpdateChange} /* ... word count logic ... */ />
                  </div>

                  {/* IPC Sections */}
                  <div className="space-y-2 mt-2">
                    <Label className="font-bold">
                      Standard IPC / BNS Sections <span className="text-red-500">*</span> {/* (Max {MAX_STANDARD_SECTIONS}) */}
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedIpcSections.map((section) => (
                        <Badge key={section.bnsId} variant="secondary" className="flex items-center gap-1 py-2">
                          {section.ipcSection}
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
                    <Table>
                      <TableHeader>...</TableHeader>
                      <TableBody>
                        {selectedIpcSections.map((section) => (
                          <TableRow key={section.InIpcID || section.bnsId}>
                            <TableCell>{/* Display section label */}</TableCell>
                            <TableCell className="text-right space-x-1">
                            <Button
  variant="ghost"
  size="icon"
  onClick={() => openSectionEditModal(section, 'standard')} // or 'other'
>
  <Pencil className="h-3 w-3" />
</Button>
                              {/* <Button variant="destructive" size="sm" onClick={() => removeIpcSection(section.bnsId, section.InIpcID)}><Trash className="h-3 w-3" /> Delete</Button> */}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex gap-2">
                      <Popover open={openIpcAct} onOpenChange={setOpenIpcAct}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openIpcAct}
                            className="w-full justify-between"
                          >
                            Select IPC Section
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search IPC section..." />
                            <CommandList>
                              <CommandEmpty>No IPC section found.</CommandEmpty>
                              <CommandGroup>
                                {ipcActList
                                  .filter(
                                    (ipc) => !selectedIpcSections.some((selected) => selected.bnsId === ipc.bnsId),
                                  )
                                  .map((ipc) => (
                                    <CommandItem
                                      key={ipc.bnsId}
                                      onSelect={() => {
                                        addIpcSection(ipc.bnsId.toString())
                                        setOpenIpcAct(false)
                                      }}
                                    >
                                      {ipc.ipcSection}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* --- Other IPC/BNS Sections (Update Tab) --- */}
                  <div className="space-y-2 mt-4 border-t pt-4">
                    <Label className="font-bold">Other Sections</Label>
                    {/* Display Table (otherSectionsList) with EDIT and DELETE buttons */}
                    <Table>
                      <TableHeader>...</TableHeader>
                      <TableBody>
                        {otherSectionsList.map((section) => (
                          <TableRow key={section.id || section.InIpcID}>
                            <TableCell>{section.ipcValue || "-"}</TableCell>
                            <TableCell>{section.bnsValue || "-"}</TableCell>
                            <TableCell className="text-right space-x-1">
                              {/* <Button variant="outline" size="sm" onClick={() => openSectionEditModal(section, 'other')}><Pencil className="h-3 w-3" /> Edit</Button> */}
                              {/* <Button variant="destructive" size="sm" onClick={() => removeOtherSectionRow(section.id, section.InIpcID)}><Trash className="h-3 w-3" /> Delete</Button> */}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {/* Input Row to ADD NEW other sections (currentOtherIpc, currentOtherBns, addOtherSectionRow) */}
                    <div className="flex items-end gap-2 mb-2 mt-4">... Inputs and Add Button ...</div>
                  </div>

                  {/* References */}
                  <div className="space-y-2 mt-2">
                    <Label className="font-bold">References {/* (Max {MAX_STANDARD_SECTIONS}) */}</Label>
                    <Table>
                      <TableHeader>...</TableHeader>
                      <TableBody>
                        {selectedReferences.map((ref) => (
                          <TableRow key={ref.id || ref.InreffeeenceID}>
                            <TableCell>{/* Ref Type */}</TableCell>
                            <TableCell>{ref.refferenceNumber}</TableCell>
                            <TableCell>{ref.refferenceyear}</TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button variant="outline" size="sm" onClick={() => openReferenceEditModal(ref)}><Pencil className="h-3 w-3" /> Edit</Button>
                              <Button variant="destructive" size="sm" onClick={() => removeReference(ref.id, ref.InreffeeenceID)}><Trash className="h-3 w-3" /> Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedReferences.map((ref, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 py-2">
                          {referenceList.find((r) => r.refferenceId.toString() === ref.crmID)?.refferenceName} -
                          {ref.refferenceNumber} ({ref.refferenceyear})
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => removeReference(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="w-full">
                      <Popover open={openReference} onOpenChange={setOpenReference}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openReference}
                            className="w-full justify-between"
                          >
                            {currentReference.crmID
                              ? referenceList.find((ref) => ref.refferenceId.toString() === currentReference.crmID)
                                ?.refferenceName
                              : "Select Reference Type"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 z-50" style={{ width: "300px" }}>
                          <Command>
                            <CommandInput placeholder="Search reference..." />
                            <CommandList>
                              <CommandEmpty>No reference found.</CommandEmpty>
                              <CommandGroup>
                                {referenceList.map((ref) => (
                                  <CommandItem
                                    key={ref.refferenceId}
                                    onSelect={() => {
                                      handleReferenceChange("crmID", ref.refferenceId.toString())
                                      setOpenReference(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        currentReference.crmID === ref.refferenceId.toString()
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {ref.refferenceName}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input
                        placeholder="Reference Number"
                        value={currentReference.refferenceNumber}
                        onChange={(e) => handleReferenceChange("refferenceNumber", e.target.value)}
                      />
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
                                      handleReferenceChange("refferenceyear", year)
                                      setOpenYear(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        currentReference.refferenceyear === year ? "opacity-100" : "opacity-0",
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
                    <div className="flex justify-end">
                      <Button type="button" size="sm" onClick={addReference} className="mt-2">
                        <Plus className="h-4 w-4 mr-1" /> Add Reference
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    <Label>Upload Additional Documents</Label>
                    <Input type="file" multiple onChange={handleFileChange} accept=".pdf" />

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
                      onClick={handleUpdateCase}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                      disabled={isLoading || !updateFormData.CaseId}
                    >
                      {isLoading ? "Processing..." : "Update Case"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* --- EDIT MODALS --- */}
        <EditSectionModal
            isOpen={isSectionModalOpen}
            onClose={() => setIsSectionModalOpen(false)}
            section={editingSection}
            onSaveChanges={handleSaveSectionChanges}
            ipcActList={ipcActList} // Pass lists needed for dropdowns
            bnsSectionList={bnsSectionList}
            useIpcDisplay={useIpcDisplay}
        />

        <EditReferenceModal
            isOpen={isRefModalOpen}
            onClose={() => setIsRefModalOpen(false)}
            reference={editingReference}
            onSaveChanges={handleSaveReferenceChanges}
            referenceList={referenceList} // Pass lists needed
            years={years}
        />

      </main>
    </div>
  )
}

export default AddCasePage