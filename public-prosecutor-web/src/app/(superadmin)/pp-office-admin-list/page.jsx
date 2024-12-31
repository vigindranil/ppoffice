'use client'

import React, { useState, useEffect } from 'react'
import { showPPOfficeAdminUserList } from '../api/get_admin_user'
import Layout from '../../components/Layout'
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
    <Layout>
      <Card className="w-full bg-white/30 backdrop-blur-sm">
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
    </Layout>
  )
}

export default PPOfficeAdminList

