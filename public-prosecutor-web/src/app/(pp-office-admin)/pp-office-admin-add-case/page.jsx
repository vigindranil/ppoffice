"use client";

import React, { useState, useEffect } from "react";
import {
  createCaseOfficeAdmin,
  // handleNotifyFromPPOfficeAdmin,
  getcasetype,
  showRefferenceDetails,
  alldistrict,
  showpoliceBydistrict,
} from "@/app/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomAlertDialog } from "@/components/custom-alert-dialog";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { DatePicker } from "@/components/date-picker";
import { useSelector } from "react-redux";
import {
  fetchBnsSections,
  fetchBnsIdFromBnsSection,
  fetchBnsIdFromIpcSection,
  fetchIpcSections,
  fetchIbsByBnsId,
} from "./api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  FileText,
  Hash,
  MapPin,
  Bookmark,
  Book,
  Clock,
  Send,
  Copy,
  Image,
  CloudCog,
} from "lucide-react";
import { decrypt } from "@/utils/crypto";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";

const AddCasePage = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } =
    useAlertDialog();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [triggerAddCase, setTriggerAddCase] = useState(false);
  const [user, setUser] = useState(null);
  const encryptedUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [referenceList, setReferenceList] = useState([]);
  const [allDistrictList, setAllDistrictList] = useState([]);
  const [allPSList, setAllPSList] = useState([]);
  const [allSendList, setAllSendList] = useState([]);
  const [caseTypeList, setCaseTypeList] = useState([]);
  const [bnsSections, setBnsSections] = useState([]);
  const [ipcSections, setIpcSections] = useState([]);
  const [ibsData, setIbsData] = useState({
    BnsSection: "",
    IpcSection: "",
    IbsSubject: "",
    IbsSummary: "",
  });
  const [formData, setFormData] = useState({
    CaseNumber: "",
    EntryUserID: "",
    CaseDate: "",
    DistrictID: "",
    psID: "",
    caseTypeID: "",
    ref: "",
    bnsSection: "",
    sectionType: "ipc", //default value
    hearingDate: "",
    sendTo: "",
    copyTo: "",
    photocopycaseDiaryExist: "0",
    caseDocument: null,
  });
  const [selectedReferenceName, setSelectedReferenceName] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser));
    setUser(decoded_user);
    setFormData((prevState) => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID,
    }));
  }, [encryptedUser]);

  useEffect(() => {
    if (user) {
      getcasetype()
        .then((result) => {
          setCaseTypeList(result);
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred");
        });

      fetchBnsSections(token)
        .then((result) => {
          setBnsSections(result);
          console.log(bnsSections);
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred");
        });

      fetchIpcSections(token)
        .then((result) => {
          setIpcSections(result);
          console.log("Fetched IPC sections:", result);
        })
        .catch((err) => {
          openAlert("error", err?.message || "Error fetching IPC sections");
        });

      showRefferenceDetails()
        .then((result) => {
          setReferenceList(result);
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred");
        });

      alldistrict()
        .then((result) => {
          setAllDistrictList(result);
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred");
        });
    }
  }, [user]);

  useEffect(() => {
    if (formData.sectionType === "ipc" && formData.ipcSection) {
      // For IPC: get BnsId from IPC selection first
      fetchBnsIdFromIpcSection(formData.ipcSection, token)
        .then((bnsId) => {
          return fetchIbsByBnsId(bnsId, token);
        })
        .then((data) => {
          setIbsData(data);
          console.log("Fetched IBS data for IPC section:", data);
        })
        .catch((error) => {
          console.error("Error fetching IBS data for IPC section:", error);
          openAlert("error", error?.message || "Error fetching IBS data");
          setIbsData({
            BnsSection: "",
            IpcSection: "",
            IbsSubject: "",
            IbsSummary: "",
          });
        });
    } else if (formData.sectionType === "bns" && formData.bnsSection) {
      // For BNS: get BnsId from BNS selection first
      fetchBnsIdFromBnsSection(formData.bnsSection, token)
        .then((bnsId) => {
          return fetchIbsByBnsId(bnsId, token);
        })
        .then((data) => {
          setIbsData(data);
          console.log("Fetched IBS data for BNS section:", data);
        })
        .catch((error) => {
          console.error("Error fetching IBS data for BNS section:", error);
          openAlert("error", error?.message || "Error fetching IBS data");
          setIbsData({
            BnsSection: "",
            IpcSection: "",
            IbsSubject: "",
            IbsSummary: "",
          });
        });
    } else {
      // Reset IBS data if no valid selection exists
      setIbsData({
        BnsSection: "",
        IpcSection: "",
        IbsSubject: "",
        IbsSummary: "",
      });
    }
  }, [formData.ipcSection, formData.bnsSection, formData.sectionType, token]);

  useEffect(() => {
    if (formData.DistrictID) {
      showpoliceBydistrict(formData.DistrictID)
        .then((result) => {
          setAllPSList(result);
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred");
        });
    }
  }, [formData.DistrictID]);

  useEffect(() => {
    if (formData.sendTo) {
      showpoliceBydistrict(formData.sendTo)
        .then((result) => {
          setAllSendList(result);
        })
        .catch((err) => {
          openAlert("error", err?.message || "An unexpected error occurred");
        });
    }
  }, [formData.sendTo]);

  // const handleSelectChange = (name, value) => {
  //   setFormData(prevState => {
  //     const newState = { ...prevState, [name]: value };
  //     // if (name === 'DistrictID') {
  //     //   newState.sendTo = value;
  //     //   newState.psID = '';
  //     //   newState.copyTo = '';
  //     // }
  //     // if (name === 'psID') {
  //     //   newState.copyTo = value;
  //     // }
  //     return newState;
  //   });
  // }

  const handleSelectChange = (name, value) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));

    if (name === "ref") {
      const selectedRef = referenceList.find(
        (ref) => ref.refferenceId.toString() === value
      );
      setSelectedReferenceName(selectedRef ? selectedRef.refferenceName : "");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData);
  };

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     if (file.size > 200 * 1024) { // 200 KB in bytes
  //       openAlert('error', 'File size should not exceed 200 KB');
  //       return;
  //     }
  //     if (!['image/jpeg', 'image/jpg', 'application/pdf'].includes(file.type)) {
  //       openAlert('error', 'Only JPG, JPEG, or PDF files are allowed');
  //       return;
  //     }
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setFormData(prevState => ({
  //         ...prevState,
  //         caseDocument: {
  //           name: file.name,
  //           type: file.type,
  //           size: file.size,
  //           data: reader.result
  //         },
  //         photocopycaseDiaryExist: '1'
  //       }));
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15000 * 1024) {
        // 15 MB in bytes
        openAlert("error", "File size should not exceed 215 MB");
        return;
      }
      if (!["image/jpeg", "image/jpg", "application/pdf"].includes(file.type)) {
        openAlert("error", "Only JPG, JPEG, or PDF files are allowed");
        return;
      }
      setFormData((prevState) => ({
        ...prevState,
        caseDocument: file,
        photocopycaseDiaryExist: "1",
      }));
    }
  };

  const handleAddCase = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === "caseDocument") {
          if (formData[key]) {
            formDataToSend.append("caseDocument", formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }

      const result = await createCaseOfficeAdmin(formDataToSend);
      // console.log(result);

      toast({
        title: "Adding Cases",
        description: "Case added successfully",
        duration: 2000,
      });
      openAlert("success", result.message || "Case added successfully");
      try {
        // const res = await handleNotifyFromPPOfficeAdmin(result?.data?.CaseID);
        // console.log(res);
      } catch (err) {
        // console.log(err);
      }

      setFormData({
        CaseNumber: "",
        EntryUserID: user.AuthorityUserID,
        CaseDate: "",
        DistrictID: "",
        psID: "",
        caseTypeID: "",
        ref: "",
        bnsAct: "",
        hearingDate: "",
        sendTo: "",
        copyTo: "",
        photocopycaseDiaryExist: "0",
        caseDocument: null,
      });
    } catch (err) {
      // console.log(err);
      toast({
        title: "Failed in Adding Cases",
        description: "Something went wrong",
        duration: 2000,
        variant: "destructive",
      });
      openAlert("error", err?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    closeAlert();
  };

  const getTruncatedReferenceName = () => {
    if (selectedReferenceName.length > 60) {
      return selectedReferenceName.substring(0, 60) + "...";
    }
    return selectedReferenceName;
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
          <CardHeader className="mb-5 bg-green-600 p-4 text-xl text-white">
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
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("DistrictID", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select District">
                        {allDistrictList.find(
                          (d) => d.districtId.toString() === formData.DistrictID
                        )?.districtName || "Select District"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Districts</SelectLabel>
                        {allDistrictList.map((district) => (
                          <SelectItem
                            key={district.districtId}
                            value={district.districtId.toString()}
                          >
                            {district.districtName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="psID">
                    Police Station
                  </Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("psID", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Police Station" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Police Stations</SelectLabel>
                        {allPSList.map((ps) => (
                          <SelectItem key={ps.id} value={ps.id.toString()}>
                            {ps.ps_name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="caseTypeID">
                    Case Type
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("caseTypeID", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Case Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Case Types</SelectLabel>
                        {caseTypeList.map((caseType) => (
                          <SelectItem
                            key={caseType.CasetypeId}
                            value={caseType.CasetypeId.toString()}
                          >
                            {caseType.CasetypeName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="ref">
                    Reference
                  </Label>
                  <Select
                    onValueChange={(value) => handleSelectChange("ref", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Reference">
                        {getTruncatedReferenceName()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      <SelectGroup>
                        <SelectLabel>References</SelectLabel>
                        {referenceList.map((ref) => (
                          <SelectItem
                            key={ref.refferenceId}
                            value={ref.refferenceId.toString()}
                          >
                            {ref.refferenceName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  {/* <Label className="font-bold" htmlFor="bnsSection"> */}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="hearingDate">
                    Hearing Date 1
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

              <div className="space-y-2">
                <Label className="font-bold">Section Type</Label>
                <RadioGroup
                  defaultValue="ipc"
                  onValueChange={(value) =>
                    handleSelectChange("sectionType", value)
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ipc" id="ipc" />
                    <Label htmlFor="ipc">IPC Section</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bns" id="bns" />
                    <Label htmlFor="bns">BNS Section</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Dynamic Section Fields */}
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label
                    className="font-bold"
                    htmlFor={
                      formData.sectionType === "ipc"
                        ? "ipcSection"
                        : "bnsSection"
                    }
                  >
                    {formData.sectionType === "ipc"
                      ? "IPC Section"
                      : "BNS Section"}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {formData.sectionType === "ipc"
                          ? formData.ipcSection
                            ? ipcSections.find(
                                (item) =>
                                  item.ipcSection === formData.ipcSection
                              )?.ipcSection
                            : `Select IPC SECTION`
                          : formData.bnsSection
                          ? bnsSections.find(
                              (section) =>
                                section.bnsSection === formData.bnsSection
                            )?.bnsSection
                          : `Select BNS SECTION`}

                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search section..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No section found.</CommandEmpty>
                          <CommandGroup>
                            {formData.sectionType === "bns"
                              ? bnsSections.map((section) => (
                                  <CommandItem
                                    key={section.bnsId}
                                    onSelect={() =>
                                      handleSelectChange(
                                        "bnsSection",
                                        section.bnsSection
                                      )
                                    }
                                  >
                                    {section.bnsSection}
                                    {formData.bnsSection ===
                                      section.bnsSection && (
                                      <Check className="ml-auto opacity-100" />
                                    )}
                                  </CommandItem>
                                ))
                              : ipcSections.map((item) => (
                                  <CommandItem
                                    key={item.bnsId}
                                    onSelect={() =>
                                      handleSelectChange(
                                        "ipcSection",
                                        item.ipcSection
                                      )
                                    }
                                  >
                                    {item.ipcSection}
                                    {formData.ipcSection ===
                                      item.ipcSection && (
                                      <Check className="ml-auto opacity-100" />
                                    )}
                                  </CommandItem>
                                ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Read Only Field for the corresponding section */}
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="correspondingSection">
                    {formData.sectionType === "ipc"
                      ? "BNS Section"
                      : "IPC Section"}{" "}
                    (Read Only)
                  </Label>
                  <Input
                    id="correspondingSection"
                    value={
                      formData.sectionType === "ipc"
                        ? ibsData?.BnsSection
                        : ibsData?.IpcSection
                    }
                    readOnly
                    className="bg-gray-300"
                  />
                </div>
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
                  <p className="text-sm text-gray-500">
                    Max file size: 15 MB. Allowed formats: JPG, JPEG, PDF
                  </p>
                </div>
                <div className="flex-1 space-y-2">
                  <Label
                    className="font-bold"
                    htmlFor="photocopycaseDiaryExist"
                  >
                    Photocopy Case Diary Exists
                  </Label>
                  <Input
                    id="photocopycaseDiaryExist"
                    name="photocopycaseDiaryExist"
                    value={
                      formData.photocopycaseDiaryExist === "1" ? "Yes" : "No"
                    }
                    readOnly
                  />
                </div>
              </div>
              <Button
                onClick={handleAddCase}
                className="max-w-min bg-blue-500 mx-auto my-5 mt-5"
                disabled={isLoading}
              >
                {isLoading ? "Please Wait..." : "Add Case"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddCasePage;
