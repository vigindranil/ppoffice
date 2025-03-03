'use client'
import { BASE_URL } from '@/app/constants'
import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Calendar, ClipboardPlus, Edit, Eye, LoaderCircle, Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { Input } from './ui/input'
import { DatePicker } from './date-picker'
import { Badge } from './ui/badge'
import { Label } from "@/components/ui/label"


export default function CaseTable() {
  const router = useRouter();
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [selectedCase, setSelectedCase] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const casesPerPage = 10
  const [allCases, setAllCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");
  const [searchTerm, setSearchTerm] = useState('')
  const [isCaseSelected, setIsCaseSelected] = useState(false)
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);

    // Format as "yyyy-mm-dd"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const handleConfirm = () => {
    closeAlert()
    showallCaseBetweenRange(null, null)
    setSelectedCase(null)
    setIsCaseSelected(false)
  }

  const showallCaseBetweenRange = async (start, end) => {

    try {
      setLoading(true)
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}showallCaseBetweenRange`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "startDate": formatDate(start),
          "endDate": formatDate(end),
          "isAssign": 2
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
    const decoded_user = JSON.parse(decrypt(userDetails));
    setUser(decoded_user);
  }, [userDetails]);

  useEffect(() => {
    showallCaseBetweenRange(null, null)
  }, [])

  const filteredData = allCases?.filter((data) =>
    Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  )

  const indexOfLastCase = currentPage * casesPerPage
  const indexOfFirstCase = indexOfLastCase - casesPerPage
  const currentCases = filteredData?.slice(indexOfFirstCase, indexOfLastCase)

  const totalPages = Math.ceil(filteredData?.length / casesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) return <div className="text-center py-10"><LoaderCircle className='animate-spin mx-auto' /></div>
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>

  return (
    <div className="relative flex bg-gray-100 h-full min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <CustomAlertDialog
            isOpen={isOpen}
            alertType={alertType}
            alertMessage={alertMessage}
            onClose={closeAlert}
            onConfirm={handleConfirm}
          />
          <div className="container mx-auto px-6 py-8 w-full">
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden px-4">
            <div className="bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3">
              <h2 className="text-2xl font-bold text-white">Cases</h2>
            </div>
            <div className="container mx-auto py-10">

              <div className='flex gap-4 mb-3'>
                {/* <DatePicker date={fromDate ? formatDate(fromDate) : null} setDate={setFromDate} placeholder="From (Date Range)" />
                <DatePicker date={toDate ? formatDate(toDate) : null} setDate={setToDate} placeholder="To (Date Range)" /> */}

              <div className="max-w-xs">
              <Label className="font-bold" htmlFor="fromDate">
                From Date
              </Label>
              <Input
                icon={Calendar}
                id="fromDate"
                name="fromDate"
                type="date"
                value={fromDate ? formatDate(fromDate) : ""}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From (Date Range)"
              />
              </div>

              <div className="max-w-xs">
              <Label className="font-bold" htmlFor="toDate">
                To Date
              </Label>
              <Input
                icon={Calendar}
                id="toDate"
                name="toDate"
                type="date"
                value={toDate ? formatDate(toDate) : ""}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="To (Date Range)"
              />
              </div>
              <div className="flex items-end">
                <Button
                  className="ml-2 bg-blue-400 hover:bg-blue-600"
                  onClick={() => showallCaseBetweenRange(formatDate(fromDate), formatDate(toDate))}
                >{loading ? 'Loading...' : 'Get Cases'}</Button>
              </div>
              </div>
              <div className='w-100 h-[1px] bg-slate-100 my-4'></div>
              <div className="flex justify-between items-center mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search Cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div>
                  <span className="mr-2 text-xs">Total number of records: {filteredData.length}</span>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100">
                    <TableHead className="font-bold">Case Number</TableHead>
                    <TableHead className="font-bold">PS Name</TableHead>
                    <TableHead className="font-bold">Case Date</TableHead>
                    <TableHead className="font-bold">Case Status</TableHead>
                    <TableHead className="font-bold">View</TableHead>
                    <TableHead className="font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCases.map((caseItem, index) => (
                    <TableRow key={index}>
                      <TableCell>{caseItem.CaseNumber}</TableCell>
                      <TableCell>{caseItem.PsName}</TableCell>
                      <TableCell>{formatDate(caseItem.CaseDate)}</TableCell>
                      <TableCell>{caseItem.IsAssigned ? <Badge className='bg-emerald-400'>Assigned</Badge> : <Badge className='bg-orange-300'>Pending</Badge>}</TableCell>
                      <TableCell>
                        <Dialog open={isCaseSelected} onOpenChange={setIsCaseSelected}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsCaseSelected(true)
                                setSelectedCase(caseItem)
                              }}
                            >
                              <Eye /> More Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-auto">
                            <DialogHeader>
                              <DialogTitle>Case Details</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                              These informations are for case {selectedCase?.CaseNumber}
                            </DialogDescription>
                            <Card>
                              <CardContent>
                                {selectedCase && (
                                  <>
                                    <div className="space-y-2">
                                      <p><strong>Case Number:</strong> {selectedCase.CaseNumber}</p>
                                      <p><strong>SP Name:</strong> {selectedCase.SpName}</p>
                                      <p><strong>PS Name:</strong> {selectedCase.PsName}</p>
                                      <p><strong>Case Date:</strong> {formatDate(selectedCase.CaseDate)}</p>
                                      <p><strong>Case Type:</strong> {selectedCase.CaseType}</p>
                                      <p><strong>Case Hearing Date:</strong> {formatDate(selectedCase.CaseHearingDate)}</p>
                                      <p><strong>IPC Section:</strong> {selectedCase.IPCSection}</p>
                                      <p><strong>Begin Reference:</strong> {selectedCase.BeginReferenceName}</p>
                                      <p><strong>Whether SP seen the mail:</strong> {selectedCase?.SP_Status ? 'Yes' : 'No'}</p>
                                      <p><strong>Whether PS seen the mail:</strong> {selectedCase?.PS_Status ? 'Yes' : 'No'}</p>
                                    </div>
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const caseID = caseItem.CaseId;
                            const enc_caseId = btoa(caseID);
                            router.push(`/case-control-center/${enc_caseId}`);
                          }}
                        >
                          <Edit /> Take Action
                        </Button>
                      </TableCell>
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
          </div>
          </div>
        </main>
      </div>
    </div>
  )
}

