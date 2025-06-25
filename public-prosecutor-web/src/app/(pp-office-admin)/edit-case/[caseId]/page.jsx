"use client"

import { use, useState, useEffect, useCallback, useMemo } from "react"
import {
  uploadCaseDocuments,
  getcasetype,
  showRefferenceDetails,
  alldistrict,
  showpoliceBydistrict,
  showIpcSection,
  showBnsSection,
  showIbsByBnsId,
} from "@/app/api" // Changed back to @ alias

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CustomAlertDialog } from "@/components/custom-alert-dialog" // Changed back to @ alias
import { useAlertDialog } from "@/hooks/useAlertDialog" // Changed back to @ alias
import { useSelector } from "react-redux" // Mark as external if build fails: external: ['react-redux']
import { Calendar, FileText, Hash, Clock, Trash, Plus, X, Loader2, FileUp, Edit3 } from "lucide-react"
import { decrypt } from "@/utils/crypto" // Changed back to @ alias
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils" // Changed back to @ alias
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { postRequest } from "@/app/commonAPI" // Changed back to @ alias
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import moment from "moment-timezone"; // Mark as external if build fails: external: ['moment-timezone']

// Constants
const OTHER_SECTION_BNS_ID = 534; // This is the IPCBnsId for "Other" sections
const MAX_TOTAL_SECTION_ENTRIES = 20;
const MAX_OTHER_ROWS = 10;
const MAX_FILE_SIZE_MB = 50;

// Helper to extract file name from document path
const getFileName = (path) => {
  return path ? path.split("/").pop().replace(/^[0-9]+_/, "") : "Unknown";
};

