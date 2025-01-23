'use client'

import React, { useState, useEffect } from 'react'
import { 
  createCaseOfficeAdmin , 
  handleNotifyFromPPOfficeAdmin , 
  getcasetype , 
  showRefferenceDetails , 
  alldistrict , 
  showpoliceBydistrict } from '@/app/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { DatePicker } from '@/components/date-picker'
import { useSelector } from 'react-redux'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, FileText, Hash, MapPin, Bookmark, Book, Clock, Send, Copy, Image } from 'lucide-react'
import { decrypt } from '@/utils/crypto'

const AddCasePage = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
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

  const [formData, setFormData] = useState({
    CaseNumber: '',
    EntryUserID: '',
    CaseDate: '',
    DistrictID: '',
    psID: '',
    caseTypeID: '',
    ref: '',
    ipcAct: '',
    hearingDate: '',
    sendTo: '',
    copyTo: '',
    photocopycaseDiaryExist: '0',
    caseDocument: null,
  })

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser));
    setUser(decoded_user);
    setFormData(prevState => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID
    }));
  }, [encryptedUser]);


  useEffect(() => {
    if (user) {
      getcasetype()
        .then((result) => {
          setCaseTypeList(result);
        })
        .catch((err) => {
          openAlert('error', err?.message || "An unexpected error occurred");
        });

      showRefferenceDetails()
        .then((result) => {
          setReferenceList(result);
        })
        .catch((err) => {
          openAlert('error', err?.message || "An unexpected error occurred");
        });

      alldistrict()
        .then((result) => {
          setAllDistrictList(result);
        })
        .catch((err) => {
          openAlert('error', err?.message || "An unexpected error occurred");
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
          openAlert('error', err?.message || "An unexpected error occurred");
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
          openAlert('error', err?.message || "An unexpected error occurred");
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
    setFormData(prevState => ({ ...prevState, [name]: value }));
  }


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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
      if (file.size > 15000 * 1024) { // 15 MB in bytes
        openAlert('error', 'File size should not exceed 215 MB');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'application/pdf'].includes(file.type)) {
        openAlert('error', 'Only JPG, JPEG, or PDF files are allowed');
        return;
      }
      setFormData(prevState => ({
        ...prevState,
        caseDocument: file,
        photocopycaseDiaryExist: '1'
      }));
    }
  }

  // const handleAddCase = () => {
  //   setIsLoading(true)
  //   createCaseOfficeAdmin(formData)
  //     .then(async(result) => {
  //         console.log(result)
  //         openAlert('success', result.message || "success")
  //         try{
  //           const res = await handleNotifyFromPPOfficeAdmin(result?.data?.CaseID)
  //           console.log(res);
  //         }catch(err){
  //           console.log(err);
            
  //         }

          
  //         setFormData({
  //           CaseNumber: '',
  //           EntryUserID: '',
  //           CaseDate: '',
  //           DistrictID: '',
  //           psID: '',
  //           caseTypeID: '',
  //           ref: '',
  //           ipcAct: '',
  //           hearingDate: '',
  //           sendTo: '',
  //           copyTo: '',
  //           photocopycaseDiaryExist: '0',
  //           caseDocument: null,
  //         })
        
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //       openAlert('error', err || "An unexpected error occurred")
  //       setError(err || "An unexpected error occurred");
  //     })
  //     .finally(() => {
  //       setIsLoading(false);
  //     });
  // }


  const handleAddCase = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === 'caseDocument') {
          if (formData[key]) {
            formDataToSend.append('caseDocument', formData[key]);
          }
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }

      const result = await createCaseOfficeAdmin(formDataToSend);
      console.log(result);
      openAlert('success', result.message || "Case added successfully");
      try {
        const res = await handleNotifyFromPPOfficeAdmin(result?.data?.CaseID);
        console.log(res);
      } catch (err) {
        console.log(err);
      }

      setFormData({
        CaseNumber: '',
        EntryUserID: user.AuthorityUserID,
        CaseDate: '',
        DistrictID: '',
        psID: '',
        caseTypeID: '',
        ref: '',
        ipcAct: '',
        hearingDate: '',
        sendTo: '',
        copyTo: '',
        photocopycaseDiaryExist: '0',
        caseDocument: null,
      });
    } catch (err) {
      console.log(err);
      openAlert('error', err?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    closeAlert()
  }

  return (
    <div className="relative min-h-screen w-full">
          <div
            className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]"
          />
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
                <Label className="font-bold" htmlFor="CaseNumber">Case Number</Label>
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
                <Label className="font-bold" htmlFor="CaseDate">Case Date</Label>
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
                <Label className="font-bold" htmlFor="DistrictID">District</Label>
                <Select onValueChange={(value) => handleSelectChange('DistrictID', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Districts</SelectLabel>
                      {allDistrictList.map((district) => (
                        <SelectItem key={district.districtId} value={district.districtId.toString()}>
                          {district.districtName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="font-bold" htmlFor="psID">Police Station</Label>
                <Select onValueChange={(value) => handleSelectChange('psID', value)}>
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
              </div>
              <div className="flex-1 space-y-2">
                <Label className="font-bold" htmlFor="ref">Reference</Label>
                <Select onValueChange={(value) => handleSelectChange('ref', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Reference" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectGroup>
                      <SelectLabel>References</SelectLabel>
                      {referenceList.map((ref) => (
                        <SelectItem key={ref.refferenceId} value={ref.refferenceId.toString()}>
                          {ref.refferenceName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label className="font-bold" htmlFor="ipcAct">IPC Act</Label>
                <Input
                  icon={Book}
                  id="ipcAct"
                  name="ipcAct"
                  placeholder="Enter IPC Act"
                  value={formData.ipcAct}
                  onChange={handleChange}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="font-bold" htmlFor="hearingDate">Hearing Date</Label>
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
              <div className="flex-1 space-y-2">
                <Label className="font-bold" htmlFor="sendTo">Send To</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, 'sendTo': value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Send To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Send To</SelectLabel>
                      {allDistrictList.map((district) => (
                        <SelectItem key={district.districtId} value={district.districtId.toString()}>
                          {district.districtName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="font-bold" htmlFor="copyTo">Copy To</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, 'copyTo': value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Copy To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Copy To</SelectLabel>
                      {allSendList.map((ps) => (
                        <SelectItem key={ps.id} value={ps.id.toString()}>
                          {ps.ps_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* <div className="flex space-x-4">
              <div className="w-1/2 space-y-2">
                <Label className="font-bold" htmlFor="photocopycaseDiaryExist">Photocopy Case Diary Exists</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, 'photocopycaseDiaryExist': value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Photocopy Case Diary Exists" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Photocopy Case Diary Exists or Not</SelectLabel>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div> */}
            <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="caseDocument">Case Document</Label>
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
                  <Label className="font-bold" htmlFor="photocopycaseDiaryExist">Photocopy Case Diary Exists</Label>
                  <Input
                    id="photocopycaseDiaryExist"
                    name="photocopycaseDiaryExist"
                    value={formData.photocopycaseDiaryExist === '1' ? 'Yes' : 'No'}
                    readOnly
                  />
                </div>
              </div>
            <Button onClick={handleAddCase} className="max-w-min bg-blue-500 mx-auto my-5 mt-5" disabled={isLoading}>
              {isLoading ? 'Please Wait...' : 'Add Case'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
    </div>
  )
}

export default AddCasePage

