'use client'

import React, { useState } from 'react'
import { addSP } from '../api/create_sp_user'
import Layout from '../../components/Layout'
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
    <Layout>
      <Card className="w-full max-w-md mx-auto bg-white/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Add SP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="Username">Username</Label>
              <Input
                id="Username"
                name="Username"
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
                type="password"
                value={formData.UserPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="FullName">Full Name</Label>
              <Input
                id="FullName"
                name="FullName"
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
                type="tel"
                value={formData.ContractNo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Email">Email</Label>
              <Input
                id="Email"
                name="Email"
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
                value={formData.LicenseNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="DistrictID">District ID</Label>
              <Input
                id="DistrictID"
                name="DistrictID"
                type="number"
                value={formData.DistrictID}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full">Add SP</Button>
          </form>
          {message && <p className="mt-4 text-center text-green-600">{message}</p>}
        </CardContent>
      </Card>
    </Layout>
  )
}

export default AddSP

