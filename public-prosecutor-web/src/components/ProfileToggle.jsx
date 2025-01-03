'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Profile from './Profile'
import { Button } from "@/components/ui/button"
import { User } from 'lucide-react'

export default function ProfileToggle() {
  const [showProfile, setShowProfile] = useState(false)
  const [userId] = useState(54) // Simulating a logged-in user

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="p-2"
        onClick={() => setShowProfile(!showProfile)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder-user.jpg" alt="User" />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </Button>
      {showProfile && (
        <div className="absolute right-0 mt-2 w-64 z-10">
          <Profile userId={userId} />
        </div>
      )}
    </div>
  )
}

