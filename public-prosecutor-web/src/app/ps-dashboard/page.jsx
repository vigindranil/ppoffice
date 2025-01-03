'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Calendar, FileText, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Profile from "@/components/Profile";

const PoliceDashboard = () => {
  const [userId, setUserId] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    // Simulating user login
    // In a real application, you would get this from your authentication system
    setUserId(54)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Police Station Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </Button>
            <Avatar onClick={() => setShowProfile(!showProfile)}>
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>PO</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        {showProfile ? (
          <Profile userId={userId} />
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ongoing Cases</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Hearings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Closed Cases</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Cases */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recent Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-4">Case Number</th>
                      <th className="pb-4">Hearing Date</th>
                      <th className="pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">CRM(DB)-123/24</td>
                      <td className="py-2">March 15, 2024</td>
                      <td className="py-2"><span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Ongoing</span></td>
                    </tr>
                    <tr>
                      <td className="py-2">CRR-456/24</td>
                      <td className="py-2">March 18, 2024</td>
                      <td className="py-2"><span className="bg-green-200 text-green-800 px-2 py-1 rounded">Upcoming</span></td>
                    </tr>
                    <tr>
                      <td className="py-2">CRA(SB)-789/24</td>
                      <td className="py-2">March 20, 2024</td>
                      <td className="py-2"><span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Ongoing</span></td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <span>Hearing for CRM(DB)-123/24 scheduled tomorrow</span>
                    <span className="text-sm text-gray-500">March 14, 2024</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>New case CRR-456/24 assigned to your station</span>
                    <span className="text-sm text-gray-500">March 13, 2024</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}

export default PoliceDashboard
