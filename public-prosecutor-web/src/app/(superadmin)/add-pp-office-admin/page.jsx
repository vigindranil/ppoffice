'use client'

import React, { useState } from 'react'
import { addPPOfficeAdmin } from '@/app/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const AddPPOfficeAdmin = () => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [formData, setFormData] = useState({
    Username: '',
    UserPassword: '',
    EntryUserID: 10,
    FullName: '',
    ContractNo: '',
    Email: '',
    LicenseNumber: ''
  })
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await addPPOfficeAdmin(formData)
      setMessage(result.message)
      if (result.status === 0) {
        setFormData({
          Username: '',
          UserPassword: '',
          EntryUserID: 10,
          FullName: '',
          ContractNo: '',
          Email: '',
          LicenseNumber: ''
        })
      }
    } catch (error) {
      setMessage('Error adding PP Office Admin')
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
            <CardTitle>Add Public Prosecutor Office Admin</CardTitle>
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
              <Button type="submit" className="max-w-min mx-auto mt-10 mb-5 bg-blue-500">Add PP Office Admin</Button>
            </form>
            {message && <p className="mt-4 text-center text-green-600">{message}</p>}
          </CardContent>
        </Card>

      </main>
    </div>
  )
}

export default AddPPOfficeAdmin

