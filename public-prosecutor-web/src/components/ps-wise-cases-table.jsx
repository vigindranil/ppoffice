'use client'
import { BASE_URL } from '@/app/constants'; 
import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardPlus, Eye, LoaderCircle, Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { Input } from './ui/input'
import { DatePicker } from './date-picker'
import { fetchPPUsers, handleNotifyToPPUser } from "@/app/api";
import SmartPagination from '@/components/SmartPagination'

export default function CaseTable({ps}) {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [selectedCase, setSelectedCase] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const casesPerPage = 10
  const [allCases, setAllCases] = useState([])
  const [ppUsers, setPPUsers] = useState(null)
  const [selectedPPUser, setSelectedPPUser] = useState('')
  const [loading, setLoading] = useState(true)
  const [assignCaseLoading, setAssignCaseLoading] = useState(false)
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
    

  const handleAssignCasetoPPUser = async () => {
    try {
      setAssignCaseLoading(true)
      const token = sessionStorage.getItem('token')
      const response = await fetch(`${BASE_URL}assigncase`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          "PPUserID": selectedPPUser,
          "EntryUserID": user?.AuthorityUserID,
          "CaseID": selectedCase?.CaseId
        }),

      })
      if (!response.ok) {
        throw new Error('Failed to assign case')
      }
      const result = await response.json()
      if (result.status === 0) {
        await handleNotifyToPPUser(selectedCase?.CaseId, selectedPPUser);
        openAlert('success', 'PP User has been successfully assigned to Case')
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      openAlert('error', err?.message)
    } finally {
      setAssignCaseLoading(false)
    }
  }

  const handleConfirm = () => {
    closeAlert()
    showallCaseBetweenRange(ps)
    setSelectedCase(null)
    setIsCaseSelected(false)
    setSelectedPPUser('')
  }

  const showallCaseBetweenRange = async (ps_id) => {
    try {
      // console.log(ps_id)
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${BASE_URL}showallCasesBypsId?psId=${ps_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const result = await response.json()
      if (result.status === 0) {
        // console.log(result);
        
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
    ps && showallCaseBetweenRange(ps);
  }, [ps])

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
          <TableHead className="font-bold">Case Date</TableHead>
            <TableHead className="font-bold">PP User Name</TableHead>
            <TableHead className="font-bold">Case Number</TableHead>
            <TableHead className="font-bold">PS Name</TableHead>
            <TableHead className="font-bold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentCases.map((caseItem, index) => (
            <TableRow key={index}>
              <TableCell>{formatDate(caseItem.CaseDate)}</TableCell>
              <TableCell>{caseItem.PPuserName || 'Not Assigned'}</TableCell>
              <TableCell>{caseItem.CaseNumber}</TableCell>
              <TableCell>{caseItem.PsName}</TableCell>
              <TableCell>
                <Dialog open={isCaseSelected} onOpenChange={setIsCaseSelected}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className=""
                      onClick={() => {
                        setIsCaseSelected(true)
                        setSelectedCase(caseItem)
                        setSelectedPPUser('')
                      }}
                    >
                      <Eye /> More Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Case Details</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      These details are for case {selectedCase?.CaseNumber}
                    </DialogDescription>
                    <Card>
                      <CardContent>
                        {selectedCase && (
                          <>
                            <div className="space-y-2">
                              <p><strong>Case Date:</strong> {formatDate(selectedCase.CaseDate)}</p>
                              <p><strong>PP User Name:</strong> {selectedCase.PPuserName || 'Not Assigned' }</p>
                              <p><strong>Case Number:</strong> {selectedCase.CaseNumber}</p>
                              <p><strong>SP Name:</strong> {selectedCase.SpName}</p>
                              <p><strong>PS Name:</strong> {selectedCase.PsName}</p>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">

        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={paginate}
        />

      </div>
    </div>
  )
}

