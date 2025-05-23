'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ClipboardPlus, Eye, LoaderCircle, Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/date-picker'
import { Badge } from '@/components/ui/badge'
import { postRequest } from "@/app/commonAPI"
import { BASE_URL } from '@/app/constants'
import { Label } from '@/components/ui/label'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import SmartPagination from '@/components/SmartPagination'

export default function CaseTable() {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [selectedCase, setSelectedCase] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const casesPerPage = 10
  const [allCases, setAllCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [isloading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");
  const [reference, setReference] = useState([]);
  const [searchTerm, setSearchTerm] = useState('')
  const [isCaseSelected, setIsCaseSelected] = useState(false)
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const exportToExcel = () => {
    const dataForExport = allCases.map((item, idx) => {
      const referencesFormatted = item.references?.map((ref, i) =>
        `${i + 1}. ${ref.RefferenceNumber} - ${ref.CrmName} (${ref.RefferenceYear})`
      ).join('\n') || 'No references';
  
      const ipcFormatted = item.ipcSections?.map(ipc => ipc.IpcSection).filter(Boolean).join(', ') || 'None';
  
      return {
        "Case Date": formatDate(item.CaseDate),
        "Case Number": item.CaseNumber,
        "Police Station": item.PsName,
        "Petitioner Name": item.PetitionName,
        "References": referencesFormatted,
        "Case Status": item.IsAssigned ? 'Assigned' : 'Pending',
        "IPC Sections": ipcFormatted
      };
    });
  
    const worksheet = XLSX.utils.json_to_sheet(dataForExport, { origin: 'A1' });
  
    // Auto-fit columns (optional)
    const columnWidths = dataForExport.reduce((widths, row) => {
      Object.values(row).forEach((val, idx) => {
        const len = val?.toString().split('\n').reduce((max, line) => Math.max(max, line.length), 0) || 10;
        widths[idx] = Math.max(widths[idx] || 10, len);
      });
      return widths;
    }, []);
  
    worksheet['!cols'] = columnWidths.map(w => ({ wch: w + 5 }));
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Cases");
  
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const from = fromDate ? formatDate(fromDate) : null;
    const to = toDate ? formatDate(toDate) : null;
    const fileName = from && to
      ? `All_Cases_${from}_to_${to}.xlsx`
      : `All_Cases_${formattedToday}.xlsx`;
  
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);

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
      const response = await postRequest("showallCaseBetweenRange", {
        startDate: formatDate(start),
        endDate: formatDate(end),
        isAssign: 2,
        EntryUserID: user.AuthorityUserID
      })
      if (response.status === 0) {
        setAllCases(response.data)
      } else {
        throw new Error(response.message || 'Failed to fetch data')
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


  const filteredData = allCases?.filter((data) => {
    const lowerSearch = searchTerm.toLowerCase();

    const matchesCaseFields = Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearch)
    );

    const matchesReferences = data.references?.some(ref =>
      `${ref.RefferenceNumber} ${ref.CrmName} ${ref.RefferenceYear}`
        .toLowerCase()
        .includes(lowerSearch)
    );

    const matchesIPC = data.ipcSections?.some(ipc =>
      ipc?.IpcSection?.toLowerCase().includes(lowerSearch)
    );

    return matchesCaseFields || matchesReferences || matchesIPC;
  });

  const indexOfLastCase = currentPage * casesPerPage
  const indexOfFirstCase = indexOfLastCase - casesPerPage
  const currentCases = filteredData?.slice(indexOfFirstCase, indexOfLastCase)

  const totalPages = Math.ceil(filteredData?.length / casesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <Card className="w-full max-w-6xl mx-auto bg-white/100 overflow-hidden backdrop-blur-sm my-4">
          <CardHeader className="mb-5  bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3">
            <CardTitle className="text-white text-xl">All Case List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : error ? (
              <p className="text-red-600 mb-4 text-center">{error}</p>
            ) : (
              <div className="container mx-auto py-10">
                <CustomAlertDialog
                  isOpen={isOpen}
                  alertType={alertType}
                  alertMessage={alertMessage}
                  onClose={closeAlert}
                  onConfirm={handleConfirm}
                />
                <div className='flex gap-4 mb-3'>

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
                {/* <div className="flex justify-between items-center mb-4">
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
                </div> */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
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
                  <div className="flex gap-2 items-center">
                    <span className="text-xs">Total number of records: {filteredData.length}</span>
                    <Button onClick={exportToExcel} className="bg-green-600 text-white hover:bg-green-800">
                      Export to Excel
                    </Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      {/* <TableHead className="font-bold">PP User Name</TableHead> */}
                      <TableHead className="font-bold">Case Date</TableHead>
                      <TableHead className="font-bold">Case Number</TableHead>
                      <TableHead className="font-bold">Police Station</TableHead>
                      <TableHead className="font-bold">Reference</TableHead>
                      <TableHead className="font-bold">Case Status</TableHead>
                      <TableHead className="font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCases.map((caseItem, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(caseItem.CaseDate)}</TableCell>
                        <TableCell>{caseItem.CaseNumber}</TableCell>
                        <TableCell>{caseItem.PsName}</TableCell>
                        <TableCell className="max-w-[300px]">
                          {caseItem.references && caseItem.references.length > 0 ? (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <span className="cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-200">
                                  {
                                    caseItem.references
                                      .slice(0, 1)
                                      .map((ref, idx) => `${idx + 1}. ${ref.RefferenceNumber} - ${ref.CrmName} (${ref.RefferenceYear})`)
                                  }
                                  {caseItem.references.length > 1 ? '...' : ''}
                                </span>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <ol className="list-decimal list-inside text-sm">
                                  {caseItem.references.map((ref, idx) => (
                                    <li key={idx}>
                                      {ref.RefferenceNumber} - {ref.CrmName} ({ref.RefferenceYear})
                                    </li>
                                  ))}
                                </ol>
                              </HoverCardContent>
                            </HoverCard>
                          ) : (
                            <span>No references</span>
                          )}
                        </TableCell>
                        <TableCell>{caseItem.IsAssigned ? <Badge className='bg-emerald-400'>Assigned</Badge> : <Badge className='bg-orange-300'>Pending</Badge>}</TableCell>
                        <TableCell>
                          <Dialog open={isCaseSelected} onOpenChange={setIsCaseSelected}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className=""
                                onClick={() => {
                                  setIsCaseSelected(true)
                                  setSelectedCase(caseItem)
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
                                {/* Make changes to your profile here. Click save when you're done. */}
                              </DialogDescription>
                              <Card>
                                <CardHeader>
                                  <CardTitle>Case Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {selectedCase && (
                                    <>
                                      <div className="space-y-2">
                                        <p><strong>Case Date:</strong> {formatDate(selectedCase.CaseDate)}</p>
                                        <p><strong>Case Number:</strong> {selectedCase.CaseNumber}</p>
                                        <p><strong>District:</strong> {selectedCase.SpName}</p>
                                        <p><strong>Police Station:</strong> {selectedCase.PsName}</p>
                                        <p><strong>Case Type:</strong> {selectedCase.CaseType}</p>
                                        <p><strong>Next Hearing Date:</strong> {formatDate(selectedCase.CaseHearingDate)}</p>
                                        <p>
                                          <strong>IPC Sections:</strong>{' '}
                                          {selectedCase.ipcSections && selectedCase.ipcSections.length > 0
                                            ? selectedCase.ipcSections.map(ipc => ipc.IpcSection).filter(Boolean).join(', ')
                                            : 'None'}
                                        </p>
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

