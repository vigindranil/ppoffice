// "use client"

// import { useState, useEffect } from "react"
// import {
//   createCaseOfficeAdmin,
//   uploadCaseDocuments,
//   getcasetype,
//   showRefferenceDetails,
//   alldistrict,
//   showpoliceBydistrict,
//   showIpcSection,
//   showBnsSection,
//   showIbsByBnsId,
// } from "@/app/api"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { CustomAlertDialog } from "@/components/custom-alert-dialog"
// import { useAlertDialog } from "@/hooks/useAlertDialog"
// import { useSelector } from "react-redux"
// import { Calendar, FileText, Hash, Clock, Trash } from "lucide-react"
// import { decrypt } from "@/utils/crypto"
// import { Switch } from "@/components/ui/switch"
// import { Check, ChevronsUpDown } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { postRequest } from "@/app/commonAPI"

// const AddCasePage = () => {
//   const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
//   const [isLoading, setIsLoading] = useState(false)
//   const [user, setUser] = useState(null)
//   const encryptedUser = useSelector((state) => state.auth.user)
//   const [allCases, setAllCases] = useState([])
//   const [referenceList, setReferenceList] = useState([])
//   const [allDistrictList, setAllDistrictList] = useState([])
//   const [allPSList, setAllPSList] = useState([])
//   const [caseTypeList, setCaseTypeList] = useState([])
//   const [ipcActList, setIpcActList] = useState([])
//   const [bnsSectionList, setBnsSectionList] = useState([])
//   const [ibsReceivedDataIPC, setIbsReceivedDataIPC] = useState(null)
//   const [ibsReceivedDataBNS, setIbsReceivedDataBNS] = useState(null)
//   const [isCurrentBnsId, setIsCurrentBnsId] = useState(null)
//   const [useIpcAct, setUseIpcAct] = useState(true)
//   const [documents, setDocuments] = useState([])
//   const [activeTab, setActiveTab] = useState("add")
//   const [openCaseSelect, setOpenCaseSelect] = useState(false)

//   // Dropdown state
//   const [openDistrict, setOpenDistrict] = useState(false)
//   const [openPS, setOpenPS] = useState(false)
//   const [openCaseType, setOpenCaseType] = useState(false)
//   const [openReference, setOpenReference] = useState(false)
//   const [openIpcAct, setOpenIpcAct] = useState(false)
//   const [openBnsSection, setOpenBnsSection] = useState(false)

//   // Form data for adding new case
//   const [addFormData, setAddFormData] = useState({
//     CaseNumber: "",
//     EntryUserID: "",
//     CaseDate: "",
//     districtId: "",
//     psId: "",
//     caseTypeId: "",
//     refNumber: "",
//     ipcAct: "",
//     bnsNumber: "",
//     hearingDate: "",
//   })

//   // Form data for updating existing case
//   const [updateFormData, setUpdateFormData] = useState({
//     CaseId: "",
//     CaseNumber: "",
//     EntryUserID: "",
//     CaseDate: "",
//     districtId: "",
//     psId: "",
//     caseTypeId: "",
//     refNumber: "",
//     ipcAct: "",
//     bnsNumber: "",
//     hearingDate: "",
//   })

//   const [selectedValues, setSelectedValues] = useState({
//     ipcAct: "",
//     bnsNumber: "",
//   })

//   const [updateSelectedValues, setUpdateSelectedValues] = useState({
//     ipcAct: "",
//     bnsNumber: "",
//   })

//   useEffect(() => {
//     const decoded_user = JSON.parse(decrypt(encryptedUser))
//     setUser(decoded_user)
//     setAddFormData((prevState) => ({
//       ...prevState,
//       EntryUserID: decoded_user.AuthorityUserID,
//     }))
//     setUpdateFormData((prevState) => ({
//       ...prevState,
//       EntryUserID: decoded_user.AuthorityUserID,
//     }))
//   }, [encryptedUser])

//   useEffect(() => {
//     if (user) {
//       const fetchInitialData = async () => {
//         try {
//           const [caseTypes, references, districts, ipcSections, bnsSections] = await Promise.all([
//             getcasetype(),
//             showRefferenceDetails(),
//             alldistrict(),
//             showIpcSection(),
//             showBnsSection(),
//           ])

//           setCaseTypeList(caseTypes)
//           setReferenceList(references)
//           setAllDistrictList(districts)
//           setIpcActList(ipcSections)
//           setBnsSectionList(bnsSections)
//         } catch (err) {
//           openAlert("error", err?.message || "Failed to load initial data")
//         }
//       }

//       fetchInitialData()
//       fetchCases()
//     }
//   }, [user])


//   const fetchCases = async () => {
//     try {
//       setIsLoading(true)
//       const response = await postRequest("showallCaseBetweenRange", {
//         startDate: null,
//         endDate: null,
//         isAssign: 2,
//       })

//       if (response.status === 0) {
//         setAllCases(response.data)
//       }
//     } catch (error) {
//       console.error("Error fetching cases:", error)
//       openAlert("error", "Failed to fetch cases")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (addFormData.districtId) {
//       showpoliceBydistrict(addFormData.districtId)
//         .then((result) => {
//           setAllPSList(result)
//         })
//         .catch((err) => {
//           openAlert("error", err?.message || "Failed to load police stations")
//         })
//     }
//   }, [addFormData.districtId])

//   const handleAddSelectChange = async (name, value) => {
//     if (name === "ipcAct" && useIpcAct) {
//       const selectedIpc = ipcActList.find((ipc) => ipc.bnsId.toString() === value)
//       if (!selectedIpc) return

