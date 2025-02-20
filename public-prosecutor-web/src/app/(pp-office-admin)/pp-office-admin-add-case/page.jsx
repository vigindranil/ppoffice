"use client"

import { useState, useEffect } from "react"
import {
  createCaseOfficeAdmin,
  getcasetype,
  showRefferenceDetails,
  alldistrict,
  showpoliceBydistrict,
  showIpcSection,
  showBnsSection,
  showIbsByBnsId,
} from "@/app/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { useSelector } from "react-redux"
import { Calendar, FileText, Hash, Clock } from "lucide-react"
import { decrypt } from "@/utils/crypto"
import { Switch } from "@/components/ui/switch"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const AddCasePage = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [triggerAddCase, setTriggerAddCase] = useState(false)
  const [user, setUser] = useState(null)
  const encryptedUser = useSelector((state) => state.auth.user)
  const token = useSelector((state) => state.auth.token)
  const [referenceList, setReferenceList] = useState([])
  const [allDistrictList, setAllDistrictList] = useState([])
  const [allPSList, setAllPSList] = useState([])
  const [allSendList, setAllSendList] = useState([])
  const [caseTypeList, setCaseTypeList] = useState([])
  const [ipcActList, setIpcActList] = useState([])
  const [bnsSectionList, setBnsSectionList] = useState([])
  const [ibsReceivedDataIPC, setIbsReceivedDataIPC] = useState(null)
  const [ibsReceivedDataBNS, setIbsReceivedDataBNS] = useState(null)
  const [isCurrentBnsId, setIsCurrentBnsId] = useState(null)
  const [useIpcAct, setUseIpcAct] = useState(true)

  const [openDistrict, setOpenDistrict] = useState(false)
  const [openPS, setOpenPS] = useState(false)
  const [openCaseType, setOpenCaseType] = useState(false)
  const [openReference, setOpenReference] = useState(false)
  const [openIpcAct, setOpenIpcAct] = useState(false)
  const [openBnsSection, setOpenBnsSection] = useState(false)

  const [formData, setFormData] = useState({
    CaseNumber: "",
    EntryUserID: "",
    CaseDate: "",
    DistrictID: "",
    psID: "",
    caseTypeID: "",
    ref: "",
    ipcAct: "",
    bnsNumber: "",
    hearingDate: "",
    photocopycaseDiaryExist: "0",
    caseDocument: null,
  })

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser))
    setUser(decoded_user)
    setFormData((prevState) => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID,
    }))
  }, [encryptedUser])

  useEffect(() => {
    if (user) {
      getcasetype()
        .then((result) => {
          setCaseTypeList(result)
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred")
        })

      showRefferenceDetails()
        .then((result) => {
          setReferenceList(result)
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred")
        })

      alldistrict()
        .then((result) => {
          setAllDistrictList(result)
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred")
        })

      showIpcSection()
        .then((result) => {
          setIpcActList(result)
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred")
        })

      showBnsSection()
        .then((result) => {
          setBnsSectionList(result)
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred")
        })
    }
  }, [user])

  useEffect(() => {
    if (formData.DistrictID) {
      showpoliceBydistrict(formData.DistrictID)
        .then((result) => {
          setAllPSList(result)
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred")
        })
    }
  }, [formData.DistrictID])

  useEffect(() => {
    if (formData.sendTo) {
      showpoliceBydistrict(formData.sendTo)
        .then((result) => {
          setAllSendList(result)
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred")
        })
    }
  }, [formData.sendTo])


  const [selectedValues, setSelectedValues] = useState({
    ipcAct: "",
    bnsNumber: "",
  });
  
  const handleSelectChange = async (name, value) => {
    if (name === "ipcAct" && useIpcAct) {
      const selectedIpc = ipcActList.find((ipc) => ipc.bnsId.toString() === value);
      if (!selectedIpc) return;
  
      setFormData((prev) => ({
        ...prev,
        ipcAct: selectedIpc.ipcSection, // Store actual IPC Act for API submission
        bnsNumber: "", // Clear BNS Number
      }));
  
      setSelectedValues((prev) => ({
        ...prev,
        ipcAct: value, // Store bnsId for UI display
      }));
  
      setIsCurrentBnsId(value);
  
      try {
        const result = await showIbsByBnsId(value);
        if (Array.isArray(result) && result.length > 0) {
          setFormData((prev) => ({
            ...prev,
            bnsNumber: result[0].BnsSection || "",
          }));
          setIbsReceivedDataBNS(result[0]);
        }
      } catch (error) {
        openAlert("error", "Failed to fetch corresponding BNS Section.");
      }
    } 
    else if (name === "bnsNumber" && !useIpcAct) {
      const selectedBns = bnsSectionList.find((bns) => bns.bnsId.toString() === value);
      if (!selectedBns) return;
  
      setFormData((prev) => ({
        ...prev,
        bnsNumber: selectedBns.bnsSection, // Store actual BNS Section for API submission
        ipcAct: "", // Clear IPC Act
      }));
  
      setSelectedValues((prev) => ({
        ...prev,
        bnsNumber: value, // Store bnsId for UI display
      }));
  
      setIsCurrentBnsId(value);
  
      try {
        const result = await showIbsByBnsId(value);
        if (Array.isArray(result) && result.length > 0) {
          setFormData((prev) => ({
            ...prev,
            ipcAct: result[0].IpcSection || "",
          }));
          setIbsReceivedDataIPC(result[0]);
        }
      } catch (error) {
        openAlert("error", "Failed to fetch corresponding IPC Act.");
      }
    } 
    else {
      // Handle other dropdowns
      setFormData((prev) => ({
        ...prev,
        [name]: value, // Update other fields normally
      }));
    }
  };   
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 15000 * 1024) {
        // 15 MB in bytes
        openAlert("error", "File size should not exceed 15 MB")
        return
      }
      if (!["image/jpeg", "image/jpg", "application/pdf"].includes(file.type)) {
        openAlert("error", "Only JPG, JPEG, or PDF files are allowed")
        return
      }
      setFormData((prevState) => ({
        ...prevState,
        caseDocument: file,
        photocopycaseDiaryExist: "1",
      }))
    }
  }

  const handleAddCase = async () => {
    setIsLoading(true)
    try {
      const formDataToSend = new FormData()
      for (const key in formData) {
        if (key === "caseDocument") {
          if (formData[key]) {
            formDataToSend.append("caseDocument", formData[key])
          }
        } else {
          formDataToSend.append(key, formData[key])
        }
      }

      const result = await createCaseOfficeAdmin(formDataToSend)
      // console.log(result);
      openAlert("success", result.message || "Case added successfully")
      // try {
      //   const res = await handleNotifyFromPPOfficeAdmin(result?.data?.CaseID);
      //   // console.log(res);
      // } catch (err) {
      //   // console.log(err);
      //   openAlert('error', err?.message || "An unexpected error occurred");
      // }

      setFormData({
        CaseNumber: "",
        EntryUserID: user.AuthorityUserID,
        CaseDate: "",
        DistrictID: "",
        psID: "",
        caseTypeID: "",
        ref: "",
        ipcAct: "",
        bnsNumber: "",
        hearingDate: "",
        photocopycaseDiaryExist: "0",
        caseDocument: null,
      })
    } catch (err) {
      // console.log(err);
      openAlert("error", err?.message || "An unexpected error occurred")
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
          <CardHeader>
            <CardTitle>Add New Case</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="CaseNumber">
                    Case Number
                  </Label>
                  <Input
                    icon={Hash}
                    id="CaseNumber"
                    name="CaseNumber"
                    placeholder="Enter case number"
                    value={formData.CaseNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="CaseDate">
                    Case Date
                  </Label>
                  <Input
                    icon={Calendar}
                    id="CaseDate"
                    name="CaseDate"
                    type="date"
                    value={formData.CaseDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="DistrictID">
                    District
                  </Label>
                  <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openDistrict}
                        className="w-full justify-between"
                      >
                        {formData.DistrictID
                          ? allDistrictList.find((district) => district.districtId.toString() === formData.DistrictID)
                              ?.districtName
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
                                onSelect={() => handleSelectChange("DistrictID", district.districtId.toString())}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.DistrictID === district.districtId.toString()
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
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="psID">
                    Police Station
                  </Label>
                  <Popover open={openPS} onOpenChange={setOpenPS}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openPS}
                        className="w-full justify-between"
                      >
                        {formData.psID
                          ? allPSList.find((ps) => ps.id.toString() === formData.psID)?.ps_name
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
                              <CommandItem key={ps.id} onSelect={() => handleSelectChange("psID", ps.id.toString())}>
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.psID === ps.id.toString() ? "opacity-100" : "opacity-0",
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
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="caseTypeID">
                    Case Type
                  </Label>
                  <Popover open={openCaseType} onOpenChange={setOpenCaseType}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCaseType}
                        className="w-full justify-between"
                      >
                        {formData.caseTypeID
                          ? caseTypeList.find((caseType) => caseType.CasetypeId.toString() === formData.caseTypeID)
                              ?.CasetypeName
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
                                onSelect={() => handleSelectChange("caseTypeID", caseType.CasetypeId.toString())}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.caseTypeID === caseType.CasetypeId.toString()
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
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="ref">
                    Reference
                  </Label>
                  <Popover open={openReference} onOpenChange={setOpenReference}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openReference}
                        className="w-full justify-between"
                      >
                        {formData.ref
                          ? referenceList.find((ref) => ref.refferenceId.toString() === formData.ref)?.refferenceName
                          : "Select Reference"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search reference..." />
                        <CommandList>
                          <CommandEmpty>No reference found.</CommandEmpty>
                          <CommandGroup>
                            {referenceList.map((ref) => (
                              <CommandItem
                                key={ref.refferenceId}
                                onSelect={() => handleSelectChange("ref", ref.refferenceId.toString())}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.ref === ref.refferenceId.toString() ? "opacity-100" : "opacity-0",
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
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <label className="font-bold" htmlFor="preference">
                    Choose your Preference
                  </label>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`relative w-20 h-8 rounded-full flex items-center cursor-pointer transition-all 
                      ${useIpcAct ? "bg-blue-600" : "bg-green-600"}`}
                      onClick={() => {
                        setUseIpcAct((prev) => !prev); 

                        setFormData((prev) => ({
                          ...prev,
                          ipcAct: "",     
                          bnsNumber: "",
                        }));
                      
                        setIbsReceivedDataIPC(null);
                        setIbsReceivedDataBNS(null);
                        setIsCurrentBnsId(null); 
                      }}
                    >
                      <span
                        className={`absolute w-full text-xs font-bold text-white flex justify-center transition-all`}
                      >
                        {useIpcAct ? "IPC  --" : "--   BNS"}
                      </span>

                      <div
                        className={`absolute w-7 h-7 bg-white rounded-full shadow-md transform transition-all 
                        ${useIpcAct ? "translate-x-12" : "translate-x-1"}`}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="hearingDate">
                    Hearing Date
                  </Label>
                  <Input
                    icon={Clock}
                    id="hearingDate"
                    name="hearingDate"
                    type="date"
                    value={formData.hearingDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
              {useIpcAct ? (
                <>
                  <div className="flex-1 space-y-2">
                    <Label className="font-bold" htmlFor="ipcAct">
                      IPC Act
                    </Label>
                    <Popover open={openIpcAct} onOpenChange={setOpenIpcAct}>
                      <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={openIpcAct} className="w-full justify-between">
                        {selectedValues.ipcAct
                          ? ipcActList.find((ipc) => ipc.bnsId.toString() === selectedValues.ipcAct)?.ipcSection
                          : "Select IPC Act"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search IPC Act..." />
                          <CommandList>
                            <CommandEmpty>No IPC Act found.</CommandEmpty>
                            <CommandGroup>
                              {ipcActList.map((ipc) => (
                                <CommandItem
                                  key={ipc.bnsId}
                                  onSelect={() => handleSelectChange("ipcAct", ipc.bnsId.toString())}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.ipcAct === ipc.bnsId.toString() ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {ipc.ipcSection}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="font-bold" htmlFor="bnsNumber">
                      Corresponding BNS Section
                    </Label>
                    <Input id="bnsNumber" name="bnsNumber" value={ibsReceivedDataBNS?.BnsSection || ""} onChange={handleChange} readOnly />
                  </div>
                </>
                ) : (
                  <>
                  <div className="flex-1 space-y-2">
                    <Label className="font-bold" htmlFor="bnsNumber">
                      BNS Section
                    </Label>
                    <Popover open={openBnsSection} onOpenChange={setOpenBnsSection}>
                      <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={openBnsSection} className="w-full justify-between">
                        {selectedValues.bnsNumber
                          ? bnsSectionList.find((bns) => bns.bnsId.toString() === selectedValues.bnsNumber)?.bnsSection
                          : "Select BNS Section"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search BNS Section..." />
                          <CommandList>
                            <CommandEmpty>No BNS Section found.</CommandEmpty>
                            <CommandGroup>
                              {bnsSectionList.map((bns) => (
                                <CommandItem
                                  key={bns.bnsId}
                                  onSelect={() => handleSelectChange("bnsNumber", bns.bnsId.toString())}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.bnsNumber === bns.bnsId.toString() ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {bns.bnsSection}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="font-bold" htmlFor="ipcAct">
                      Corresponding IPC Act
                    </Label>
                    <Input id="ipcAct" name="ipcAct" value={ibsReceivedDataIPC?.IpcSection || ""} onChange={handleChange} readOnly />
                  </div>
                </>
                )}
                
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="caseDocument">
                    Case Document
                  </Label>
                  <Input
                    icon={FileText}
                    id="caseDocument"
                    name="caseDocument"
                    type="file"
                    accept=".jpg,.jpeg,.pdf"
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-gray-500">Max file size: 15 MB. Allowed formats: JPG, JPEG, PDF</p>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="photocopycaseDiaryExist">
                    Photocopy Case Diary Exists
                  </Label>
                  <Input
                    id="photocopycaseDiaryExist"
                    name="photocopycaseDiaryExist"
                    value={formData.photocopycaseDiaryExist === "1" ? "Yes" : "No"}
                    readOnly
                  />
                </div>
              </div>
              

              <Button onClick={handleAddCase} className="max-w-min bg-blue-500 mx-auto my-5 mt-5" disabled={isLoading}>
                {isLoading ? "Please Wait..." : "Add Case"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default AddCasePage