'use client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, Clock, CheckCircle, ArrowRight, LoaderCircle } from 'lucide-react'
import { decrypt } from '@/utils/crypto'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

const cardData = [
  {
    title: "Total Cases",
    subtitle: "All cases in the system",
    value: "36",
    icon: Building,
    color: "#3b82f6", // blue-500
    link: "/pp-head-total-cases"
  },
  {
    title: "Pending Cases",
    subtitle: "Cases awaiting action",
    value: "8",
    icon: Clock,
    color: "#eab308", // yellow-500
    link: "/pp-head-pending-cases"
  },
  {
    title: "Assigned Cases",
    subtitle: "Cases currently in progress",
    value: "28",
    icon: CheckCircle,
    color: "#22c55e", // green-500
    link: "/pp-head-assigned-cases"
  }
]

  

export default function DashboardCards() {
  const userDetails = useSelector((state) => state.auth.user);
  const [error, setError] = useState(null)
  const [user, setUser] = useState("");
  const [psData, setPsData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPsDetails = async () => {
    try {
      console.log(`http://localhost:8000/api/showpoliceBydistrict?districtId=${user?.BoundaryID}`);
      
      const token = sessionStorage.getItem('token')
      const response = await fetch(`http://localhost:8000/api/showpoliceBydistrict?districtId=${user?.BoundaryID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch ps')
      }
      const result = await response.json()
      if (result.status === 0) {
        setPsData(result.data)
        setError(null)
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

    useEffect(() => {
      const decoded_user = JSON.parse(decrypt(userDetails));
      setUser(decoded_user);
    }, [userDetails]);
  
    useEffect(() => {
      user && fetchPsDetails()
    }, [user])

  if (loading) return <div className="text-center py-10"><LoaderCircle className='animate-spin mx-auto' /></div>
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>
  return (
    (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {psData.map((card, index) => (
        <Card
          key={index}
          className="relative shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4"
          style={{ borderLeftColor: '#cdd5da' }}>
          <Link href={`/ps-wise-cases/${card.id}`} className="absolute inset-0 z-10">
            <span className="sr-only">View {card.ps_name}</span>
          </Link>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.ps_name}</CardTitle>
            <Building className="h-4 w-4" style={{ color: '#a8b2b8' }} />
          </CardHeader>
          <CardContent>
            <div className="flex items-center pt-4 group" style={{ color: '#3b82f6' }}>
              <span className="text-sm">View details</span>
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>)
  );
}