//       setAddFormData((prev) => ({
//         ...prev,
//         ipcAct: selectedIpc.ipcSection,
//         bnsNumber: "",
//       }))

//       setSelectedValues((prev) => ({
//         ...prev,
//         ipcAct: value,
//       }))

//       setIsCurrentBnsId(value)

//       try {
//         const result = await showIbsByBnsId(value)
//         if (Array.isArray(result) && result.length > 0) {
//           setAddFormData((prev) => ({
//             ...prev,
//             bnsNumber: result[0].BnsSection || "",
//           }))
//           setIbsReceivedDataBNS(result[0])
//         }
//       } catch (error) {
//         openAlert("error", "Failed to fetch corresponding BNS Section")
//       }
//     } else if (name === "bnsNumber" && !useIpcAct) {
//       const selectedBns = bnsSectionList.find((bns) => bns.bnsId.toString() === value)
//       if (!selectedBns) return

//       setAddFormData((prev) => ({
//         ...prev,
//         bnsNumber: selectedBns.bnsSection,
//         ipcAct: "",
//       }))

//       setSelectedValues((prev) => ({
//         ...prev,
//         bnsNumber: value,
//       }))

//       setIsCurrentBnsId(value)

//       try {
//         const result = await showIbsByBnsId(value)
//         if (Array.isArray(result) && result.length > 0) {
//           setAddFormData((prev) => ({
//             ...prev,
//             ipcAct: result[0].IpcSection || "",
//           }))
//           setIbsReceivedDataIPC(result[0])
//         }
//       } catch (error) {
//         openAlert("error", "Failed to fetch corresponding IPC Act")
//       }
//     } else {
//       setAddFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }))
//     }
//   }

//   const handleUpdateSelectChange = async (name, value) => {
//     if (name === "CaseNumber") {
//       const selectedCase = allCases.find((c) => c.CaseNumber === value)
//       if (!selectedCase) return

//       // Find the district ID based on SpId
//       const districtId = selectedCase.SpId.toString()

//       // Get police stations for this district
//       try {
//         const psResult = await showpoliceBydistrict(districtId)
//         setAllPSList(psResult)
//       } catch (err) {
//         openAlert("error", "Failed to load police stations")
//       }

//       // Format the date from ISO to YYYY-MM-DD
//       const formatDate = (dateString) => {
//         if (!dateString) return ""
//         try {
//           const date = new Date(dateString)
//           return date.toISOString().split("T")[0]
//         } catch (error) {
//           return ""
//         }
//       }

//       // Format hearing date from "YYYY-MM-DD HH:MM:SS" to "YYYY-MM-DD"
//       const formatHearingDate = (dateString) => {
//         if (!dateString) return ""
//         try {
//           return dateString.split(" ")[0]
//         } catch (error) {
//           return ""
//         }
//       }

//       setUpdateFormData({
//         CaseId: selectedCase.CaseId.toString(),
//         CaseNumber: selectedCase.CaseNumber,
//         EntryUserID: user.AuthorityUserID,
//         CaseDate: formatDate(selectedCase.CaseDate),
//         districtId: districtId,
//         psId: selectedCase.PsId.toString(),
//         caseTypeId: selectedCase.caseTypeID.toString(),
//         refNumber: "",
//         ipcAct: selectedCase.IPCSection || "",
//         bnsNumber: "",
//         hearingDate: formatHearingDate(selectedCase.CaseHearingDate),
//       })

//       // If IPC section exists, try to find the corresponding BNS section
//       if (selectedCase.IPCSection) {
//         const ipcSection = ipcActList.find((ipc) => ipc.ipcSection === selectedCase.IPCSection)
//         if (ipcSection) {
//           try {
//             const result = await showIbsByBnsId(ipcSection.bnsId.toString())
//             if (Array.isArray(result) && result.length > 0) {
//               setUpdateFormData((prev) => ({
//                 ...prev,
//                 bnsNumber: result[0].BnsSection || "",
//               }))
//             }
//           } catch (error) {
//             console.error("Failed to fetch BNS section:", error)
//           }
//         }
//       }
//     } else if (name === "ipcAct" && useIpcAct) {
//       const selectedIpc = ipcActList.find((ipc) => ipc.bnsId.toString() === value)
//       if (!selectedIpc) return

//       setUpdateFormData((prev) => ({
//         ...prev,
//         ipcAct: selectedIpc.ipcSection,
//         bnsNumber: "",
//       }))

//       setUpdateSelectedValues((prev) => ({
//         ...prev,
//         ipcAct: value,
//       }))

//       try {
//         const result = await showIbsByBnsId(value)
//         if (Array.isArray(result) && result.length > 0) {
//           setUpdateFormData((prev) => ({
//             ...prev,
//             bnsNumber: result[0].BnsSection || "",
//           }))
//         }
//       } catch (error) {
//         openAlert("error", "Failed to fetch corresponding BNS Section")
//       }
//     } else if (name === "bnsNumber" && !useIpcAct) {
//       const selectedBns = bnsSectionList.find((bns) => bns.bnsId.toString() === value)
//       if (!selectedBns) return

//       setUpdateFormData((prev) => ({
//         ...prev,
//         bnsNumber: selectedBns.bnsSection,
//         ipcAct: "",
//       }))

//       setUpdateSelectedValues((prev) => ({
//         ...prev,
//         bnsNumber: value,
//       }))

