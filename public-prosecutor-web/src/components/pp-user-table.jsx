'use client'
import { BASE_URL } from '@/app/constants'; 
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, Key, EyeOff, Eye } from 'lucide-react'
import { CustomAlertDialog } from './custom-alert-dialog'
import { useAlertDialog } from "@/hooks/useAlertDialog"

export default function PPUserTable() {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [newPassword, setNewPassword] = useState("")
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const itemsPerPage = 10

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await fetch(`${BASE_URL}getppuser?EntryuserID=2`, {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const result = await response.json()
      if (result.status === 0 && result.message === "Data found") {
        setUsers(result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (currentPage > Math.ceil(filteredUsers.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return
    try {
      const token = sessionStorage.getItem('token')
      const response = await fetch(`${BASE_URL}changepassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          userId: selectedUser.pp_id,
          newPassword
        })
      })
      const result = await response.json()
      if (response.ok) {
        openAlert('success', "Password Updated Successfully!");
      } else {
        throw new Error(result.message || 'Failed to reset password')
      }
    } catch (error) {
      alert(error.message)
    }
  }


  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleConfirm = () => {
    closeAlert()
    setIsPasswordResetDialogOpen(false)
    setNewPassword('')
    setSelectedUser(null)
    fetchData();
  }

  if (loading) return <div className="text-center py-10">Loading...</div>
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>

  return (
    <div className="container mx-auto py-10">
      <CustomAlertDialog
        isOpen={isOpen}
        alertType={alertType}
        alertMessage={alertMessage}
        onClose={closeAlert}
        onConfirm={handleConfirm}
      />
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div>
          <span className="mr-2 text-xs">Total Users: {filteredUsers.length}</span>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead className="font-bold">NAME</TableHead>
              <TableHead className="font-bold">USERNAME</TableHead>
              <TableHead className="font-bold">EMAIL</TableHead>
              <TableHead className="font-bold">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.pp_id}>
                <TableCell>{user.pp_name}</TableCell>
                <TableCell>{user.pp_username}</TableCell>
                <TableCell>{user.pp_email}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => {
                      setSelectedUser(user)
                      setIsPasswordResetDialogOpen(true)
                    }}
                  >
                    <Key /> Reset Password
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>

        <span>Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}</span>

        <Button
          variant="outline"
          disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password for {selectedUser?.pp_name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mb-4"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button className="w-full" onClick={handleResetPassword}>
            Reset Password
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
