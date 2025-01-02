'use client'

import React, { useState } from 'react'
import { addPPHead } from '@/app/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User, Lock, CircleUser, Phone, Mail, CreditCard } from 'lucide-react';

const Page = () => {
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
      const result = await addPPHead(formData)
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
      setMessage('Error adding PP Head')
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
          <CardTitle>Add PP Head</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="FullName">Full Name</Label>
                <Input
                  icon={CircleUser}
                  id="FullName"
                  name="FullName"
                  placeholder="Enter full name"
                  value={formData.FullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="ContractNo">Contact Number</Label>
                <Input
                  icon={Phone}
                  id="ContractNo"
                  name="ContractNo"
                  type="tel"
                  placeholder="Enter contact number"
                  value={formData.ContractNo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="Username">Username</Label>
                <Input
                  icon={User}
                  id="Username"
                  name="Username"
                  placeholder="Enter username"
                  value={formData.Username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="UserPassword">Password</Label>
                <Input
                  icon={Lock}
                  id="UserPassword"
                  name="UserPassword"
                  type="password"
                  placeholder="Enter password"
                  value={formData.UserPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="Email">Email</Label>
                <Input
                  icon={Mail}
                  id="Email"
                  name="Email"
                  type="email"
                  placeholder="Enter e-mail address"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="LicenseNumber">License Number</Label>
                <Input
                  icon={CreditCard}
                  id="LicenseNumber"
                  name="LicenseNumber"
                  placeholder="Enter license number"
                  value={formData.LicenseNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Add PP Head</Button>
          </form>
          {message && <p className="mt-4 text-center text-green-600">{message}</p>}
        </CardContent>
      </Card>

    </main>
  )
}

export default Page

