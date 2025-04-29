"use client"

import { useState, useEffect } from "react"
import {
  createCaseOfficeAdmin,
  uploadCaseDocuments,
  getcasetype,
  showRefferenceDetails,
  alldistrict,
  showpoliceBydistrict,
  showIpcSection,
  showBnsSection,
  showIbsByBnsId
} from "@/app/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { useSelector } from "react-redux"
import { Calendar, FileText, Hash, Clock, Trash, Plus, X } from "lucide-react"
import { decrypt } from "@/utils/crypto"
import { Check, ChevronsUpDown} from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { postRequest } from "@/app/commonAPI"
import { Badge } from "@/components/ui/badge"

const AddCasePage = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [isLoading, setIsLoading] = useState(false)
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
  const [activeTab, setActiveTab] = useState("add")
  const [openCaseSelect, setOpenCaseSelect] = useState(false)
  const [useIpcDisplay, setUseIpcDisplay] = useState(true)
  const [ipcToBnsMap, setIpcToBnsMap] = useState({})

  // ---> New State for Other Sections <---
  const [otherIpcSections, setOtherIpcSections] = useState([{ id: Date.now(), value: "", isReadOnly: false }])

  // Dropdown state
  const [openDistrict, setOpenDistrict] = useState(false)
  const [openPS, setOpenPS] = useState(false)
  const [openCaseType, setOpenCaseType] = useState(false)
  const [openReference, setOpenReference] = useState(false)
  const [openIpcAct, setOpenIpcAct] = useState(false)
  const [openYear, setOpenYear] = useState(false)

  // Multiple selections
  const [selectedIpcSections, setSelectedIpcSections] = useState([])
  const [selectedReferences, setSelectedReferences] = useState([])
  const [currentReference, setCurrentReference] = useState({
    crmID: "",
    refferenceNumber: "",
    refferenceyear: new Date().getFullYear().toString(),
  })

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
    const decoded_user = JSON.parse(decrypt(encryptedUser))
    setUser(decoded_user)
    setAddFormData((prevState) => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID,
      filingDate: new Date().toISOString().split("T")[0],
    }))
    setUpdateFormData((prevState) => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID,
      filingDate: new Date().toISOString().split("T")[0],
    }))
  }, [encryptedUser])

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
        .then((result) => {
          setAllPSList(result)
        })
        .catch((err) => {
          openAlert("error", err?.message || "Failed to load police stations")
        })
    }
  }, [addFormData.districtId])

  const handleAddSelectChange = (name, value) => {
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdateSelectChange = async (name, value) => {
    if (name === "CaseNumber") {
      const selectedCase = allCases.find((c) => c.CaseNumber === value)
      if (!selectedCase) return

      // Find the district ID based on SpId
      const districtId = selectedCase.SpId ? selectedCase.SpId.toString() : ""

      // Get police stations for this district
      try {
        const psResult = await showpoliceBydistrict(districtId)
        setAllPSList(psResult)
      } catch (err) {
        openAlert("error", "Failed to load police stations")
      }

      // Format the date from ISO to YYYY-MM-DD
      const formatDate = (dateString) => {
        if (!dateString) return ""
        try {
          const date = new Date(dateString)
          return date.toISOString().split("T")[0]
        } catch (error) {
          return ""
        }
      }

      // Format hearing date from "YYYY-MM-DD HH:MM:SS" to "YYYY-MM-DD"
      const formatHearingDate = (dateString) => {
        if (!dateString) return ""
        try {
          return dateString.split(" ")[0]
        } catch (error) {
          return ""
        }
      }

      setUpdateFormData({
        CaseId: selectedCase.CaseId.toString(),
        CaseNumber: selectedCase.CaseNumber,
        EntryUserID: user.AuthorityUserID,
        CaseDate: formatDate(selectedCase.CaseDate),
        districtId: districtId,
        psId: selectedCase.PsId ? selectedCase.PsId.toString() : "",
        caseTypeId: selectedCase.caseTypeID ? selectedCase.caseTypeID.toString() : "",
        hearingDate: formatHearingDate(selectedCase.CaseHearingDate),
        filingDate: formatDate(selectedCase.CaseDate),
        petitionName: selectedCase.CaseNumber,
      })

      // Reset selected IPC sections and references
      setSelectedIpcSections([])
      setSelectedReferences([])
    } else {
      setUpdateFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleAddChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value })
  }

  const handleUpdateChange = (e) => {
    setUpdateFormData({ ...updateFormData, [e.target.name]: e.target.value })
  }

  const handleReferenceChange = (field, value) => {
    setCurrentReference((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addIpcSection = async (bnsId) => {
    if (selectedIpcSections.length + otherIpcSections.filter(s => s.value && s.isReadOnly).length >= 10) {
      openAlert("error", "Maximum 10 sections (including Other) allowed")
      return
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
    setSelectedIpcSections((prev) => prev.filter((item) => item.bnsId !== bnsId))
    setIpcToBnsMap(prev => {
      const newMap = { ...prev };
      delete newMap[bnsId];
      return newMap;
    })
  }

  // ---> New Functions for Other Sections <---
  const handleOtherSectionChange = (id, value) => {
    setOtherIpcSections(prev =>
      prev.map(section => section.id === id ? { ...section, value } : section)
    )
  }

  const addOtherSectionField = () => {
    // Keep the limit check for combined sections
    if (selectedIpcSections.length + otherIpcSections.filter(s => s.value && s.isReadOnly).length >= 10) {
      openAlert("error", "Maximum 10 sections (including Other) allowed")
      return
    }

    // Make the last one read-only if it has value
    const lastSection = otherIpcSections[otherIpcSections.length - 1];
    if (lastSection && lastSection.value.trim() !== "") {
      setOtherIpcSections(prev =>
        prev.map(section => section.id === lastSection.id ? { ...section, isReadOnly: true } : section)
      );
      // Add the new empty field
      setOtherIpcSections(prev => [...prev, { id: Date.now(), value: "", isReadOnly: false }]);
    } else {
      openAlert("error", "Please enter a value in the current 'Other Section' field before adding a new one.")
    }
  }

  const removeOtherSection = (id) => {
    setOtherIpcSections(prev => prev.filter(section => section.id !== id))
    // If removing the last empty input, ensure there's always one empty input left, unless all are removed.
    setOtherIpcSections(prev => {
      const remaining = prev.filter(section => section.id !== id);
      if (remaining.length === 0 || remaining.every(s => s.isReadOnly)) {
        // If no sections left, or all remaining are read-only, add a new empty one
        return [...remaining, { id: Date.now(), value: "", isReadOnly: false }];
      }
      // If the last one is now read-only add a new one
      if (remaining.length > 0 && remaining[remaining.length - 1].isReadOnly) {
        return [...remaining, { id: Date.now(), value: "", isReadOnly: false }];
      }
      return remaining; // Otherwise, just return the filtered list
    });
  }

  const addReference = () => {
    if (selectedReferences.length >= 5) {
      openAlert("error", "Maximum 5 references allowed")
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

  const removeReference = (index) => {
    setSelectedReferences((prev) => prev.filter((_, i) => i !== index))
  }

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

  const handleAddCase = async () => {
    setIsLoading(true)

    try {
      // Validate required fields
      const requiredFields = [
        { field: "CaseNumber", label: "Case Number" },
        { field: "CaseDate", label: "Case Date" },
        { field: "districtId", label: "District" },
        { field: "psId", label: "Police Station" },
        { field: "caseTypeId", label: "Case Type" },
        { field: "hearingDate", label: "Hearing Date" },
        { field: "filingDate", label: "Filing Date" },
        { field: "petitionName", label: "Petition Name" },
        { field: "CourtCaseDescription", label: "Court Case Description" },
      ]

      const missingFields = requiredFields.filter(({ field }) => !addFormData[field])

      if (missingFields.length > 0) {
        throw `Please fill in the following required fields: ${missingFields.map((f) => f.label).join(", ")}`
      }

      if (selectedIpcSections.length === 0) {
        throw "Please add at least one IPC section"
      }

      // ---> New VALIDATIONS for Other Sections <---
      const finalOtherSections = otherIpcSections
        .filter(section => section.value.trim() !== "" && section.isReadOnly) // Only take filled, read-only ones
        .map(section => ({
          bnsId: 534, // Fixed ID for other sections
          OtherAct: section.value.trim() // The user input
        }));

      const finalSelectedSections = selectedIpcSections.map(section => ({
        bnsId: section.bnsId.toString(), // Use the selected bnsId
        OtherAct: "" // Empty string for standard sections
      }));

      const combinedIpcSections = [...finalSelectedSections, ...finalOtherSections];


      if (combinedIpcSections.length === 0) { // Check combined length
        throw "Please add at least one IPC/BNS or Other section"
      }
      if (combinedIpcSections.length > 10) { // Redundant check, but safe
        throw "Maximum 10 sections (including Other) allowed"
      }

      // Prepare data for API
      const apiData = {
        ...addFormData,
        // ipcSections: selectedIpcSections.map((section) => section.bnsId.toString()), // <-- OLD way
        ipcSections: combinedIpcSections, // <-- NEW way with objects
        refferences: selectedReferences.length > 0 ? selectedReferences : [],
      }

      const caseResult = await createCaseOfficeAdmin(apiData)
      const caseId = caseResult.data.CaseID

      // Upload documents if any
      if (documents.length > 0) {
        await uploadCaseDocuments(caseId, documents, user.AuthorityUserID)
      }

      openAlert("success", "Case and documents added successfully")

      // Reset form
      setAddFormData({
        CaseNumber: "",
        EntryUserID: user.AuthorityUserID,
        CaseDate: "",
        districtId: "",
        psId: "",
        caseTypeId: "",
        filingDate: new Date().toISOString().split("T")[0],
        petitionName: "",
        hearingDate: "",
        CourtCaseDescription: "",
      })

      setSelectedIpcSections([])
      setOtherIpcSections([{ id: Date.now(), value: "", isReadOnly: false }]) // Reset other sections
      setSelectedReferences([])
      setDocuments([])
      setIpcToBnsMap({})

      // Refresh case list
      fetchCases()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (typeof err === 'string' ? err : "An unknown error occurred");
      openAlert("error", errorMessage instanceof Array ? errorMessage.join(", ") : errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCase = async () => {
    setIsLoading(true)

    try {
      // Validate required fields
      if (!updateFormData.CaseId) {
        throw "Please select a case to update"
      }

      if (!updateFormData.hearingDate) {
        throw "Please provide a hearing date"
      }

      if (selectedIpcSections.length === 0) {
        throw "Please add at least one IPC section"
      }

      const finalOtherSections = otherIpcSections
        .filter(section => section.value.trim() !== "" && section.isReadOnly)
        .map(section => ({
          bnsId: 534,
          OtherAct: section.value.trim()
        }));

      const finalSelectedSections = selectedIpcSections.map(section => ({
        bnsId: section.bnsId.toString(),
        OtherAct: ""
      }));

      const combinedIpcSections = [...finalSelectedSections, ...finalOtherSections];


      if (combinedIpcSections.length === 0) {
        throw "Please add at least one IPC/BNS or Other section";
      }
      if (combinedIpcSections.length > 10) {
        throw "Maximum 10 sections (including Other) allowed";
      }

      // Prepare data for API
      const apiData = {
        ...updateFormData,
        // ipcSections: selectedIpcSections.map((section) => section.bnsId.toString()),
        ipcSections: combinedIpcSections, // <-- NEW way
        refferences: selectedReferences.length > 0 ? selectedReferences : [],
      }

      // Call update API
      await createCaseOfficeAdmin(apiData)

      // Upload documents if any
      if (documents.length > 0) {
        await uploadCaseDocuments(updateFormData.CaseId, documents, user.AuthorityUserID)
      }

      openAlert("success", "Case updated successfully")

      // Reset form
      setUpdateFormData({
        CaseId: "",
        CaseNumber: "",
        EntryUserID: user.AuthorityUserID,
        CaseDate: "",
        districtId: "",
        psId: "",
        caseTypeId: "",
        filingDate: "",
        petitionName: "",
        hearingDate: "",
      })

      setSelectedIpcSections([])
      setOtherIpcSections([{ id: Date.now(), value: "", isReadOnly: false }]);
      setSelectedReferences([])
      setDocuments([])
      setIpcToBnsMap({})

      // Refresh case list
      fetchCases()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (typeof err === 'string' ? err : "An unknown error occurred");
      openAlert("error", errorMessage instanceof Array ? errorMessage.join(", ") : errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

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
              {/* <TabsTrigger value="update">Update Existing Case</TabsTrigger> */}
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
                        Petition Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="petitionName"
                        name="petitionName"
                        placeholder="Enter petition name"
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
                      Court Case Description <span className="text-red-500">*</span> (Max 50 words)
                    </Label>
                    <textarea
                      id="CourtCaseDescription"
                      name="CourtCaseDescription"
                      rows={4}
                      value={addFormData.CourtCaseDescription}
                      onChange={(e) => {
                        const wordCount = e.target.value.trim().split(/\s+/).length
                        if (wordCount <= 50) {
                          setAddFormData({ ...addFormData, CourtCaseDescription: e.target.value })
                        }
                      }}
                      placeholder="Enter a brief summary of the case (max 50 words)"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      {addFormData.CourtCaseDescription.trim().split(/\s+/).filter(Boolean).length} / 50 words
                    </p>
                  </div>

                  {/* IPC/BNS Sections */}
                  <div className="space-y-2 mt-2">
                    <Label className="font-bold">
                      IPC / BNS Sections <span className="text-red-500">*</span> (Max 5)
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
                    <div className="flex flex-wrap gap-2 mb-2">
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

                  {/* --- Other IPC/BNS Sections --- */}
                  <div className="mt-4 space-y-2">
                    <Label className="font-bold">Other IPC/BNS Section (Max 5)</Label>
                    {otherIpcSections.map((section, index) => (
                      <div key={section.id} className="flex items-center gap-2">
                        <Input
                          placeholder="Enter other section details"
                          value={section.value}
                          onChange={(e) => handleOtherSectionChange(section.id, e.target.value)}
                          readOnly={section.isReadOnly}
                          className={section.isReadOnly ? "bg-gray-100" : ""}
                        />
                        {section.isReadOnly ? (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeOtherSection(section.id)}
                            className="h-9 w-9" // Match input height
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            onClick={addOtherSectionField}
                            disabled={!section.value.trim() || selectedIpcSections.length + otherIpcSections.filter(s => s.value && s.isReadOnly).length >= 10}
                            className="h-9 w-9" // Match input height
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Add a delete button also for the active input field if there's more than one field OR if it's filled*/}
                        {(otherIpcSections.length > 1 || section.value.trim() !== '') && !section.isReadOnly && (
                          <Button
                            variant="ghost" // Less prominent delete for active input
                            size="icon"
                            onClick={() => removeOtherSection(section.id)}
                            className="h-9 w-9 text-gray-500 hover:text-red-600"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                  </div>

                  {/* References */}
                  <div className="space-y-2 mt-2">
                    <Label className="font-bold">References (Max 5)</Label>

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
                        Petition Name <span className="text-red-500">*</span>
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

                  {/* IPC Sections */}
                  <div className="space-y-2 mt-2">
                    <Label className="font-bold">
                      IPC Sections <span className="text-red-500">*</span> (Max 5)
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

                  {/* References */}
                  <div className="space-y-2 mt-2">
                    <Label className="font-bold">References (Max 5)</Label>
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
      </main>
    </div>
  )
}

export default AddCasePage