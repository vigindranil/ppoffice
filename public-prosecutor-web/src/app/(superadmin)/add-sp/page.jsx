'use client'

import React, { useEffect, useState } from 'react'
import { addSP , alldistrict } from '@/app/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { decrypt } from '@/utils/crypto'

const AddSP = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [user, setUser] = useState(null)
  const encryptedUser = useSelector((state) => state.auth.user)
  const [allDistrictList, setAllDistrictList] = useState([])
  const [formData, setFormData] = useState({
    Username: '',
    UserPassword: '',
    EntryUserID: 10,
    FullName: '',
    ContractNo: '',
    Email: '',
    LicenseNumber: '',
    DistrictID: ''
  })
  const [message, setMessage] = useState('')

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

      alldistrict()
        .then((result) => {
          setAllDistrictList(result);
        })
        .catch((err) => {
          openAlert('error', err?.message || "An unexpected error occurred");
        });
    }
  }, [user]);

  const handleSelectChange = (name, value) => {
    setFormData(prevState => {
      const newState = { ...prevState, [name]: value };
      return newState;
    });
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await addSP(formData)
      setMessage(result.message)
      if (result.status === 0) {
        setFormData({
          Username: '',
          UserPassword: '',
          EntryUserID: 10,
          FullName: '',
          ContractNo: '',
          Email: '',
          LicenseNumber: '',
          DistrictID: ''
        })
      }
    } catch (error) {
      setMessage('Error adding SP')
    }
  }

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
          <CardHeader className="mb-5">
            <CardTitle>Superintendent of Police</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="Username">Username</Label>
                  <Input
                    id="Username"
                    name="Username"
                    placeholder="Enter username"
                    value={formData.Username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="UserPassword">Password</Label>
                  <Input
                    id="UserPassword"
                    name="UserPassword"
                    placeholder="Enter password"
                    type="password"
                    value={formData.UserPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="FullName">Full Name</Label>
                  <Input
                    id="FullName"
                    name="FullName"
                    placeholder="Enter your full name"
                    value={formData.FullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="ContractNo">Contact Number</Label>
                  <Input
                    id="ContractNo"
                    name="ContractNo"
                    placeholder="Enter contact number"
                    type="tel"
                    value={formData.ContractNo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="Email">Email</Label>
                  <Input
                    id="Email"
                    name="Email"
                    placeholder="Enter e-mail address"
                    type="email"
                    value={formData.Email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-bold" htmlFor="LicenseNumber">License Number</Label>
                  <Input
                    id="LicenseNumber"
                    name="LicenseNumber"
                    placeholder="Enter license number"
                    value={formData.LicenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2 space-y-2">
                  <Label className="font-bold" htmlFor="DistrictID">District ID</Label>
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
              </div>
              <Button type="submit" className="max-w-min mx-auto mt-10 mb-5 bg-blue-500">Add SP</Button>
            </form>
            {message && <p className="mt-4 text-center text-green-600">{message}</p>}
          </CardContent>
        </Card>

      </main>
    </div>
  )
}

export default AddSP

