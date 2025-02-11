"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSelector } from "react-redux"
import { decrypt } from "@/utils/crypto"
import EmailList from "@/components/EmailList"

export default function ProfilePage() {
  const [emailDetails, setEmailDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const userDetails = useSelector((state) => state.auth.user)

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(userDetails))
    setUser(decoded_user)
  }, [userDetails])

  const loadEmailDetails = async (authorityTypeId, boundaryId) => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem("token")
      const response = await fetch("http://localhost:8000/api/emailDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ authorityTypeId, boundaryId }),
      })

      const data = await response.json()
      if (response.ok) {
        setEmailDetails(data.data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    user && loadEmailDetails(user?.AuthorityTypeID, user?.BoundaryID)
  }, [user])

  const handleEmailRead = async (email) => {
    try {
      const token = sessionStorage.getItem("token")
      const response = await fetch("http://localhost:8000/api/emailRead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          mailId: email.id,
          caseId: email.caseID,
          authorityTypeId: user?.AuthorityTypeID,
          boundaryId: user?.BoundaryID
        }),
      })

      const data = await response.json()
      if (response.ok) {
        loadEmailDetails(user?.AuthorityTypeID, user?.BoundaryID)
      } else {
        // console.log(data.message)
      }
    } catch (err) {
      setError("An error occurred")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-[200px] mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full max-w-3xl mx-auto text-center p-6">
          <p className="text-red-500">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <Card className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl">
        <CardContent className="p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Email Notifications</h2>
          {emailDetails && emailDetails.length > 0 ? (
            <EmailList emails={emailDetails} onReadEmail={handleEmailRead} />
          ) : (
            <p className="text-center text-gray-500">No email notifications available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

