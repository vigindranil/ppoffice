'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await axios.post('http://localhost:8000/api/authenticate', {
        username: formData.username,
        password: formData.password,
      })

      if (response.data.status === 0 && response.data.message === "Data found") {
        localStorage.setItem('authToken', response.data.access_token)

        const userData = response.data.data[0]
        sessionStorage.setItem('AuthorityUserID', userData.AuthorityUserID)
        sessionStorage.setItem('AuthorityTypeID', userData.AuthorityTypeID)
        sessionStorage.setItem('AuthorityName', userData.AuthorityName || userData.StaffName || 'Unknown')
        sessionStorage.setItem('BoundaryID', userData.BoundaryID || 'Unknown')

        console.log("AuthorityUserID stored in sessionStorage:", userData.AuthorityUserID)
        console.log("AuthorityName stored in sessionStorage:", userData.AuthorityName || userData.StaffName || 'Unknown')
        console.log("BoundaryID stored in sessionStorage:", userData.BoundaryID || 'Unknown')
        console.log("Full response data:", JSON.stringify(response.data, null, 2))
        console.log("Navigating with AuthorityTypeID:", userData.AuthorityTypeID)

        switch (parseInt(userData.AuthorityTypeID)) {
          case 20:
            router.push('/ppoadmin')
            break
          case 10:
            router.push('/ppostaff')
            break
          case 30:
            router.push('/SPCPDashboard')
            break
          case 50:
            router.push('/psdash')
            break
          case 100:
            router.push('/dashboard')
            break
          default:
            console.log("Unknown AuthorityTypeID:", userData.AuthorityTypeID)
            router.push('/login')
        }
      } else {
        setErrorMessage('Invalid credentials. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(prevState => !prevState)
  }

  return (
    
    <div className="relative bg-cover bg-center bg-[url('/img/ppoimage.jpg?height=1080&width=1920')]">
        {/* Gradient and Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">

        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl z-10">
            <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            </CardHeader>
            <CardContent>
            {errorMessage && (
                <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
                />

                <div className="relative">
                <Input
                    type={passwordVisible ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={togglePasswordVisibility}
                >
                    {passwordVisible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
                </div>

                <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                >
                {isLoading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
            </CardContent>
        </Card>
       </div>
    </div>
  )
}

