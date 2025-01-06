'use client'

import React, { useState, useEffect } from 'react'
import { showPPOfficeHeadUserList } from '@/app/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch, useSelector } from 'react-redux'

const PPHeadList = () => {
  const [headList, setHeadList] = useState([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const dispatch = useDispatch()
  const encryptedUser = useSelector((state) => state.auth.user)
  const token = useSelector((state) => state.auth.token)

  useEffect(() => {
    console.log('Encrypted User from Redux:', encryptedUser)
    console.log('Token from Redux:', token)
    if (token && encryptedUser) {
      fetchHeadList()
    } else {
      setIsLoading(false)
      setMessage('Authentication information not found. Please log in again.')
    }
  }, [token, encryptedUser])

  const fetchHeadList = async () => {
    setIsLoading(true)
    try {
      const result = await dispatch(showPPOfficeHeadUserList(encryptedUser))
      
      if (result.status === 0) {
        setHeadList(result.data)
      } else {
        setMessage(result.message || 'Error fetching PP Head list')
      }
    } catch (error) {
      console.error('Error fetching PP Head list:', error)
      setMessage('Error fetching PP Head list')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <Card className="w-full max-w-3xl mx-auto bg-white/60 backdrop-blur-sm my-4">
          <CardHeader>
            <CardTitle>PP Head List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center">Loading...</p>
            ) : message ? (
              <p className="text-red-600 mb-4 text-center">{message}</p>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default PPHeadList