//       try {
//         const result = await showIbsByBnsId(value)
//         if (Array.isArray(result) && result.length > 0) {
//           setUpdateFormData((prev) => ({
//             ...prev,
//             ipcAct: result[0].IpcSection || "",
//           }))
//         }
//       } catch (error) {
//         openAlert("error", "Failed to fetch corresponding IPC Act")
//       }
//     } else {
//       setUpdateFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }))
//     }
//   }

//   const handleAddChange = (e) => {
//     setAddFormData({ ...addFormData, [e.target.name]: e.target.value })
//   }

//   const handleUpdateChange = (e) => {
//     setUpdateFormData({ ...updateFormData, [e.target.name]: e.target.value })
//   }

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files)
//     const validFiles = files.filter((file) => {
//       if (file.size > 15000 * 1024) {
//         openAlert("error", `${file.name} exceeds 15 MB`)
//         return false
//       }
//       if (!["image/jpeg", "image/jpg", "application/pdf"].includes(file.type)) {
//         openAlert("error", `${file.name} is not a valid format (JPG, JPEG, PDF only)`)
//         return false
//       }
//       return true
//     })

//     setDocuments((prev) => [...prev, ...validFiles])
//   }

//   const removeDocument = (index) => {
//     setDocuments((prev) => prev.filter((_, i) => i !== index))
//   }

//   const handleAddCase = async () => {
//     setIsLoading(true)

//     try {
//       // Validate required fields
//       const requiredFields = [
//         { field: "CaseNumber", label: "Case Number" },
//         { field: "CaseDate", label: "Case Date" },
//         { field: "districtId", label: "District" },
//         { field: "psId", label: "Police Station" },
//         { field: "caseTypeId", label: "Case Type" },
//         { field: "hearingDate", label: "Hearing Date" },
//       ]

//       const missingFields = requiredFields.filter(({ field }) => !addFormData[field])

//       if (missingFields.length > 0) {
//         throw `Please fill in the following required fields: ${missingFields.map((f) => f.label).join(", ")}`
//       }

//       if (!addFormData.ipcAct && !addFormData.bnsNumber) {
//         throw "Please select either an IPC Act or BNS Section"
//       }

//       const caseResult = await createCaseOfficeAdmin(addFormData)
//       const caseId = caseResult.data.CaseID

//       // Upload documents if any
//       if (documents.length > 0) {
//         await uploadCaseDocuments(caseId, documents, user.AuthorityUserID)
//       }

//       openAlert("success", "Case and documents added successfully")

//       // Reset form
//       setAddFormData({
//         CaseNumber: "",
//         EntryUserID: user.AuthorityUserID,
//         CaseDate: "",
//         districtId: "",
//         psId: "",
//         caseTypeId: "",
//         refNumber: "",
//         ipcAct: "",
//         bnsNumber: "",
//         hearingDate: "",
//       })

//       setIbsReceivedDataIPC(null)
//       setIbsReceivedDataBNS(null)
//       setIsCurrentBnsId(null)
//       setSelectedValues({ ipcAct: "", bnsNumber: "" })
//       setDocuments([])

//       // Refresh case list
//       fetchCases()
//     } catch (err) {
//       openAlert("error", err instanceof Array ? err.join(", ") : err)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleUpdateCase = async () => {
//     setIsLoading(true)

//     try {
//       // Validate required fields
//       if (!updateFormData.CaseId) {
//         throw "Please select a case to update"
//       }

//       if (!updateFormData.hearingDate) {
//         throw "Please provide a hearing date"
//       }

//       if (!updateFormData.ipcAct && !updateFormData.bnsNumber) {
//         throw "Please select either an IPC Act or BNS Section"
//       }

//       // Call update API
//       await createCaseOfficeAdmin(updateFormData)

//       // Upload documents if any
//       if (documents.length > 0) {
//         await uploadCaseDocuments(updateFormData.CaseId, documents, user.AuthorityUserID)
//       }

//       openAlert("success", "Case updated successfully")

//       // Reset form
//       setUpdateFormData({
//         CaseId: "",
//         CaseNumber: "",
//         EntryUserID: user.AuthorityUserID,
//         CaseDate: "",
//         districtId: "",
//         psId: "",
//         caseTypeId: "",
//         refNumber: "",
//         ipcAct: "",
//         bnsNumber: "",
//         hearingDate: "",
//       })

//       setUpdateSelectedValues({ ipcAct: "", bnsNumber: "" })
//       setDocuments([])

//       // Refresh case list
//       fetchCases()
//     } catch (err) {
//       openAlert("error", err instanceof Array ? err.join(", ") : err)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleConfirm = () => {
//     closeAlert()
//   }

//   return (
//     <div className="relative min-h-screen w-full">
//       <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
//       <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
//       <main className="relative flex-1 p-6 w-full min-h-screen">
//         <CustomAlertDialog
//           isOpen={isOpen}
//           alertType={alertType}
//           alertMessage={alertMessage}
//           onClose={closeAlert}
//           onConfirm={handleConfirm}
//         />

//         <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4 overflow-hidden border-slate-500">
//           <CardHeader className="mb-0 bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3">
//             <CardTitle className="text-white text-xl">Case Management</CardTitle>
//           </CardHeader>

//           <Tabs defaultValue="add" value={activeTab} onValueChange={setActiveTab} className="w-full">
//             <TabsList className="grid grid-cols-2 mx-6 mt-4">
//               <TabsTrigger value="add">Add New Case</TabsTrigger>
//               <TabsTrigger value="update">Update Existing Case</TabsTrigger>
//             </TabsList>

