'use client'
import { BASE_URL } from '@/app/constants'; 
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, Clock, CheckCircle, ArrowRight, LoaderCircle } from 'lucide-react'
import { decrypt } from '@/utils/crypto'
import { useSelector } from 'react-redux'

const generateRandomColor = () => {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 80%, 80%)`
  // return `hsl(${hue}, 80%, 60%)`
}

const generateGradient = () => {
  const color1 = generateRandomColor()
  const color2 = generateRandomColor()
  return `linear-gradient(135deg, ${color1}, ${color2})`
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function DashboardCards() {
  const userDetails = useSelector((state) => state.auth.user)
  const [error, setError] = useState(null)
  const [user, setUser] = useState("")
  const [psData, setPsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [gradients, setGradients] = useState([])

  const fetchPsDetails = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await fetch(`${BASE_URL}count-by-ps?districtId=${user?.BoundaryID}`, {
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
        setGradients(result.data.map(() => generateGradient()))
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
    const decoded_user = JSON.parse(decrypt(userDetails))
    setUser(decoded_user)
  }, [userDetails])

  useEffect(() => {
    user && fetchPsDetails()
  }, [user])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoaderCircle className='animate-spin text-primary w-12 h-12' />
    </div>
  )
  
  if (error) return (
    <div className="text-center py-10 text-red-500 font-bold">
      Error: {error}
    </div>
  )

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {psData.map((card, index) => (
        <Link key={index} href={`/ro-ps-wise-cases/${card.PoliceStationID}`} className="block">
        <motion.div
          key={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card
            className="relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            style={{ background: gradients[index] }}
          >
            <div className="absolute inset-0 opacity-90 dark:opacity-80" />
            
            <CardHeader className="relative z-20">
              <CardTitle className="text-lg font-bold tracking-tight">{card.PoliceStation}</CardTitle>
              <Building className="absolute top-4 right-4 h-6 w-6 opacity-50" />
            </CardHeader>
            <CardContent className="relative z-20">
              <p className="text-sm font-medium mb-1">Number of cases</p>
              <div className="text-4xl font-extrabold mb-4">{card.CaseCount}</div>
              {/* <div className="flex items-center pt-2 text-sm font-semibold">
                <span>View details</span>
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div> */}
            </CardContent>
            <div className="absolute bottom-0 right-0 w-32 h-32 -mr-16 -mb-16 rounded-full bg-white opacity-10 z-10" />
            <div className="absolute top-0 left-0 w-20 h-20 -ml-10 -mt-10 rounded-full bg-white opacity-10 z-10" />
          </Card>
        </motion.div>
        </Link>
      ))}
    </div>
  )
}


