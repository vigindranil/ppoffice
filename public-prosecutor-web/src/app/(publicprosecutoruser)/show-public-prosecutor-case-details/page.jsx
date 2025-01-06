'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ClipboardPlus, LoaderCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"


export default function CaseTable() {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [selectedCase, setSelectedCase] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const casesPerPage = 10
  const [allCases, setAllCases] = useState([])
  const [ppUsers, setPPUsers] = useState(null)
  const [selectedPPUser, setSelectedPPUser] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(userDetails));
    setUser(decoded_user);
  }, [userDetails]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const indexOfLastCase = currentPage * casesPerPage
  const indexOfFirstCase = indexOfLastCase - casesPerPage
  const currentCases = allCases.slice(indexOfFirstCase, indexOfLastCase)

  const totalPages = Math.ceil(allCases.length / casesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const fetchPPUsers = async () => {
    try {
      const token = sessionStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/caseDetailsByPPuserId?ppuserID=59', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch Case Details')
      }
      const result = await response.json()
      if (result.status === 0) {
        setPPUsers(result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch Case Details')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

   const handleAssignCasetoPPUser = async () => {
    // try {
    //   const token = sessionStorage.getItem('token')
    //   const response = await fetch('http://localhost:8000/api/assigncase', {
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //       'Content-Type': 'application/json'
    //     },
    //     method: 'POST',
    //     body: JSON.stringify({
    //       "PPUserID": selectedPPUser,
    //       "EntryUserID": user?.AuthorityUserID,
    //       "CaseID": selectedCase?.CaseId
    //   }),
        
    //   })
    //   if (!response.ok) {
    //     throw new Error('Failed to assign case')
    //   }
    //   const result = await response.json()
    //   if (result.status === 0) {
    //     setPPUsers(result.data)
    //   } else {
    //     throw new Error(result.message)
    //   }
    // } catch (err) {
    //   setError(err instanceof Error ? err.message : 'An error occurred')
    // } finally {
    //   setLoading(false)
    // }
    openAlert('success', 'This is an informational message. Please read it carefully.')
  }

  const handleConfirm = () => {
    closeAlert()
  }

  const showallCaseBetweenRange = async (start, end) => {

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/showallCaseBetweenRange', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "startDate": start,
          "endDate": end
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const result = await response.json()
      if (result.status === 0) {
        setAllCases(result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    showallCaseBetweenRange(null, null)
    fetchPPUsers()
  }, [])

  if (loading) return <div className="text-center py-10"><LoaderCircle className='animate-spin mx-auto' /></div>
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>

  return (
    <div className="relative min-h-screen w-full">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
          <main className="relative flex-1 p-6 w-full min-h-screen">
            <Card className="w-full max-w-3xl mx-auto bg-white/60 backdrop-blur-sm my-4">
              <CardHeader>
                <CardTitle>Public Prosecutor Case Details</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center">Loading...</p>
                ) : (
      <div className="container mx-auto py-10">
        <CustomAlertDialog 
          isOpen={isOpen}
          alertType={alertType}
          alertMessage={alertMessage}
          onClose={closeAlert}
          onConfirm={handleConfirm}
        />
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead className="font-bold">PP User Name</TableHead>
              <TableHead className="font-bold">Case Number</TableHead>
              <TableHead className="font-bold">SP Name</TableHead>
              <TableHead className="font-bold">PS Name</TableHead>
              <TableHead className="font-bold">Case Date</TableHead>
              <TableHead className="font-bold">Case Type</TableHead>
              <TableHead className="font-bold">Case Hearing Date</TableHead>
              <TableHead className="font-bold">IPC Section</TableHead>
              <TableHead className="font-bold">Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCases.map((caseItem, index) => (
              <TableRow key={index}>
                <TableCell>{caseItem.PPuserName}</TableCell>
                <TableCell>{caseItem.CaseNumber}</TableCell>
                <TableCell>{caseItem.SpName}</TableCell>
                <TableCell>{caseItem.PsName}</TableCell>
                <TableCell>{formatDate(caseItem.CaseDate)}</TableCell>
                <TableCell>{caseItem.CaseType}</TableCell>
                <TableCell>{formatDate(caseItem.CaseHearingDate)}</TableCell>
                <TableCell>{caseItem.IPCSection}</TableCell>
                <TableCell>{caseItem.BeginReferenceName}</TableCell>
                {/* <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className=""
                        onClick={() => setSelectedCase(caseItem)}
                      >
                        <ClipboardPlus /> Assign Case
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Assign Case</DialogTitle>
                      </DialogHeader>
                      <Card>
                        <CardHeader>
                          <CardTitle>Case Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedCase && (
                            <>
                              <div className="space-y-2">
                                <p><strong>PP User Name:</strong> {selectedCase.PPuserName}</p>
                                <p><strong>Case Number:</strong> {selectedCase.CaseNumber}</p>
                                <p><strong>SP Name:</strong> {selectedCase.SpName}</p>
                                <p><strong>PS Name:</strong> {selectedCase.PsName}</p>
                                <p><strong>Case Date:</strong> {formatDate(selectedCase.CaseDate)}</p>
                                <p><strong>Case Type:</strong> {selectedCase.CaseType}</p>
                                <p><strong>Case Hearing Date:</strong> {formatDate(selectedCase.CaseHearingDate)}</p>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                      <div className="space-y-2">
                        <label htmlFor="pp-user-select" className="block text-sm font-medium text-gray-700">
                          Assign to PP User
                        </label>
                        <Select onValueChange={setSelectedPPUser} value={selectedPPUser}>
                          <SelectTrigger id="pp-user-select">
                            <SelectValue placeholder="Select a PP user" />
                          </SelectTrigger>
                          <SelectContent>
                            {ppUsers?.map((user) => (
                              <SelectItem key={user.pp_id} value={user.pp_id.toString()}>
                                {user.pp_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={()=>handleAssignCasetoPPUser()} className="bg-blue-500 hover:bg-blue-600">Assign</Button>
                    </DialogContent>
                  </Dialog>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => paginate(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    )}
              </CardContent>
            </Card>
          </main>
        </div>
  )
}

