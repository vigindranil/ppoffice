'use client'

import React, { useState } from 'react'
import { showSPUser } from '@/app/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const SPList = () => {
  const [spList, setSPList] = useState([])
  const [message, setMessage] = useState('')
  const [districtID, setDistrictID] = useState('')

  const fetchSPList = async () => {
    try {
      const result = await showSPUser(10, parseInt(districtID)) // Assuming EntryUserID is 10
      if (result.status === 0) {
        setSPList(result.data)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Error fetching SP list')
    }
  }

  const handleDistrictChange = (value) => {
    setDistrictID(value)
  }

  return (
    <main
      className="flex-1 p-6 relative w-full bg-cover bg-center h-screen"
      style={{ backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url('img/dash2.jpg')" }} 
    >

      {/* Overlay for Background Image */}
      <div className="absolute inset-0 bg-black bg-opacity-40 -z-10"></div>

      <Card className="w-full max-w-3xl mx-auto bg-white/30 backdrop-blur-sm my-4">
        <CardHeader>
          <CardTitle>SP List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Select onValueChange={handleDistrictChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">District 6</SelectItem>
                {/* Add more districts as needed */}
              </SelectContent>
            </Select>
            <Button onClick={fetchSPList}>Search</Button>
          </div>
          {message && <p className="text-red-600 mb-4">{message}</p>}
          {spList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>WBP ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spList.map((sp) => (
                  <TableRow key={sp.sp_id}>
                    <TableCell>{sp.sp_id}</TableCell>
                    <TableCell>{sp.sp_name}</TableCell>
                    <TableCell>{sp.sp_username}</TableCell>
                    <TableCell>{sp.sp_email}</TableCell>
                    <TableCell>{sp.sp_contactnumber}</TableCell>
                    <TableCell>{sp.sp_WbpId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No SP users found for the given District ID.</p>
          )}
        </CardContent>
      </Card>

    </main>
  )
}

export default SPList