//             {/* Add New Case Tab */}
//             <TabsContent value="add">
//               <CardContent>
//                 <div className="flex flex-col gap-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="CaseNumber">
//                         Case Number <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         icon={Hash}
//                         id="CaseNumber"
//                         name="CaseNumber"
//                         placeholder="Enter case number"
//                         value={addFormData.CaseNumber}
//                         onChange={handleAddChange}
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="CaseDate">
//                         Case Date <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         icon={Calendar}
//                         id="CaseDate"
//                         name="CaseDate"
//                         type="date"
//                         value={addFormData.CaseDate}
//                         onChange={handleAddChange}
//                         max={new Date().toISOString().split("T")[0]}
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="districtId">
//                         District <span className="text-red-500">*</span>
//                       </Label>
//                       <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             role="combobox"
//                             aria-expanded={openDistrict}
//                             className="w-full justify-between"
//                           >
//                             {addFormData.districtId
//                               ? allDistrictList.find(
//                                   (district) => district.districtId.toString() === addFormData.districtId,
//                                 )?.districtName
//                               : "Select District"}
//                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-full p-0">
//                           <Command>
//                             <CommandInput placeholder="Search district..." />
//                             <CommandList>
//                               <CommandEmpty>No district found.</CommandEmpty>
//                               <CommandGroup>
//                                 {allDistrictList.map((district) => (
//                                   <CommandItem
//                                     key={district.districtId}
//                                     onSelect={() => {
//                                       handleAddSelectChange("districtId", district.districtId.toString())
//                                       setOpenDistrict(false)
//                                     }}
//                                   >
//                                     <Check
//                                       className={cn(
//                                         "mr-2 h-4 w-4",
//                                         addFormData.districtId === district.districtId.toString()
//                                           ? "opacity-100"
//                                           : "opacity-0",
//                                       )}
//                                     />
//                                     {district.districtName}
//                                   </CommandItem>
//                                 ))}
//                               </CommandGroup>
//                             </CommandList>
//                           </Command>
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="psId">
//                         Police Station <span className="text-red-500">*</span>
//                       </Label>
//                       <Popover open={openPS} onOpenChange={setOpenPS}>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             role="combobox"
//                             aria-expanded={openPS}
//                             className="w-full justify-between"
//                             disabled={!addFormData.districtId}
//                           >
//                             {addFormData.psId
//                               ? allPSList.find((ps) => ps.id.toString() === addFormData.psId)?.ps_name
//                               : "Select Police Station"}
//                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-full p-0">
//                           <Command>
//                             <CommandInput placeholder="Search police station..." />
//                             <CommandList>
//                               <CommandEmpty>No police station found.</CommandEmpty>
//                               <CommandGroup>
//                                 {allPSList.map((ps) => (
//                                   <CommandItem
//                                     key={ps.id}
//                                     onSelect={() => {
//                                       handleAddSelectChange("psId", ps.id.toString())
//                                       setOpenPS(false)
//                                     }}
//                                   >
//                                     <Check
//                                       className={cn(
//                                         "mr-2 h-4 w-4",
//                                         addFormData.psId === ps.id.toString() ? "opacity-100" : "opacity-0",
//                                       )}
//                                     />
//                                     {ps.ps_name}
//                                   </CommandItem>
//                                 ))}
//                               </CommandGroup>
//                             </CommandList>
//                           </Command>
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="caseTypeId">
//                         Case Type <span className="text-red-500">*</span>
//                       </Label>
//                       <Popover open={openCaseType} onOpenChange={setOpenCaseType}>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             role="combobox"
//                             aria-expanded={openCaseType}
//                             className="w-full justify-between"
//                           >
//                             {addFormData.caseTypeId
//                               ? caseTypeList.find(
//                                   (caseType) => caseType.CasetypeId.toString() === addFormData.caseTypeId,
//                                 )?.CasetypeName
//                               : "Select Case Type"}
//                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-full p-0">
//                           <Command>
//                             <CommandInput placeholder="Search case type..." />
//                             <CommandList>
//                               <CommandEmpty>No case type found.</CommandEmpty>
//                               <CommandGroup>
//                                 {caseTypeList.map((caseType) => (
//                                   <CommandItem
//                                     key={caseType.CasetypeId}
//                                     onSelect={() => {
//                                       handleAddSelectChange("caseTypeId", caseType.CasetypeId.toString())
//                                       setOpenCaseType(false)
//                                     }}
//                                   >
//                                     <Check
//                                       className={cn(
//                                         "mr-2 h-4 w-4",
//                                         addFormData.caseTypeId === caseType.CasetypeId.toString()
//                                           ? "opacity-100"
//                                           : "opacity-0",
//                                       )}
//                                     />
//                                     {caseType.CasetypeName}
//                                   </CommandItem>
//                                 ))}
//                               </CommandGroup>
//                             </CommandList>
//                           </Command>
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="refNumber">
//                         Reference
//                       </Label>
//                       <Popover open={openReference} onOpenChange={setOpenReference}>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             role="combobox"
//                             aria-expanded={openReference}
//                             className="w-full justify-between"
//                           >
//                             {addFormData.refNumber
//                               ? referenceList.find((ref) => ref.refferenceId.toString() === addFormData.refNumber)
//                                   ?.refferenceName
//                               : "Select Reference"}
//                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-full p-0">
//                           <Command>
//                             <CommandInput placeholder="Search reference..." />
//                             <CommandList>
//                               <CommandEmpty>No reference found.</CommandEmpty>
//                               <CommandGroup>
//                                 {referenceList.map((ref) => (
//                                   <CommandItem
//                                     key={ref.refferenceId}
//                                     onSelect={() => {
//                                       handleAddSelectChange("refNumber", ref.refferenceId.toString())
//                                       setOpenReference(false)
//                                     }}
//                                   >
//                                     <Check
//                                       className={cn(
//                                         "mr-2 h-4 w-4",
//                                         addFormData.refNumber === ref.refferenceId.toString()
//                                           ? "opacity-100"
//                                           : "opacity-0",
//                                       )}
//                                     />
//                                     {ref.refferenceName}
//                                   </CommandItem>
//                                 ))}
//                               </CommandGroup>
//                             </CommandList>
//                           </Command>
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className="font-bold" htmlFor="preference">
//                         Choose your Preference <span className="text-red-500">*</span>
//                       </label>
//                       <div className="flex items-center space-x-2">
//                         <div
//                           className={`relative w-20 h-8 rounded-full flex items-center cursor-pointer transition-all 
//                           ${useIpcAct ? "bg-blue-600" : "bg-green-600"}`}
//                           onClick={() => {
//                             setUseIpcAct((prev) => !prev)
//                             setAddFormData((prev) => ({
//                               ...prev,
//                               ipcAct: "",
//                               bnsNumber: "",
//                             }))
//                             setSelectedValues({ ipcAct: "", bnsNumber: "" })
//                             setIbsReceivedDataIPC(null)
//                             setIbsReceivedDataBNS(null)
//                             setIsCurrentBnsId(null)
//                           }}
//                         >
//                           <span className="absolute w-full text-xs font-bold text-white flex justify-center transition-all">
//                             {useIpcAct ? "IPC  --" : "--   BNS"}
//                           </span>
//                           <div
//                             className={`absolute w-7 h-7 bg-white rounded-full shadow-md transform transition-all 
//                             ${useIpcAct ? "translate-x-12" : "translate-x-1"}`}
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="hearingDate">
//                         Hearing Date <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         icon={Clock}
//                         id="hearingDate"
//                         name="hearingDate"
//                         type="date"
//                         value={addFormData.hearingDate}
//                         onChange={handleAddChange}
//                         min={addFormData.CaseDate || undefined}
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {useIpcAct ? (
//                       <>
//                         <div className="space-y-2">
//                           <Label className="font-bold" htmlFor="ipcAct">
//                             IPC Act <span className="text-red-500">*</span>
//                           </Label>
//                           <Popover open={openIpcAct} onOpenChange={setOpenIpcAct}>
//                             <PopoverTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 role="combobox"
//                                 aria-expanded={openIpcAct}
//                                 className="w-full justify-between"
//                               >
//                                 {selectedValues.ipcAct
//                                   ? ipcActList.find((ipc) => ipc.bnsId.toString() === selectedValues.ipcAct)?.ipcSection
//                                   : "Select IPC Act"}
//                                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                               </Button>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-full p-0">
//                               <Command>
//                                 <CommandInput placeholder="Search IPC Act..." />
//                                 <CommandList>
//                                   <CommandEmpty>No IPC Act found.</CommandEmpty>
//                                   <CommandGroup>
//                                     {ipcActList.map((ipc) => (
//                                       <CommandItem
//                                         key={ipc.bnsId}
//                                         onSelect={() => {
//                                           handleAddSelectChange("ipcAct", ipc.bnsId.toString())
//                                           setOpenIpcAct(false)
//                                         }}
//                                       >
//                                         <Check
//                                           className={cn(
//                                             "mr-2 h-4 w-4",
//                                             selectedValues.ipcAct === ipc.bnsId.toString()
//                                               ? "opacity-100"
//                                               : "opacity-0",
//                                           )}
//                                         />
//                                         {ipc.ipcSection}
//                                       </CommandItem>
//                                     ))}
//                                   </CommandGroup>
//                                 </CommandList>
//                               </Command>
//                             </PopoverContent>
//                           </Popover>
//                         </div>
//                         <div className="space-y-2">
//                           <Label className="font-bold" htmlFor="bnsNumber">
//                             Corresponding BNS Section
//                           </Label>
//                           <Input
//                             id="bnsNumber"
//                             name="bnsNumber"
//                             value={ibsReceivedDataBNS?.BnsSection || ""}
//                             readOnly
//                             className="bg-gray-50"
//                           />
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <div className="space-y-2">
//                           <Label className="font-bold" htmlFor="bnsNumber">
//                             BNS Section <span className="text-red-500">*</span>
//                           </Label>
//                           <Popover open={openBnsSection} onOpenChange={setOpenBnsSection}>
//                             <PopoverTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 role="combobox"
//                                 aria-expanded={openBnsSection}
//                                 className="w-full justify-between"
//                               >
//                                 {selectedValues.bnsNumber
//                                   ? bnsSectionList.find((bns) => bns.bnsId.toString() === selectedValues.bnsNumber)
//                                       ?.bnsSection
//                                   : "Select BNS Section"}
//                                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                               </Button>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-full p-0">
//                               <Command>
//                                 <CommandInput placeholder="Search BNS Section..." />
//                                 <CommandList>
//                                   <CommandEmpty>No BNS Section found.</CommandEmpty>
//                                   <CommandGroup>
//                                     {bnsSectionList.map((bns) => (
//                                       <CommandItem
//                                         key={bns.bnsId}
//                                         onSelect={() => {
//                                           handleAddSelectChange("bnsNumber", bns.bnsId.toString())
//                                           setOpenBnsSection(false)
//                                         }}
//                                       >
//                                         <Check
//                                           className={cn(
//                                             "mr-2 h-4 w-4",
//                                             selectedValues.bnsNumber === bns.bnsId.toString()
//                                               ? "opacity-100"
//                                               : "opacity-0",
//                                           )}
//                                         />
//                                         {bns.bnsSection}
//                                       </CommandItem>
//                                     ))}
//                                   </CommandGroup>
//                                 </CommandList>
//                               </Command>
//                             </PopoverContent>
//                           </Popover>
//                         </div>
//                         <div className="space-y-2">
//                           <Label className="font-bold" htmlFor="ipcAct">
//                             Corresponding IPC Act
//                           </Label>
//                           <Input
//                             id="ipcAct"
//                             name="ipcAct"
//                             value={ibsReceivedDataIPC?.IpcSection || ""}
//                             readOnly
//                             className="bg-gray-50"
//                           />
//                         </div>
//                       </>
//                     )}
//                   </div>

//                   <div className="space-y-2 mt-2">
//                     <Label>Upload Case Documents</Label>
//                     <Input type="file" multiple onChange={handleFileChange} accept=".jpg,.jpeg,.pdf" />

//                     {documents.length > 0 && (
//                       <div className="mt-3">
//                         <p className="font-semibold mb-2">Selected Documents:</p>
//                         <ul className="space-y-2 max-h-40 overflow-y-auto">
//                           {documents.map((file, index) => (
//                             <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
//                               <div className="flex items-center">
//                                 <FileText className="h-4 w-4 mr-2 text-blue-500" />
//                                 <span className="truncate max-w-[200px]">{file.name}</span>
//                                 <span className="ml-2 text-xs text-gray-500">
//                                   ({(file.size / 1024 / 1024).toFixed(2)} MB)
//                                 </span>
//                               </div>
//                               <Button
//                                 size="sm"
//                                 variant="destructive"
//                                 onClick={() => removeDocument(index)}
//                                 className="ml-2"
//                               >
//                                 <Trash className="h-4 w-4" />
//                               </Button>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}
//                     <p className="text-sm text-gray-500">Max file size: 15 MB. Allowed formats: JPG, JPEG, PDF</p>
//                   </div>

//                   <div className="flex justify-center mt-6">
//                     <Button
//                       onClick={handleAddCase}
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? "Processing..." : "Add Case"}
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </TabsContent>

//             {/* Update Existing Case Tab */}
//             <TabsContent value="update">
//               <CardContent>
//                 <div className="flex flex-col gap-4">
//                   <div className="space-y-2">
//                     <Label className="font-bold" htmlFor="existingCaseNumber">
//                       Select Case <span className="text-red-500">*</span>
//                     </Label>
//                     <Popover open={openCaseSelect} onOpenChange={setOpenCaseSelect}>
//                       <PopoverTrigger asChild>
//                         <Button
//                           variant="outline"
//                           role="combobox"
//                           aria-expanded={openCaseSelect}
//                           className="w-full justify-between"
//                         >
//                           {updateFormData.CaseNumber || "Select a case to update"}
//                           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                         </Button>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-full p-0">
//                         <Command>
//                           <CommandInput placeholder="Search case number..." />
//                           <CommandList>
//                             <CommandEmpty>No cases found.</CommandEmpty>
//                             <CommandGroup>
//                               {allCases.map((caseItem) => (
//                                 <CommandItem
//                                   key={caseItem.CaseId}
//                                   onSelect={() => {
//                                     handleUpdateSelectChange("CaseNumber", caseItem.CaseNumber)
//                                     setOpenCaseSelect(false)
//                                   }}
//                                 >
//                                   <Check
//                                     className={cn(
//                                       "mr-2 h-4 w-4",
//                                       updateFormData.CaseNumber === caseItem.CaseNumber ? "opacity-100" : "opacity-0",
//                                     )}
//                                   />
//                                   {caseItem.CaseNumber} - {caseItem.SpName}, {caseItem.PsName}
//                                 </CommandItem>
//                               ))}
//                             </CommandGroup>
//                           </CommandList>
//                         </Command>
//                       </PopoverContent>
//                     </Popover>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="updateCaseDate">
//                         Case Date
//                       </Label>
//                       <Input
//                         icon={Calendar}
//                         id="updateCaseDate"
//                         name="CaseDate"
//                         type="date"
//                         value={updateFormData.CaseDate}
//                         readOnly
//                         className="bg-gray-50"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="updateHearingDate">
//                         Hearing Date <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         icon={Clock}
//                         id="updateHearingDate"
//                         name="hearingDate"
//                         type="date"
//                         value={updateFormData.hearingDate}
//                         onChange={handleUpdateChange}
//                         min={updateFormData.CaseDate || undefined}
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="updateDistrictId">
//                         District
//                       </Label>
//                       <Input
//                         id="updateDistrictId"
//                         value={
//                           allDistrictList.find((d) => d.districtId.toString() === updateFormData.districtId)
//                             ?.districtName || ""
//                         }
//                         readOnly
//                         className="bg-gray-50"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="updatePsId">
//                         Police Station
//                       </Label>
//                       <Input
//                         id="updatePsId"
//                         value={allPSList.find((ps) => ps.id.toString() === updateFormData.psId)?.ps_name || ""}
//                         readOnly
//                         className="bg-gray-50"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="updateCaseTypeId">
//                         Case Type
//                       </Label>
//                       <Input
//                         id="updateCaseTypeId"
//                         value={
//                           caseTypeList.find((ct) => ct.CasetypeId.toString() === updateFormData.caseTypeId)
//                             ?.CasetypeName || ""
//                         }
//                         readOnly
//                         className="bg-gray-50"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label className="font-bold" htmlFor="updateRefNumber">
//                         Reference
//                       </Label>
//                       <Popover open={openReference} onOpenChange={setOpenReference}>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             role="combobox"
//                             aria-expanded={openReference}
//                             className="w-full justify-between"
//                           >
//                             {updateFormData.refNumber
//                               ? referenceList.find((ref) => ref.refferenceId.toString() === updateFormData.refNumber)
//                                   ?.refferenceName
//                               : "Select Reference"}
//                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-full p-0">
//                           <Command>
//                             <CommandInput placeholder="Search reference..." />
//                             <CommandList>
//                               <CommandEmpty>No reference found.</CommandEmpty>
//                               <CommandGroup>
//                                 {referenceList.map((ref) => (
//                                   <CommandItem
//                                     key={ref.refferenceId}
//                                     onSelect={() => {
//                                       handleUpdateSelectChange("refNumber", ref.refferenceId.toString())
//                                       setOpenReference(false)
//                                     }}
//                                   >
//                                     <Check
//                                       className={cn(
//                                         "mr-2 h-4 w-4",
//                                         updateFormData.refNumber === ref.refferenceId.toString()
//                                           ? "opacity-100"
//                                           : "opacity-0",
//                                       )}
//                                     />
//                                     {ref.refferenceName}
//                                   </CommandItem>
//                                 ))}
//                               </CommandGroup>
//                             </CommandList>
//                           </Command>
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className="font-bold" htmlFor="updatePreference">
//                         Choose your Preference <span className="text-red-500">*</span>
//                       </label>
//                       <div className="flex items-center space-x-2">
//                         <div
//                           className={`relative w-20 h-8 rounded-full flex items-center cursor-pointer transition-all 
//                           ${useIpcAct ? "bg-blue-600" : "bg-green-600"}`}
//                           onClick={() => {
//                             setUseIpcAct((prev) => !prev)
//                             setUpdateFormData((prev) => ({
//                               ...prev,
//                               ipcAct: "",
//                               bnsNumber: "",
//                             }))
//                             setUpdateSelectedValues({ ipcAct: "", bnsNumber: "" })
//                           }}
//                         >
//                           <span className="absolute w-full text-xs font-bold text-white flex justify-center transition-all">
//                             {useIpcAct ? "IPC  --" : "--   BNS"}
//                           </span>
//                           <div
//                             className={`absolute w-7 h-7 bg-white rounded-full shadow-md transform transition-all 
//                             ${useIpcAct ? "translate-x-12" : "translate-x-1"}`}
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       {useIpcAct ? (
//                         <div className="space-y-2">
//                           <Label className="font-bold" htmlFor="updateIpcAct">
//                             IPC Act <span className="text-red-500">*</span>
//                           </Label>
//                           <Popover open={openIpcAct} onOpenChange={setOpenIpcAct}>
//                             <PopoverTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 role="combobox"
//                                 aria-expanded={openIpcAct}
//                                 className="w-full justify-between"
//                               >
//                                 {updateFormData.ipcAct || "Select IPC Act"}
//                                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                               </Button>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-full p-0">
//                               <Command>
//                                 <CommandInput placeholder="Search IPC Act..." />
//                                 <CommandList>
//                                   <CommandEmpty>No IPC Act found.</CommandEmpty>
//                                   <CommandGroup>
//                                     {ipcActList.map((ipc) => (
//                                       <CommandItem
//                                         key={ipc.bnsId}
//                                         onSelect={() => {
//                                           handleUpdateSelectChange("ipcAct", ipc.bnsId.toString())
//                                           setOpenIpcAct(false)
//                                         }}
//                                       >
//                                         <Check
//                                           className={cn(
//                                             "mr-2 h-4 w-4",
//                                             updateSelectedValues.ipcAct === ipc.bnsId.toString()
//                                               ? "opacity-100"
//                                               : "opacity-0",
//                                           )}
//                                         />
//                                         {ipc.ipcSection}
//                                       </CommandItem>
//                                     ))}
//                                   </CommandGroup>
//                                 </CommandList>
//                               </Command>
//                             </PopoverContent>
//                           </Popover>
//                         </div>
//                       ) : (
//                         <div className="space-y-2">
//                           <Label className="font-bold" htmlFor="updateBnsNumber">
//                             BNS Section <span className="text-red-500">*</span>
//                           </Label>
//                           <Popover open={openBnsSection} onOpenChange={setOpenBnsSection}>
//                             <PopoverTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 role="combobox"
//                                 aria-expanded={openBnsSection}
//                                 className="w-full justify-between"
//                               >
//                                 {updateFormData.bnsNumber || "Select BNS Section"}
//                                 <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                               </Button>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-full p-0">
//                               <Command>
//                                 <CommandInput placeholder="Search BNS Section..." />
//                                 <CommandList>
//                                   <CommandEmpty>No BNS Section found.</CommandEmpty>
//                                   <CommandGroup>
//                                     {bnsSectionList.map((bns) => (
//                                       <CommandItem
//                                         key={bns.bnsId}
//                                         onSelect={() => {
//                                           handleUpdateSelectChange("bnsNumber", bns.bnsId.toString())
//                                           setOpenBnsSection(false)
//                                         }}
//                                       >
//                                         <Check
//                                           className={cn(
//                                             "mr-2 h-4 w-4",
//                                             updateSelectedValues.bnsNumber === bns.bnsId.toString()
//                                               ? "opacity-100"
//                                               : "opacity-0",
//                                           )}
//                                         />
//                                         {bns.bnsSection}
//                                       </CommandItem>
//                                     ))}
//                                   </CommandGroup>
//                                 </CommandList>
//                               </Command>
//                             </PopoverContent>
//                           </Popover>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="space-y-2 mt-2">
//                     <Label>Upload Additional Documents</Label>
//                     <Input type="file" multiple onChange={handleFileChange} accept=".jpg,.jpeg,.pdf" />

//                     {documents.length > 0 && (
//                       <div className="mt-3">
//                         <p className="font-semibold mb-2">Selected Documents:</p>
//                         <ul className="space-y-2 max-h-40 overflow-y-auto">
//                           {documents.map((file, index) => (
//                             <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
//                               <div className="flex items-center">
//                                 <FileText className="h-4 w-4 mr-2 text-blue-500" />
//                                 <span className="truncate max-w-[200px]">{file.name}</span>
//                                 <span className="ml-2 text-xs text-gray-500">
//                                   ({(file.size / 1024 / 1024).toFixed(2)} MB)
//                                 </span>
//                               </div>
//                               <Button
//                                 size="sm"
//                                 variant="destructive"
//                                 onClick={() => removeDocument(index)}
//                                 className="ml-2"
//                               >
//                                 <Trash className="h-4 w-4" />
//                               </Button>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}
//                     <p className="text-sm text-gray-500">Max file size: 15 MB. Allowed formats: JPG, JPEG, PDF</p>
//                   </div>

//                   <div className="flex justify-center mt-6">
//                     <Button
//                       onClick={handleUpdateCase}
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
//                       disabled={isLoading || !updateFormData.CaseId}
//                     >
//                       {isLoading ? "Processing..." : "Update Case"}
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </TabsContent>
//           </Tabs>
//         </Card>
//       </main>
//     </div>
//   )
// }

// export default AddCasePage


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
import { Check, ChevronsUpDown } from "lucide-react"
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
  const [ipcActList, setIpcActList] = useState([])
  const [documents, setDocuments] = useState([])
  const [activeTab, setActiveTab] = useState("add")
  const [openCaseSelect, setOpenCaseSelect] = useState(false)

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
          const [caseTypes, references, districts, ipcSections] = await Promise.all([
            getcasetype(),
            showRefferenceDetails(),
            alldistrict(),
            showIpcSection(),
          ])

          setCaseTypeList(caseTypes)
          setReferenceList(references)
          setAllDistrictList(districts)
          setIpcActList(ipcSections)
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

  const addIpcSection = (bnsId) => {
    if (selectedIpcSections.length >= 5) {
      openAlert("error", "Maximum 5 IPC sections allowed")
      return
    }

    if (selectedIpcSections.some((item) => item.bnsId === bnsId)) {
      openAlert("error", "This IPC section is already added")
      return
    }

    const selectedIpc = ipcActList.find((ipc) => ipc.bnsId.toString() === bnsId)
    if (selectedIpc) {
      setSelectedIpcSections((prev) => [...prev, selectedIpc])
    }
  }

  const removeIpcSection = (bnsId) => {
    setSelectedIpcSections((prev) => prev.filter((item) => item.bnsId !== bnsId))
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
      if (file.size > 15000 * 1024) {
        openAlert("error", `${file.name} exceeds 15 MB`)
        return false
      }
      if (!["image/jpeg", "image/jpg", "application/pdf"].includes(file.type)) {
        openAlert("error", `${file.name} is not a valid format (JPG, JPEG, PDF only)`)
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
      ]

      const missingFields = requiredFields.filter(({ field }) => !addFormData[field])

      if (missingFields.length > 0) {
        throw `Please fill in the following required fields: ${missingFields.map((f) => f.label).join(", ")}`
      }

      if (selectedIpcSections.length === 0) {
        throw "Please add at least one IPC section"
      }

      // Prepare data for API
      const apiData = {
        ...addFormData,
        ipcSections: selectedIpcSections.map((section) => section.bnsId.toString()),
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
      })

      setSelectedIpcSections([])
      setSelectedReferences([])
      setDocuments([])

      // Refresh case list
      fetchCases()
    } catch (err) {
      openAlert("error", err instanceof Array ? err.join(", ") : err)
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

      // Prepare data for API
      const apiData = {
        ...updateFormData,
        ipcSections: selectedIpcSections.map((section) => section.bnsId.toString()),
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
      setSelectedReferences([])
      setDocuments([])

      // Refresh case list
      fetchCases()
    } catch (err) {
      openAlert("error", err instanceof Array ? err.join(", ") : err)
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
              <TabsTrigger value="update">Update Existing Case</TabsTrigger>
            </TabsList>

            {/* Add New Case Tab */}
            <TabsContent value="add">
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold" htmlFor="CaseNumber">
                        Case Number <span className="text-red-500">*</span>
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
                        Case Date <span className="text-red-500">*</span>
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
                    <p className="text-sm text-gray-500">Max file size: 15 MB. Allowed formats: JPG, JPEG, PDF</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
                    <p className="text-sm text-gray-500">Max file size: 15 MB. Allowed formats: JPG, JPEG, PDF</p>
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