"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { LogOut, ChevronsUpDown, KeyRound } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { decrypt } from "@/utils/crypto"

export function UserAvatarDropdown() {
  const router = useRouter()
  const encryptedUser = useSelector((state) => state.auth.user)
  const [user, setUser] = useState({ name: '', email: '', org: '' })

  useEffect(() => {
    if (encryptedUser) {
      try {
        const decryptedUser = JSON.parse(decrypt(encryptedUser))
        setUser({
          name: decryptedUser.AuthorityName || 'User',
          email: decryptedUser.EmailID || 'No email provided',
          org: decryptedUser.BoundaryName || 'No Organisation provided'
        })
      } catch (error) {
        console.error('Error decrypting user data:', error)
      }
    }
  }, [encryptedUser])

  const handleLogout = () => {
    router.push('/logout')
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/img/user.png" alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.org}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleChangePassword} className="cursor-pointer">
          <KeyRound className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

