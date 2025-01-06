'use client'

import React, { useState, useEffect } from 'react'
import { addCase } from '@/app/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar, FileText, Hash, MapPin, Bookmark, Book, Clock, Send, Copy, Image } from 'lucide-react'
import { decrypt } from '@/utils/crypto'

const AddCasePage = () => {
  const [user, setUser] = useState(null)
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
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [triggerAddCase, setTriggerAddCase] = useState(false)

  useEffect(() => {
    const encryptedUser = localStorage.getItem('user')
    if (encryptedUser) {
      const decoded_user = JSON.parse(decrypt(encryptedUser))
      setUser(decoded_user)
      setFormData(prevData => ({
        ...prevData,
        EntryUserID: decoded_user.AuthorityUserID
      }))
    }
  }, [])

  useEffect(() => {
    if (triggerAddCase) {
      setIsLoading(true)
      addCase(formData)
        .then((result) => {
          setMessage(result.message)
          if (result.status === 0) {
            setFormData({
              CaseNumber: '',
              EntryUserID: user ? user.AuthorityUserID : '',
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
          }
        })
        .catch((error) => {
          setMessage('Error adding case: ' + error.message)
        })
        .finally(() => {
          setIsLoading(false)
          setTriggerAddCase(false)
        })
    }
  }, [triggerAddCase, formData, user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddCase = () => {
    setTriggerAddCase(true)
  }

  return (
    <main className="flex-1 p-6 relative w-full bg-cover bg-center h-screen">
      <div className="absolute inset-0 bg-black bg-opacity-40 -z-10"></div>

      <Card className="w-full max-w-2xl mx-auto bg-white/30 backdrop-blur-sm my-4">
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
                <Label htmlFor="DistrictID">District ID</Label>
                <Input
                  icon={MapPin}
                  id="DistrictID"
                  name="DistrictID"
                  placeholder="Enter district ID"
                  value={formData.DistrictID}
                  onChange={handleChange}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="psID">PS ID</Label>
                <Input
                  icon={Bookmark}
                  id="psID"
                  name="psID"
                  placeholder="Enter PS ID"
                  value={formData.psID}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="caseTypeID">Case Type ID</Label>
                <Input
                  icon={FileText}
                  id="caseTypeID"
                  name="caseTypeID"
                  placeholder="Enter case type ID"
                  value={formData.caseTypeID}
                  onChange={handleChange}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="ref">Reference</Label>
                <Input
                  icon={Book}
                  id="ref"
                  name="ref"
                  placeholder="Enter reference"
                  value={formData.ref}
                  onChange={handleChange}
                />
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
                <Label htmlFor="sendTo">Send To</Label>
                <Input
                  icon={Send}
                  id="sendTo"
                  name="sendTo"
                  placeholder="Enter send to ID"
                  value={formData.sendTo}
                  onChange={handleChange}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="copyTo">Copy To</Label>
                <Input
                  icon={Copy}
                  id="copyTo"
                  name="copyTo"
                  placeholder="Enter copy to ID"
                  value={formData.copyTo}
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
          {message && <p className="mt-4 text-center text-green-600">{message}</p>}
        </CardContent>
      </Card>
    </main>
  )
}

export default AddCasePage

