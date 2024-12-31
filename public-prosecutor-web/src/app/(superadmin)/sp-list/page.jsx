'use client'

import React, { useState } from 'react'
import { showSPUser } from '../api/get_sp_user'
import Layout from '../../components/Layout'
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
    <Layout>
      <Card className="w-full bg-white/30 backdrop-blur-sm">
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
    </Layout>
  )
}

export default SPList