const UpdateCasePage = ({ params }) => {
  const unwrappedParams = use(params);
  // Extracting caseId from params, decrypting it to case_id
  const { caseId } = unwrappedParams;
  const dec_caseId = decodeURIComponent(caseId);
  const case_id = atob(dec_caseId);

  // Alert dialog hook
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDocumentTable, setIsLoadingDocumentTable] = useState(false);

  // User state from Redux
  const [user, setUser] = useState(null)
  const encryptedUser = useSelector((state) => state.auth.user)

  // Dropdown Lists State
  const [referenceList, setReferenceList] = useState([])
  const [allDistrictList, setAllDistrictList] = useState([])
  const [allPSList, setAllPSList] = useState([])
  const [caseTypeList, setCaseTypeList] = useState([])
  const [bnsSectionList, setBnsSectionList] = useState([]) // Contains BNSName and IPCBnsId
  const [ipcActList, setIpcActList] = useState([]) // Contains IPCName and IPCBnsId

  // Main Case Documents (for newly added docs to be uploaded)
  const [mainCaseDocuments, setMainCaseDocuments] = useState([]);
  // Existing Case Documents (fetched from API, to be managed for deletion)
  const [existingCaseDocuments, setExistingCaseDocuments] = useState([]);
  // Document IDs to be deleted
  const [documentsToDelete, setDocumentsToDelete] = useState([]);

  // Form Data State for updating
  const [updateFormData, setUpdateFormData] = useState({
    CaseId: case_id, // Initialize with the case_id from params
    caseNumber: "",
    EntryUserID: "",
    CaseDate: "",
    districtId: "",
    psId: "",
    caseTypeId: "",
    filingDate: "",
    petitionName: "",
    hearingDate: "",
    CourtCaseDescription: "",
    crmID: "", // Reference Type ID (maps to RefferenceDropDownID)
    refferenceNumber: "",
    refferenceyear: "",
    refferenceId: "", // Actual RefferenceID for sp_Createcase_v5
  });

  // IPC/BNS Section State
  // Added a 'localId' for newly added sections for stable keys before CaseIPCBnsId is assigned
  const [selectedIpcSections, setSelectedIpcSections] = useState([]); // Array of { IPCBnsId, IPCName, BnsName, IPCBnsSubject, CaseIPCBnsId, localId }
  const [otherSectionsList, setOtherSectionsList] = useState([]); // Array of { id (localId), ipcValue (IPCName), bnsValue (IPCBnsSubject), CaseIPCBnsId}
  const [currentOtherIpc, setCurrentOtherIpc] = useState("");
  const [currentOtherBns, setCurrentOtherBns] = useState("");
  const [useIpcDisplay, setUseIpcDisplay] = useState(true);
  const [removedIpcSectionIds, setRemovedIpcSectionIds] = useState([]); // To track CaseIPCBnsId of sections removed by user

  // Dropdown open/close state
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openPS, setOpenPS] = useState(false);
  const [openCaseType, setOpenCaseType] = useState(false);
  const [openReference, setOpenReference] = useState(false); // For the single reference type
  const [openYear, setOpenYear] = useState(false); // For the single reference year
  const [openIpcAct, setOpenIpcAct] = useState(false);

  // Years for dropdowns
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  // Helper to format date strings for input type="date"
  const formatDateForInput = (dateString) => {
    return dateString
      ? moment.utc(dateString).tz("Asia/Kolkata").format("YYYY-MM-DD")
      : "";
  };

  // --- Initial Data and User Effect ---
  useEffect(() => {
    // Decrypt and set user
    const decoded_user = JSON.parse(decrypt(encryptedUser))
    setUser(decoded_user);

    // Set EntryUserID and filingDate/refferenceyear for update form
    setUpdateFormData((prevState) => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID,
      filingDate: new Date().toISOString().split("T")[0],
      refferenceyear: currentYear.toString(), // Default to current year if not loaded
    }));
  }, [encryptedUser]);

  // --- Fetch Initial Dropdown Data and Case Details ---
  useEffect(() => {
    if (user && case_id) {
      const fetchAllRequiredData = async () => {
        setIsLoading(true);
        try {
          const [caseTypes, references, districts, ipcSections, bnsSections] = await Promise.all([
            getcasetype(), showRefferenceDetails(), alldistrict(), showIpcSection(), showBnsSection(),
          ]);
          setCaseTypeList(caseTypes || []);
          setReferenceList(references || []);
          setAllDistrictList(districts || []);
          setIpcActList(ipcSections || []); // Now contains IPCBnsId, IPCName, IPCBnsSubject
          setBnsSectionList(bnsSections || []); // Now contains IPCBnsId, BnsName, IPCBnsSubject

          // Fetch specific case details using case_id
          setIsLoadingDocumentTable(true); // Separate loading for docs/history
          const caseDetailsResponse = await postRequest("caseDetailsById", { CaseID: case_id });
          console.log("Case Details by ID:", caseDetailsResponse);

          if (caseDetailsResponse && caseDetailsResponse.status === 0 && caseDetailsResponse.data) {
            const caseData = caseDetailsResponse.data;

            // Populate main form data
            setUpdateFormData(prev => ({
              ...prev,
              caseNumber: caseData.CaseNumber || "",
              CaseDate: formatDateForInput(caseData.CaseDate) || "",
              districtId: caseData.SpId ? caseData.SpId.toString() : "", // Assuming SpId maps to districtId
              psId: caseData.PsId ? caseData.PsId.toString() : "",
              caseTypeId: caseData.caseTypeID ? caseData.caseTypeID.toString() : "",
              filingDate: formatDateForInput(caseData.FilingDate) || "",
              petitionName: caseData.PetitionName || "",
              hearingDate: formatDateForInput(caseData.CaseHearingDate) || "",
              CourtCaseDescription: caseData.CourtCaseDescription || "",
              crmID: caseData.Reference?.RefferenceDropDownID ? caseData.Reference.RefferenceDropDownID.toString() : "", // Use RefferenceDropDownID for dropdown
              refferenceNumber: caseData.Reference?.RefferenceNumber || "",
              refferenceyear: caseData.Reference?.RefferenceYear ? caseData.Reference.RefferenceYear.toString() : "",
              refferenceId: caseData.Reference?.RefferenceID || "" // Store actual RefferenceID for update SP
            }));

            // Populate IPC Sections
            if (caseData.IPCSecs && Array.isArray(caseData.IPCSecs)) {
              const standardSections = [];
              caseData.IPCSecs.forEach(ipcSec => {
                standardSections.push({
                  IPCBnsId: ipcSec.IPCBnsId ? ipcSec.IPCBnsId.toString() : "",
                  CaseIPCBnsId: ipcSec.CaseIPCBnsId,
                  IPCName: ipcSec.IPCName || "",
                  BnsName: ipcSec.BnsName || "",
                  IPCBnsSubject: ipcSec.IPCBnsSubject || "",
                  localId: crypto.randomUUID() // Add a unique localId for existing items too
                });
              });
              setSelectedIpcSections(standardSections);
            }

            // Populate Other IPC Sections
            if (caseData.OtherIPCSecs && Array.isArray(caseData.OtherIPCSecs)) {
              const otherSections = [];
              caseData.OtherIPCSecs.forEach(otherSec => {
                otherSections.push({
                  id: crypto.randomUUID(), // Use a new local ID for existing other sections
                  ipcValue: otherSec.IPCName || "",
                  bnsValue: otherSec.IPCBnsSubject || "",
                  CaseIPCBnsId: otherSec.CaseIPCBnsId
                });
              });
              setOtherSectionsList(otherSections);
            }

            if (caseData.IPCSecs || caseData.OtherIPCSecs) {
              const allCaseIpcIds = [
                ...(caseData.IPCSecs || []).map(sec => sec.CaseIPCBnsId),
                ...(caseData.OtherIPCSecs || []).map(sec => sec.CaseIPCBnsId),
              ].filter(Boolean);

              setRemovedIpcSectionIds(allCaseIpcIds);
            }

          } else {
            openAlert("error", caseDetailsResponse?.message || "Failed to load case details.");
          }

          // Fetch documents using show-public-case-document
          const documentResponse = await postRequest("show-public-case-document", { caseId: case_id });
          if (documentResponse && documentResponse.status === 0 && documentResponse.data) {
            setExistingCaseDocuments(documentResponse.data.map(doc => ({
              ...doc, // Keep all original doc fields including documentId and caseDocument
            })));
          } else {
            console.warn("Failed to load existing documents:", documentResponse?.message);
            // openAlert("warning", documentResponse?.message || "Failed to load existing documents.");
          }

        } catch (err) {
          console.error("Error fetching initial data or case details:", err);
          openAlert("error", err?.message || "Failed to load initial data or case details.");
        } finally {
          setIsLoading(false);
          setIsLoadingDocumentTable(false);
        }
      };
      fetchAllRequiredData();
    }
  }, [user, case_id]); // Depend on user and case_id

  // --- Dynamic Police Station List based on District ---
  useEffect(() => {
    if (updateFormData.districtId) {
      showpoliceBydistrict(updateFormData.districtId)
        .then(setAllPSList)
        .catch((err) => { openAlert("error", err?.message || "Failed to load police stations"); setAllPSList([]); });
    } else {
      setAllPSList([]);
      setUpdateFormData(prev => ({ ...prev, psId: '' }));
    }
  }, [updateFormData.districtId]);

  const filteredIpcBnsList = useMemo(() => {
    const sourceList = useIpcDisplay ? ipcActList : bnsSectionList;
    return sourceList.filter(e =>
      !selectedIpcSections.some(s => s.IPCBnsId?.toString() === e.IPCBnsId?.toString() && s.CaseIPCBnsId !== null) &&
      !selectedIpcSections.some(s => s.IPCBnsId?.toString() === e.IPCBnsId?.toString() && s.CaseIPCBnsId === null)
    );
  }, [useIpcDisplay, ipcActList, bnsSectionList, selectedIpcSections]); // Dependencies for memoization

  // --- Form Field Change Handlers ---
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSelectChange = (name, value) => {
    setUpdateFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- IPC/BNS Section Management ---
  const addIpcSection = async (selectedIPCBnsId) => {
    const currentTotal = selectedIpcSections.length + otherSectionsList.length;
    if (currentTotal >= MAX_TOTAL_SECTION_ENTRIES) {
      openAlert("error", `Maximum ${MAX_TOTAL_SECTION_ENTRIES} sections allowed.`);
      return;
    }

    // Prevent duplicates (new or existing)
    if (selectedIpcSections.some(item => item.IPCBnsId?.toString() === selectedIPCBnsId)) {
      openAlert("error", "Section already added or already associated with the case.");
      return;
    }

    // ✅ FIX: lookup by `bnsId`
    const ipcItem = ipcActList.find(ipc => ipc.bnsId?.toString() === selectedIPCBnsId);
    const bnsItem = bnsSectionList.find(bns => bns.bnsId?.toString() === selectedIPCBnsId);

    let finalIpcName = ipcItem?.ipcSection;
    let finalBnsName = bnsItem?.bnsSection;
    let finalIpcBnsSubject = ""; // You can fetch this from another API or set a default

    if (!finalIpcName || !finalBnsName) {
      try {
        setIsLoading(true);
        const mappingResult = await showIbsByBnsId(selectedIPCBnsId);
        if (mappingResult && mappingResult.length > 0) {
          finalIpcName = finalIpcName || mappingResult[0].IpcSection;
          finalBnsName = finalBnsName || mappingResult[0].BnsSection;
          finalIpcBnsSubject = finalIpcBnsSubject || mappingResult[0].IpcBnsSubject || '';
        } else {
          console.warn(`Mapping not found for IPCBns ID: ${selectedIPCBnsId}`);
          finalIpcName = finalIpcName || `IPC for ${selectedIPCBnsId}`;
          finalBnsName = finalBnsName || `BNS for ${selectedIPCBnsId}`;
          finalIpcBnsSubject = finalIpcBnsSubject || '';
        }
      } catch (err) {
        console.error("Failed to fetch mapping:", err);
        openAlert("error", "Failed to fetch section mapping.");
        finalIpcName = finalIpcName || `IPC for ${selectedIPCBnsId}`;
        finalBnsName = finalBnsName || `BNS for ${selectedIPCBnsId}`;
        finalIpcBnsSubject = finalIpcBnsSubject || '';
      } finally {
        setIsLoading(false);
      }
    }

    setSelectedIpcSections(prev => [
      ...prev,
      {
        IPCBnsId: selectedIPCBnsId,
        IPCName: finalIpcName || 'N/A',
        BnsName: finalBnsName || 'N/A',
        IPCBnsSubject: finalIpcBnsSubject || 'N/A',
        CaseIPCBnsId: null,
        localId: crypto.randomUUID(),
      }
    ]);
  };

  const removeIpcSection = (sectionToRemove) => {
    // If the section has an existing CaseIPCBnsId, mark it for deletion in backend
    if (sectionToRemove.CaseIPCBnsId) {
      setRemovedIpcSectionIds(prev => [...prev, sectionToRemove.CaseIPCBnsId]);
    }
    // Remove from local state (UI) using localId for new items, or CaseIPCBnsId for existing
    setSelectedIpcSections(prev =>
      prev.filter(item => {
        // If it's an existing section, match by CaseIPCBnsId
        if (item.CaseIPCBnsId && sectionToRemove.CaseIPCBnsId) {
          return item.CaseIPCBnsId !== sectionToRemove.CaseIPCBnsId;
        }
        // If it's a newly added section (CaseIPCBnsId is null), match by localId
        return item.localId !== sectionToRemove.localId;
      })
    );
  };

  const addOtherSectionRow = () => {
    const currentTotal = selectedIpcSections.length + otherSectionsList.length;
    if (currentTotal >= MAX_TOTAL_SECTION_ENTRIES) { openAlert("error", `Maximum ${MAX_TOTAL_SECTION_ENTRIES} sections allowed.`); return; }
    if (otherSectionsList.length >= MAX_OTHER_ROWS) { openAlert("error", `Maximum ${MAX_OTHER_ROWS} 'Other' section rows allowed.`); return; }
    const ipcInput = currentOtherIpc.trim();
    const bnsInput = currentOtherBns.trim(); // This will be stored as IPCBnsSubject in DB
    if (!ipcInput && !bnsInput) { openAlert("error", "Please enter at least an IPC Act or BNS Section."); return; }

    setOtherSectionsList(prev => [...prev, {
      id: crypto.randomUUID(), // Generate a unique ID for stability
      ipcValue: ipcInput,
      bnsValue: bnsInput,
      CaseIPCBnsId: null // New other sections don't have a CaseIPCBnsId yet
    }]);
    setCurrentOtherIpc(""); setCurrentOtherBns("");
  };

  const removeOtherSectionRow = (sectionToRemove) => {
    // If the section has an existing CaseIPCBnsId, mark it for deletion in backend
    if (sectionToRemove.CaseIPCBnsId) {
      setRemovedIpcSectionIds(prev => [...prev, sectionToRemove.CaseIPCBnsId]);
    }
    // Remove from local state (UI) using the 'id' (which is localId or CaseIPCBnsId for existing)
    setOtherSectionsList(prev =>
      prev.filter(section => {
        if (section.CaseIPCBnsId && sectionToRemove.CaseIPCBnsId) {
          return section.CaseIPCBnsId !== sectionToRemove.CaseIPCBnsId;
        }
        return section.id !== sectionToRemove.id;
      })
    );
  };

  // --- Main Case Document Upload (for new documents) ---
  const handleMainCaseFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { openAlert("error", `${file.name} exceeds ${MAX_FILE_SIZE_MB} MB`); return false; }
      if (!["application/pdf"].includes(file.type)) { openAlert("error", `${file.name} is not a valid format (PDF only)`); return false; }
      return true;
    });
    // Filter out duplicates based on name and size before adding to new documents
    const newFiles = validFiles.filter(vf => !mainCaseDocuments.some(df => df.name === vf.name && df.size === vf.size));
    setMainCaseDocuments(prev => [...prev, ...newFiles]);
    e.target.value = null; // Clear input for next selection
  };

  const removeMainCaseDocument = (index) => {
    // This is for newly added documents before upload
    setMainCaseDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // --- Existing Case Document Management (for documents already on server) ---
  const removeExistingCaseDocument = (documentIdToRemove) => {
    // Add the document ID to the list of documents to be deleted
    setDocumentsToDelete(prev => [...prev, documentIdToRemove]);
    // Remove the document from the display list immediately
    setExistingCaseDocuments(prev => prev.filter(doc => doc.documentId !== documentIdToRemove)); // Filter by documentId
  };


  // --- Handle Update Case Submission ---
  const handleUpdateCase = async () => {
    setIsLoading(true);
    setIsSubmitting(true);

    let finalCaseId = updateFormData.CaseId; // Should already be set from params

    try {
      // --- Validation ---
      const requiredFields = [
        { field: "caseNumber", label: "PS Case No." }, { field: "CaseDate", label: "PS Case Date" },
        { field: "districtId", label: "District" }, { field: "psId", label: "Police Station" },
        { field: "caseTypeId", label: "Case Type" }, { field: "hearingDate", label: "Hearing Date" },
        { field: "filingDate", label: "Filing Date" }, { field: "petitionName", label: "Petitioner Name" },
        { field: "CourtCaseDescription", label: "Court Case Description" },
        { field: "crmID", label: "Reference Type" }, { field: "refferenceNumber", label: "Reference Number" }, { field: "refferenceyear", label: "Reference Year" },
        { field: "refferenceId", label: "Reference ID" }, // Ensure refferenceId is present
      ];
      const missingFields = requiredFields.filter(({ field }) => !updateFormData[field]);
      if (missingFields.length > 0) { throw new Error(`Please fill required fields: ${missingFields.map(f => f.label).join(", ")}`); }
      if (updateFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length > 100) { throw new Error("Description cannot exceed 100 words."); }
      if (selectedIpcSections.length === 0 && otherSectionsList.length === 0) { throw new Error("Please add at least one IPC/BNS section."); }


      // --- 1. Delete Existing Documents ---
      if (documentsToDelete.length > 0) {
        console.log(`Deleting ${documentsToDelete.length} documents...`);
        for (const docId of documentsToDelete) {
          try {
            // Assuming delete-doc API uses POST and expects DocumentID in body
            const deleteResult = await postRequest("delete-doc", { DocumentID: docId });
            if (deleteResult.status === 0) {
              console.log(`Document ${docId} deleted successfully.`);
            } else {
              console.warn(`Failed to delete document ${docId}:`, deleteResult.message);
              openAlert("warning", `Failed to delete document ${docId}: ${deleteResult.message}`);
            }
          } catch (delErr) {
            console.error(`Error deleting document ${docId}:`, delErr);
            openAlert("error", `Error deleting document ${docId}: ${delErr.message}`);
          }
        }
        setDocumentsToDelete([]); // Clear the list after attempting deletion
      }

      // --- 2. Prepare Payload for Case Update ---
      const finalStandardSections = selectedIpcSections.map(section => ({
        bnsId: section.IPCBnsId.toString(), // Map IPCBnsId to bnsId for the SP
        otherIpcAct: section.IPCName, // Pass IPCName as otherIpcAct for the SP
        otherBnsAct: section.IPCBnsSubject, // Pass IPCBnsSubject as otherBnsAct for the SP
        CaseIpcID: section.CaseIPCBnsId, // Include CaseIpcID for existing sections
      }));
      const finalOtherSections = otherSectionsList.map(row => ({
        bnsId: OTHER_SECTION_BNS_ID.toString(), // Hardcode for 'other'
        otherIpcAct: row.ipcValue, // This is otherIpcAct
        otherBnsAct: row.bnsValue, // This is otherBnsAct
        CaseIpcID: row.CaseIPCBnsId, // Include CaseIpcID for existing 'other' sections
      }));
      const combinedIpcSections = [...finalStandardSections, ...finalOtherSections];

      // Payload for the update-case API
      const caseApiData = {
        CaseId: updateFormData.CaseId,
        InRefferenceID: updateFormData.refferenceId, // Pass the existing RefferenceID
        caseNumber: updateFormData.caseNumber,
        CaseDate: updateFormData.CaseDate,
        districtId: updateFormData.districtId,
        psId: updateFormData.psId,
        caseTypeId: updateFormData.caseTypeId,
        filingDate: updateFormData.filingDate,
        petitionName: updateFormData.petitionName,
        hearingDate: updateFormData.hearingDate,
        CourtCaseDescription: updateFormData.CourtCaseDescription,
        EntryUserID: user.AuthorityUserID,
        crmID: updateFormData.crmID, // This is RefferenceDropDownID
        refferenceId: updateFormData.refferenceId,
        refferenceNumber: updateFormData.refferenceNumber,
        refferenceyear: updateFormData.refferenceyear,
        ipcSections: combinedIpcSections,
        removedSections: removedIpcSectionIds, // IDs of IPC sections removed by user
      };

      console.log("Removed Section IDs to delete:", removedIpcSectionIds);
      console.log("IPC Sections to save:", combinedIpcSections);

      console.log("Submitting Case Update Data:", caseApiData);
      // Assuming 'update-case' endpoint maps to the updateCase controller
      const caseResult = await postRequest("update-case", caseApiData);

      if (caseResult && caseResult.status === 0 && caseResult.data?.CaseID) {
        finalCaseId = caseResult.data.CaseID; // Confirm CaseID, though it should be same as input
        console.log(`Case ${finalCaseId} updated successfully.`);

        // --- 3. Upload Newly Added Main Case Documents ---
        if (mainCaseDocuments.length > 0) {
          try {
            console.log(`Uploading ${mainCaseDocuments.length} new main case documents for CaseID: ${finalCaseId}`);
            // uploadCaseDocuments needs CaseID, files, EntryUserID
            await uploadCaseDocuments(finalCaseId, mainCaseDocuments, user.AuthorityUserID);
            console.log("New main case documents uploaded successfully.");
          } catch (docUploadError) {
            console.error("New main case document upload failed:", docUploadError);
            openAlert("warning", `Failed to upload some new documents: ${docUploadError.message || String(docUploadError)}`);
          }
        }

        openAlert("success", `Case ${finalCaseId} updated successfully.`);

        // Optionally, re-fetch case details to refresh the form with latest data
        // For simplicity, we'll just reload the page or navigate away in a real app
        // For this example, we might refresh just the document list.
        // Or, more robustly, navigate back to a case list or success page.
        // For now, we'll just clear the newly added documents and removed IPC sections.
        setMainCaseDocuments([]);
        setRemovedIpcSectionIds([]);
        // Consider re-fetching initial data and case details for a full refresh
        // fetchAllRequiredData(); // If you uncomment this, adjust loading states
      } else {
        throw new Error(caseResult?.message || "Failed to update Case.");
      }

    } catch (err) {
      console.error("Error in handleUpdateCase:", err);
      openAlert("error", err.message || "An unexpected error occurred during update.");
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
            <CardTitle className="text-white text-xl">Update Case Details (Case ID: {case_id})</CardTitle>
          </CardHeader>

          {/* This page is now solely for updating, no tabs needed as per implied requirement */}
          <Tabs defaultValue="update" value="update" className="w-full">
            {/* <TabsList className="grid grid-cols-1 mx-6 mt-4">
              <TabsTrigger value="update">Update Case Details</TabsTrigger>
            </TabsList> */}

            {/* Update Case Tab Content */}
            <TabsContent value="update">
              <div>
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="mr-2 h-8 w-8 animate-spin text-blue-600" />
                      <span className="text-gray-700 text-lg">Loading Case Details...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {/* Case Details Fields (Rows 1-4) - Using updateFormData */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="caseNumber">PS Case No.<span className="text-red-500">*</span></Label> <Input id="caseNumber" name="caseNumber" value={updateFormData.caseNumber} onChange={handleUpdateChange} disabled={isSubmitting} /> </div>
                        <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="CaseDate">PS Case Date<span className="text-red-500">*</span></Label> <Input id="CaseDate" name="CaseDate" type="date" value={updateFormData.CaseDate} onChange={handleUpdateChange} max={new Date().toISOString().split("T")[0]} disabled={isSubmitting} /> </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="petitionName">Petitioner Name<span className="text-red-500">*</span></Label> <Input id="petitionName" name="petitionName" value={updateFormData.petitionName} onChange={handleUpdateChange} disabled={isSubmitting} /> </div>
                        <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="filingDate">Filing Date<span className="text-red-500">*</span></Label> <Input id="filingDate" name="filingDate" type="date" value={updateFormData.filingDate} onChange={handleUpdateChange} max={new Date().toISOString().split("T")[0]} disabled={isSubmitting} /> </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="font-semibold" htmlFor="districtId">
                            District<span className="text-red-500">*</span>
                          </Label>
                          <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between font-normal" disabled={isSubmitting}> {updateFormData.districtId ? allDistrictList.find(d => d.districtId.toString() === updateFormData.districtId)?.districtName : "Select District"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput />
                                <CommandList>
                                  <CommandEmpty />
                                  <CommandGroup>{(allDistrictList || []).map(d => (<CommandItem key={d.districtId} value={d.districtName} onSelect={() => { handleUpdateSelectChange("districtId", d.districtId.toString()); setOpenDistrict(false); }}>
                                    <Check className={cn(updateFormData.districtId === d.districtId.toString() ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{d.districtName}</CommandItem>))}
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
                              <Button variant="outline" role="combobox" className="w-full justify-between font-normal" disabled={!updateFormData.districtId || allPSList.length === 0 || isSubmitting}> {updateFormData.psId ? allPSList.find(ps => ps.id.toString() === updateFormData.psId)?.ps_name : "Select PS"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput />
                                <CommandList>
                                  <CommandEmpty />
                                  <CommandGroup>
                                    {(allPSList || []).map(ps => (<CommandItem key={ps.id} value={ps.ps_name} onSelect={() => { handleUpdateSelectChange("psId", ps.id.toString()); setOpenPS(false); }}><Check className={cn(updateFormData.psId === ps.id.toString() ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{ps.ps_name}</CommandItem>))}
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
                              <Button variant="outline" role="combobox" className="w-full justify-between font-normal" disabled={isSubmitting}> {updateFormData.caseTypeId ? caseTypeList.find(ct => ct.CasetypeId.toString() === updateFormData.caseTypeId)?.CasetypeName : "Select Case Type"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput />
                                <CommandList>
                                  <CommandEmpty />
                                  <CommandGroup>
                                    {(caseTypeList || []).map(ct => (<CommandItem key={ct.CasetypeId} value={ct.CasetypeName} onSelect={() => { handleUpdateSelectChange("caseTypeId", ct.CasetypeId.toString()); setOpenCaseType(false); }}>
                                      <Check className={cn(updateFormData.caseTypeId === ct.CasetypeId.toString() ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{ct.CasetypeName}</CommandItem>))}
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
                          <Input id="hearingDate" name="hearingDate" type="date" value={updateFormData.hearingDate} onChange={handleUpdateChange} min={updateFormData.CaseDate || undefined} disabled={isSubmitting} />
                        </div>
                      </div>

                      <div className="space-y-1.5"> <Label className="font-semibold" htmlFor="CourtCaseDescription">Description<span className="text-red-500">*</span> (Max 100 words)</Label> <textarea id="CourtCaseDescription" name="CourtCaseDescription" rows={3} value={updateFormData.CourtCaseDescription} onChange={handleUpdateChange} className="w-full border rounded-md px-3 py-2 text-sm" disabled={isSubmitting} /> <p className={cn("text-xs text-right", updateFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length > 100 ? "text-red-600" : "text-gray-500")}> {updateFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length} / 100 words </p> </div>

                      {/* --- Single Reference Section --- */}
                      <div className="space-y-3 border-t pt-4 mt-2">
                        <Label className="font-semibold text-gray-700 text-md">Reference Details <span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600" htmlFor="crmID">Reference Type</Label>
                            <Popover open={openReference} onOpenChange={setOpenReference}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-sm" disabled={isLoading || isSubmitting}> {updateFormData.crmID ? referenceList.find(r => r.refferenceId.toString() === updateFormData.crmID)?.refferenceName : "Select Reference Type..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                  <CommandInput />
                                  <CommandList>
                                    <CommandEmpty />
                                    <CommandGroup>
                                      {(referenceList || []).map(r => (<CommandItem key={r.refferenceId} value={r.refferenceName} onSelect={() => { handleUpdateSelectChange("crmID", r.refferenceId.toString()); setOpenReference(false); }}>
                                        <Check className={cn(updateFormData.crmID === r.refferenceId.toString() ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{r.refferenceName}</CommandItem>))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600" htmlFor="refferenceNumber">
                              Reference Number
                            </Label>
                            <Input id="refferenceNumber" name="refferenceNumber" value={updateFormData.refferenceNumber} onChange={handleUpdateChange} className="text-sm" disabled={isSubmitting} />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-gray-600" htmlFor="refferenceyear">
                              Reference Year
                            </Label>
                            <Popover open={openYear} onOpenChange={setOpenYear}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between text-sm font-normal" disabled={isSubmitting}> {updateFormData.refferenceyear || "Select Year..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                  <CommandInput />
                                  <CommandList>
                                    <CommandEmpty />
                                    <CommandGroup>
                                      {years.map(y => (<CommandItem key={y} value={y} onSelect={() => { handleUpdateSelectChange("refferenceyear", y); setOpenYear(false); }}>
                                        <Check className={cn(updateFormData.refferenceyear === y ? "opacity-100" : "opacity-0", "mr-2 h-4 w-4")} />{y}</CommandItem>))}
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
                          {selectedIpcSections.map((section) => (<Badge key={section.CaseIPCBnsId || section.localId} variant="secondary" className="flex items-center gap-2 py-1.5 px-2.5 text-xs"> <div>{useIpcDisplay ? section.IPCName : section.BnsName}</div> <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => removeIpcSection(section)} disabled={isSubmitting}><X className="h-3 w-3" /></Button> </Badge>))}
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
                                {/* Changed key to use e.IPCBnsId + e.IPCName/BnsName as a more robust unique key during initial selection if multiple items share the same IPCBnsId but different names (which should ideally not happen but for safety) */}
                                <CommandGroup>
                                  {(useIpcDisplay ? ipcActList : bnsSectionList)
                                    .filter(e => {
                                      const alreadySelected = selectedIpcSections.some(s => s.IPCBnsId?.toString() === e.bnsId?.toString());
                                      const isOther = e.bnsId === 534;
                                      return !alreadySelected && !isOther;
                                    })
                                    .map((e, index) => (
                                      <CommandItem
                                        key={`option-${e.bnsId}-${index}`}
                                        value={useIpcDisplay ? e.ipcSection : e.bnsSection}
                                        onSelect={() => {
                                          addIpcSection(e.bnsId.toString());
                                          setOpenIpcAct(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            selectedIpcSections.some(s => s.IPCBnsId?.toString() === e.bnsId?.toString())
                                              ? "opacity-100"
                                              : "opacity-0",
                                            "mr-2 h-4 w-4"
                                          )}
                                        />
                                        {useIpcDisplay ? e.ipcSection : e.bnsSection}
                                      </CommandItem>
                                    ))}
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
                        {otherSectionsList.length > 0 && (<div className="border rounded-md overflow-hidden mt-4"><Table><TableHeader><TableRow><TableHead>Other IPC</TableHead><TableHead>Other BNS</TableHead><TableHead className="w-[50px] text-right">Act</TableHead></TableRow></TableHeader><TableBody>{otherSectionsList.map(s => (<TableRow key={s.CaseIPCBnsId || s.id}><TableCell className="text-sm">{s.ipcValue || "-"}</TableCell><TableCell className="text-sm">{s.bnsValue || "-"}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeOtherSectionRow(s)} className="h-7 w-7 text-red-500 hover:bg-red-100" disabled={isSubmitting}><Trash className="h-3.5 w-3.5" /></Button></TableCell></TableRow>))}</TableBody></Table></div>)}
                      </div>

                      {/* --- Main Case Document Upload (for new docs) --- */}
                      <div className="space-y-3 border-t pt-4 mt-2">
                        <Label className="font-semibold text-gray-700 text-md">Upload New Case Documents (Optional)</Label>
                        <Input type="file" multiple onChange={handleMainCaseFileChange} accept=".pdf" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 h-11" disabled={isSubmitting} />
                        {mainCaseDocuments.length > 0 && (<div className="mt-3 space-y-2"> <p className="text-sm font-medium text-gray-600">Selected New Documents:</p> <ul className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50"> {mainCaseDocuments.map((file, index) => (<li key={index} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-gray-100"> <div className="flex items-center overflow-hidden mr-2"> <FileText className="h-4 w-4 mr-2 text-gray-500 shrink-0" /> <span className="truncate" title={file.name}>{file.name}</span> <span className="ml-2 text-gray-500 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span> </div> <Button size="sm" variant="ghost" onClick={() => removeMainCaseDocument(index)} className="h-6 w-6 p-0 text-red-500 hover:bg-red-100" disabled={isSubmitting}><Trash className="h-3.5 w-3.5" /></Button> </li>))} </ul> </div>)}
                        <p className="text-xs text-gray-500">Max file size: {MAX_FILE_SIZE_MB} MB. Allowed format: PDF</p>
                      </div>

                      {/* --- Existing Case Documents List (from backend) --- */}
                      <div className="space-y-3 border-t pt-4 mt-2">
                        <Label className="font-semibold text-gray-700 text-md">Existing Case Documents</Label>
                        {isLoadingDocumentTable ? (
                          <div className="flex justify-center items-center h-24">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
                            <span className="text-gray-600">Loading Documents...</span>
                          </div>
                        ) : existingCaseDocuments.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-gray-600">Documents attached to this case:</p>
                            <ul className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
                              {existingCaseDocuments.map((doc, index) => (
                                <li key={doc.documentId} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-gray-100">
                                  <div className="flex items-center overflow-hidden mr-2">
                                    <FileText className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                                    <span className="truncate" title={doc.caseDocument}>{getFileName(doc.caseDocument)}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeExistingCaseDocument(doc.documentId)}
                                    className="h-6 w-6 p-0 text-red-500 hover:bg-red-100"
                                    disabled={isSubmitting}
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No existing documents for this case.</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-center mt-6 border-t pt-6">
                        <Button onClick={handleUpdateCase} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md shadow-md text-base" disabled={isSubmitting || isLoading}>
                          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Update Case Details"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  )
}

export default UpdateCasePage
