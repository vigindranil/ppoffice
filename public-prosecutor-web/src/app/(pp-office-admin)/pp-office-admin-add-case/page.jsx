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
    photocopycaseDiaryExist: ''
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

  const handleSelectChange = (name, value) => {
    setFormData(prevState => {
      const newState = { ...prevState, [name]: value };
      if (name === 'DistrictID') {
        newState.sendTo = value;
        newState.psID = '';
        newState.copyTo = '';
      }
      if (name === 'psID') {
        newState.copyTo = value;
      }
      return newState;
    });
  }


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddCase = () => {
    setIsLoading(true)
    createCaseOfficeAdmin(formData)
      .then(async(result) => {
          // console.log(result)
          openAlert('success', result.message || "success")
          await handleNotifyFromPPOfficeAdmin(result?.data?.CaseID)
          setFormData({
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
            photocopycaseDiaryExist: ''
          })
        
      })
      .catch((err) => {
        // console.log(err)
        openAlert('error', err || "An unexpected error occurred")
        setError(err || "An unexpected error occurred");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const handleConfirm = () => {
    closeAlert()
  }

  return (
    <main className="flex-1 p-6 relative w-full bg-cover bg-center h-screen">
      <CustomAlertDialog
            isOpen={isOpen}
            alertType={alertType}
            alertMessage={alertMessage}
            onClose={closeAlert}
            onConfirm={handleConfirm}
          />
      <div className="absolute inset-0 bg-black bg-opacity-40 -z-10"></div>

      <Card className="w-full max-w-2xl mx-auto bg-white/30 backdrop-blur-sm my-4 overflow-hidden">
        <CardHeader>
          <CardTitle>Add New Case</CardTitle>
        </CardHeader>
        <CardContent>
          
          <div className="flex flex-col gap-4">
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="CaseNumber">Case Number</Label>
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
                <Label htmlFor="CaseDate">Case Date</Label>
                <Input
                  icon={Calendar}
                  id="CaseDate"
                  name="CaseDate"
                  type="date"
                  value={formData.CaseDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="DistrictID">District</Label>
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
                <Label htmlFor="psID">Police Station</Label>
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
                <Label htmlFor="caseTypeID">Case Type</Label>
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
                <Label htmlFor="ref">Reference</Label>
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
                <Label htmlFor="ipcAct">IPC Act</Label>
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
                <Label htmlFor="hearingDate">Hearing Date</Label>
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
                <Label htmlFor="photocopycaseDiaryExist">Photocopy Case Diary Exists</Label>
                <Input
                  icon={Image}
                  id="photocopycaseDiaryExist"
                  name="photocopycaseDiaryExist"
                  type="number"
                  min="0"
                  max="1"
                  placeholder="0 or 1"
                  value={formData.photocopycaseDiaryExist}
                  onChange={handleChange}
                />
              </div>
            </div>
            <Button onClick={handleAddCase} className="w-full" disabled={isLoading}>
              {isLoading ? 'Adding Case...' : 'Add Case'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default AddCasePage

