'use client'

import React, { useEffect, useState } from 'react'
import { addPPUser } from '@/app/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User, Lock, CircleUser, Phone, Mail, CreditCard } from 'lucide-react';
import { useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'

const Page = () => {
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(userDetails));
    setUser(decoded_user);
  }, [userDetails]);

  const [formData, setFormData] = useState({
    Username: '',
    UserPassword: '',
    EntryUserID: '',
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
      const result = await addPPUser({...formData, 'EntryUserID': user?.AuthorityUserID})
      setMessage(result.message)
      if (result.status === 0) {
        
        setFormData({
          Username: '',
          UserPassword: '',
          EntryUserID: '',
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
    <Card className="w-full max-w-md mx-auto h-full bg-white/30 backdrop-blur-sm my-4">
      <CardHeader>
        <CardTitle>Add PP User</CardTitle>
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
                placeholder="Enter your full name"
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
                placeholder="Enter your contact number"
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
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
                placeholder="Enter your email address"
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
                placeholder="Enter your license number"
                value={formData.LicenseNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">Add PP User</Button>
        </form>
        {message && <p className="mt-4 text-center text-red-600">{message}</p>}
      </CardContent>
    </Card>
  )
}

export default Page

