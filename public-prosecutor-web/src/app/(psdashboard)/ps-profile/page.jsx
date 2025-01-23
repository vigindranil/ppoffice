'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchUserProfile } from '@/app/api'
import { decrypt } from '@/utils/crypto'
import { useSelector } from 'react-redux'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState("");
  const userDetails = useSelector((state) => state.auth.user);

   useEffect(() => {
      const decoded_user = JSON.parse(decrypt(userDetails));
      setUser(decoded_user);
    }, [userDetails]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      try {
        const userData = await fetchUserProfile(user?.AuthorityUserID)
        console.log(userData);
        
        setProfile(userData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    user &&loadProfile()
  }, [user])

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-12 w-[250px]" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-4 w-[220px]" />
              <Skeleton className="h-4 w-[190px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-3xl mx-auto bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <Avatar className="h-20 w-20">
            {/* <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${profile.ps_name}`} alt={profile.ps_name} /> */}
            <AvatarFallback>{profile.ps_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{profile.ps_name}</CardTitle>
            <Badge variant="outline" className="mt-1">{profile.WBP_ID}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.ps_username}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.ps_email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.ps_contactnumber}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">PS</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.ps_name}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
