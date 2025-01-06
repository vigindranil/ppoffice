'use client'

import React, { useState } from 'react'
import { addSP } from '@/app/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const AddSP = () => {
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

  return (
    <main
      className="flex-1 p-6 relative w-full bg-cover bg-center h-screen"
      style={{ backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url('img/dash2.jpg')" }} 
    >

      {/* Overlay for Background Image */}
      <div className="absolute inset-0 bg-black bg-opacity-40 -z-10"></div>

      <Card className="w-full max-w-md mx-auto bg-white/30 backdrop-blur-sm my-4">
        <CardHeader>
          <CardTitle>Add SP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="Username">Username</Label>
                <Input
                  id="Username"
                  name="Username"
                  placeholder="Enter username"
                  value={formData.Username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="UserPassword">Password</Label>
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
                <Label htmlFor="FullName">Full Name</Label>
                <Input
                  id="FullName"
                  name="FullName"
                  placeholder="Enter your full name"
                  value={formData.FullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ContractNo">Contact Number</Label>
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
                <Label htmlFor="Email">Email</Label>
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
              <div className="space-y-2">
                <Label htmlFor="LicenseNumber">License Number</Label>
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
              <div className="flex-1 space-y-2">
                <Label htmlFor="DistrictID">District ID</Label>
                <Input
                  id="DistrictID"
                  name="DistrictID"
                  type="number"
                  placeholder="Enter district id"
                  value={formData.DistrictID}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Add SP</Button>
          </form>
          {message && <p className="mt-4 text-center text-green-600">{message}</p>}
        </CardContent>
      </Card>

    </main>
  )
}

export default AddSP

