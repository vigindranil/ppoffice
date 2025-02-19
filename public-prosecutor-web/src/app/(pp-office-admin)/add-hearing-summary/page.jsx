"use client";

import React, { useState, useEffect } from "react";
import {
  addHearingSummaryOfficeAdmin,
  handleNotifyHearingPPOfficeAdmin,
  getcasetype,
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
  Undo2,
} from "lucide-react";
import { decrypt } from "@/utils/crypto";

const AddHearingPage = ({ onBack, caseDetails }) => {
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
  const [caseTypeList, setCaseTypeList] = useState([]);
  const [caseTypeName, setCaseTypeName] = useState("");

  const [formData, setFormData] = useState({
    CaseNumber: "",
    EntryUserID: "",
    CaseDescription: "",
    CaseId: "",
    CaseDate: "",
    DistrictID: "",
    psID: "",
    caseTypeID: "",
    nexthearingDate: "",
    requiredDocument: "",
    caseuploadDocumentPath: "",
    additionalRemarks: "",
  });

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
    if (caseDetails && caseTypeList.length > 0) {
      const selectedCaseType = caseTypeList.find(
        (caseType) =>
          caseType.CasetypeId.toString() === caseDetails.caseTypeID.toString()
      );
      setFormData((prevState) => ({
        ...prevState,
        CaseId: caseDetails.CaseId,
        CaseDate: caseDetails.CaseDate.split("T")[0],
        CaseNumber: caseDetails.CaseNumber,
        caseTypeID: caseDetails.caseTypeID,
      }));
      setCaseTypeName(selectedCaseType ? selectedCaseType.CasetypeName : "");
    }
  }, [caseDetails, caseTypeList]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSelectChange = (name, value) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15000 * 1024) {
        // 15 MB in bytes
        openAlert("error", "File size should not exceed 15 MB");
        return;
      }
      if (!["image/jpeg", "image/jpg", "application/pdf"].includes(file.type)) {
        openAlert("error", "Only JPG, JPEG, or PDF files are allowed");
        return;
      }
      setFormData((prevState) => ({
        ...prevState,
        caseuploadDocumentPath: file,
      }));
    }
  };

  const handleAddSummary = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === "caseuploadDocumentPath") {
          if (formData[key]) {
            formDataToSend.append("caseuploadDocumentPath", formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }

      const result = await addHearingSummaryOfficeAdmin(formDataToSend);
      // console.log(result)
      openAlert(
        "success",
        result.message || "Hearing Summary added successfully"
      );
      try {
        const res = await handleNotifyHearingPPOfficeAdmin(
          result?.data?.CaseSummaryID
        );
        // console.log(res)
      } catch (err) {
        // console.log(err)
      }

      setFormData({
        CaseNumber: "",
        EntryUserID: user.AuthorityUserID,
        CaseDescription: "",
        CaseId: "",
        CaseDate: "",
        DistrictID: "",
        psID: "",
        caseTypeID: "",
        nexthearingDate: "",
        requiredDocument: "",
        caseuploadDocumentPath: "",
        additionalRemarks: "",
      });
      onBack();
    } catch (err) {
      // console.log(err)
      openAlert("error", err?.message || "An unexpected error occurred");
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
          <Button onClick={onBack} className="absolute top-4 right-4">
            Back
            <Undo2 />
          </Button>
          <CardHeader className="mb-5 bg-green-600 p-4 text-xl text-white">
            <CardTitle>Add Upcoming Hearing Summary</CardTitle>
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
                    disabled
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
                    value={formData.CaseDate}
                    onChange={handleChange}
                    disabled
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
                      <SelectValue placeholder="Select District" />
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
                {/* <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="caseTypeID">Case Type</Label>
                  <Select onValueChange={(value) => handleSelectChange('caseTypeID', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Case Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Case Types</SelectLabel>
                        {caseTypeList.map((caseType) => (
                          <SelectItem key={caseType.CasetypeId} value={caseType.CasetypeId.toString()}>
                            {caseType.CasetypeName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div> */}
                <div className="flex-1 space-y-2">
                  <label className="font-bold" htmlFor="caseTypeName">
                    Case Type
                  </label>
                  <Input
                    icon={Bookmark}
                    id="caseTypeName"
                    name="caseTypeName"
                    value={caseTypeName}
                    disabled
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="requiredDocument">
                    Required Documents
                  </Label>
                  <Input
                    icon={Book}
                    id="requiredDocument"
                    name="requiredDocument"
                    placeholder="Enter Documents Required in Next Hearing"
                    value={formData.requiredDocument}
                    onChange={handleChange}
                  />
                </div>

                <input
                  type="hidden"
                  id="CaseId"
                  name="CaseId"
                  value={formData.CaseId}
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="caseuploadDocumentPath">
                    Case Document
                  </Label>
                  <Input
                    icon={FileText}
                    id="caseuploadDocumentPath"
                    name="caseuploadDocumentPath"
                    type="file"
                    accept=".jpg,.jpeg,.pdf"
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-gray-500">
                    Max file size: 15 MB. Allowed formats: JPG, JPEG, PDF
                  </p>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="nexthearingDate">
                    Next Hearing Date
                  </Label>
                  <Input
                    icon={Clock}
                    id="nexthearingDate"
                    name="nexthearingDate"
                    type="date"
                    value={formData.nexthearingDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    onInput={(e) => {
                      const selectedDate = e.target.value;
                      const today = new Date().toISOString().split("T")[0];

                      if (selectedDate < today) {
                        e.target.value = today; // Reset to today if past date is entered
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="CaseDescription">
                    Case Description
                  </Label>
                  <Input
                    icon={Book}
                    id="CaseDescription"
                    name="CaseDescription"
                    placeholder="Enter Case Description"
                    value={formData.CaseDescription}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="additionalRemarks">
                    Additional Remarks
                  </Label>
                  <Input
                    icon={Book}
                    id="additionalRemarks"
                    name="additionalRemarks"
                    placeholder="Provide Additional Remarks"
                    value={formData.additionalRemarks}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddSummary}
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

export default AddHearingPage;
