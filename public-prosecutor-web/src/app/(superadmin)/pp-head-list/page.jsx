'use client'

import React, { useState, useEffect } from 'react'
import { showPPOfficeHeadUserList } from '../api/get_head_user'
import Layout from '../../components/Layout'
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
    <Layout>
      <Card className="w-full bg-white/30 backdrop-blur-sm">
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
    </Layout>
  )
}

export default PPHeadList

