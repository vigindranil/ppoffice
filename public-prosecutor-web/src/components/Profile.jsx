'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Profile = ({ userId }) => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ PSUserId: userId }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const result = await response.json()
        if (result.status === 0 && result.data.length > 0) {
          setUserData(result.data[0])
        } else {
          throw new Error('User data not found')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!userData) return <div>No user data found</div>

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder-user.jpg" alt={userData.ps_name} />
            <AvatarFallback>{userData.ps_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{userData.ps_name}</h2>
            <p className="text-gray-500">{userData.ps_username}</p>
          </div>
        </div>
        <div>
          <p><strong>Email:</strong> {userData.ps_email}</p>
          <p><strong>Contact Number:</strong> {userData.ps_contactnumber}</p>
          <p><strong>WBP ID:</strong> {userData.WBP_ID}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default Profile
