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
    const dataForExport = allCases.map((item) => {
      return {
        "Case Number": item.CaseNumber,
        "Reference": item.RefferenceName,
        "District": item.SpName,
        "Police Station": item.PsName,
        "Petitioner Name": item.PetitionName,
        "Advocate Name": item.AdvocateName || 'N/A', // Handle cases where AdvocateName might be null
        "Assignment Time": formatDateTime(item.CaseAssignDate),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExport, { origin: 'A1' });

    // Auto-fit columns (optional)
    const columnWidths = dataForExport.reduce((widths, row) => {
      Object.values(row).forEach((val, idx) => {
        const len = val?.toString().length || 10;
        widths[idx] = Math.max(widths[idx] || 10, len);
      });
      return widths;
    }, []);

    worksheet['!cols'] = columnWidths.map(w => ({ wch: w + 5 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Advocate Assign Log");

    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    const from = fromDate ? formatDate(fromDate) : null;
    const to = toDate ? formatDate(toDate) : null;
    const fileName = from && to
      ? `Advocate_Assign_Log_${from}_to_${to}.xlsx`
      : `Advocate_Assign_Log_${formattedToday}.xlsx`;

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

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleConfirm = () => {
    closeAlert()
    showallCaseBetweenRange(null, null)
    setSelectedCase(null)
    setIsCaseSelected(false)
  }

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(userDetails));
    setUser(decoded_user);
  }, [userDetails]);

  const showallCaseBetweenRange = async (start, end) => {

    try {
      setLoading(true)
      const token = sessionStorage.getItem('token'); 
      const response = await postRequest("assigned-case-detail", {
        userId: user.AuthorityUserID,
        startDate: formatDate(start),
        enddate: formatDate(end),
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
    if (user) { // Ensure user is set before fetching data
      showallCaseBetweenRange(null, null)
    }
  }, [user])


  const filteredData = allCases?.filter((data) => {
    const lowerSearch = searchTerm.toLowerCase();

    // Now directly check relevant fields for the assign log
    return (
      data.CaseNumber?.toLowerCase().includes(lowerSearch) ||
      data.RefferenceName?.toLowerCase().includes(lowerSearch) ||
      data.SpName?.toLowerCase().includes(lowerSearch) ||
      data.PsName?.toLowerCase().includes(lowerSearch) ||
      data.PetitionName?.toLowerCase().includes(lowerSearch) ||
      data.AdvocateName?.toLowerCase().includes(lowerSearch) ||
      formatDateTime(data.CaseAssignDate)?.toLowerCase().includes(lowerSearch)
    );
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
            <CardTitle className="text-white text-xl">Advocate Assign Log</CardTitle>
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
                      onClick={() => showallCaseBetweenRange(fromDate, toDate)} // Pass raw date objects/strings to showallCaseBetweenRange
                    >{loading ? 'Loading...' : 'Generate List'}</Button>
                  </div>
                </div>
                <div className='w-100 h-[1px] bg-slate-100 my-4'></div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search Logs..."
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
                      <TableHead className="font-bold">Case Number</TableHead>
                      <TableHead className="font-bold">Reference</TableHead>
                      <TableHead className="font-bold">District</TableHead>
                      <TableHead className="font-bold">Police Station</TableHead>
                      <TableHead className="font-bold">Petitioner Name</TableHead>
                      <TableHead className="font-bold">Advocate Name</TableHead>
                      <TableHead className="font-bold">Assignment Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCases.map((caseItem, index) => (
                      <TableRow key={index}>
                        <TableCell>{caseItem.CaseNumber}</TableCell>
                        <TableCell>{caseItem.RefferenceName}</TableCell>
                        <TableCell>{caseItem.SpName}</TableCell>
                        <TableCell>{caseItem.PsName}</TableCell>
                        <TableCell>{caseItem.PetitionName}</TableCell>
                        <TableCell>{caseItem.AdvocateName || 'N/A'}</TableCell>
                        <TableCell>{formatDateTime(caseItem.CaseAssignDate)}</TableCell>
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