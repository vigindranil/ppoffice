'use client'

import React, { useState, useEffect } from 'react'
import { showPPOfficeHeadUserList } from '@/app/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PPHeadList = () => {
  const [headList, setHeadList] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchHeadList()
  }, [])

  const fetchHeadList = async () => {
    try {
      const result = await showPPOfficeHeadUserList(10) // Assuming EntryUserID is 10
      if (result.status === 0) {
        setHeadList(result.data)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Error fetching PP Head list')
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
          <CardTitle>PP Head List</CardTitle>
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
              {headList.map((head) => (
                <TableRow key={head.ppHead_id}>
                  <TableCell>{head.ppHead_id}</TableCell>
                  <TableCell>{head.ppHeaduser_name}</TableCell>
                  <TableCell>{head.ppHeaduser_username}</TableCell>
                  <TableCell>{head.ppHeadpuser_email}</TableCell>
                  <TableCell>{head.ppHeaduser_contactnumber}</TableCell>
                  <TableCell>{head.ppHeaduser_licensenumber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}

export default PPHeadList

