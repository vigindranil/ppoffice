'use client'

import React, { useState, useEffect } from 'react'
import { showPPOfficeAdminUserList } from '@/app/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PPOfficeAdminList = () => {
  const [adminList, setAdminList] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAdminList()
  }, [])

  const fetchAdminList = async () => {
    try {
      const result = await showPPOfficeAdminUserList(10) // Assuming EntryUserID is 10
      if (result.status === 0) {
        setAdminList(result.data)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Error fetching PP Office Admin list')
    }
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
          <CardTitle>PP Office Admin List</CardTitle>
        </CardHeader>
        <CardContent>
          {message && <p className="text-red-600 mb-4">{message}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>License Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminList.map((admin) => (
                <TableRow key={admin.ppadmin_id}>
                  <TableCell>{admin.ppadmin_id}</TableCell>
                  <TableCell>{admin.ppadmin_name}</TableCell>
                  <TableCell>{admin.ppadmin_username}</TableCell>
                  <TableCell>{admin.ppadmin_email}</TableCell>
                  <TableCell>{admin.ppadmin_contactnumber}</TableCell>
                  <TableCell>{admin.ppadmin_licensenumber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </main>
  )
}

export default PPOfficeAdminList

