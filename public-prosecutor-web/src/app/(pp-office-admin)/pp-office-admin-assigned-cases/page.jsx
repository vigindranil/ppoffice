'use client'

import React, { useState, useEffect } from 'react'
import { showallCase } from '@/app/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch, useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, ClipboardPlus, Download, Eye, FileSpreadsheet, Search } from 'lucide-react'
import * as XLSX from 'xlsx'
import AddHearingPage from '../add-hearing-summary/page'
import HearingListPage from '../pp-office-admin-hearing-summary-list/page'

const PPAllCaseList = () => {
  const [allCaseList, setAllCaseList] = useState([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState({})
  const itemsPerPage = 10
  const dispatch = useDispatch()
  const encryptedUser = useSelector((state) => state.auth.user)
  const [user, setUser] = useState("")
  const [caseDetails, setCaseDetails] = useState(null);
  const [showAddHearingSummary, setShowAddHearingSummary] = useState(false)
  const [showHearingSummaryList, setShowHearingSummaryList] = useState(false)

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser))
    setUser(decoded_user)
  }, [encryptedUser])

  useEffect(() => {
    if (user) {
      showallCase(1)
        .then((result) => {
          // console.log(result)
          setAllCaseList(result)
        })
        .catch((err) => {
          setMessage(err?.message || "An unexpected error occurred")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [user])

  const handleReset = () => {
    setIsLoading(false);
    setShowAddHearingSummary(false);
    setShowHearingSummaryList(false);
    setCaseDetails(null);
  };

  const filteredData = allCaseList?.filter((data) =>
    Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAllCaseList = filteredData?.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const toggleRowExpansion = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const addHearingSummary = (head) => {
    setCaseDetails({
      CaseDate: head.CaseDate,
      CaseHearingDate: head.CaseHearingDate,
      CaseId: head.CaseId,
      caseTypeID: head.caseTypeID,
      CaseNumber: head.CaseNumber,
    })
    setShowAddHearingSummary(true)
  }

  const viewHearingSummary = (head) => {
    setCaseDetails({
      CaseDate: head.CaseDate,
      CaseHearingDate: head.CaseHearingDate,
      CaseId: head.CaseId,
      caseTypeID: head.caseTypeID,
      CaseNumber: head.CaseNumber,
    })
    setShowHearingSummaryList(true)
  }

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cases")
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const fileName = `assigned_case_list_${formattedDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  if (showAddHearingSummary) {
    return <AddHearingPage onBack={handleReset} caseDetails={caseDetails} />;
  }

  if (showHearingSummaryList) {
    return <HearingListPage onBack={handleReset} caseDetails={caseDetails} />;
  }

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Assigned Case List</CardTitle>
            <Button onClick={downloadExcel} className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center">Loading...</p>
            ) : message ? (
              <p className="text-red-600 mb-4 text-center">{message}</p>
            ) : (
              <div className="container mx-auto py-10">
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold"></TableHead>
                        <TableHead className="font-bold">Case Number</TableHead>
                        <TableHead className="font-bold hidden sm:table-cell">Document</TableHead>
                        <TableHead className="font-bold hidden md:table-cell">Hearing Summary</TableHead>
                        <TableHead className="font-bold hidden md:table-cell">Jurisdiction</TableHead>
                        <TableHead className="font-bold hidden md:table-cell">Police Station</TableHead>
                        <TableHead className="font-bold hidden md:table-cell">Case Date</TableHead>
                        <TableHead className="font-bold hidden lg:table-cell">Case Type</TableHead>
                        <TableHead className="font-bold hidden lg:table-cell">Case Hearing Date</TableHead>
                        <TableHead className="font-bold hidden lg:table-cell">IPC Section</TableHead>
                        <TableHead className="font-bold hidden lg:table-cell">Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAllCaseList?.map((head, index) => (
                        <React.Fragment key={index}>
                          <TableRow>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                {expandedRows[index] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>{head.CaseNumber}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                            {head.Document ? (
                                <div>
                                  <a 
                                    href={`http://localhost:8000/uploads/${head.Document}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-600 hover:underline ml-1"
                                  >
                                    View
                                  </a>
                                </div>
                              ) : (
                                <div>N/A</div>
                              )}
                            </TableCell>
                            <TableCell className="md:flex hidden gap-2 mt-4">
                              <Button onClick={() => addHearingSummary(head)} className="max-w-min">
                                <ClipboardPlus className="h-4 w-4" />
                                  Add
                              </Button>
                              <Button onClick={() => viewHearingSummary(head)} className="max-w-min">
                                <Eye className="h-4 w-4" />
                                  View
                              </Button>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{head.SpName}</TableCell>
                            <TableCell className="hidden md:table-cell">{head.PsName}</TableCell>
                            <TableCell className="hidden md:table-cell">{formatDate(head.CaseDate)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{head.CaseType}</TableCell>
                            <TableCell className="hidden lg:table-cell">{formatDate(head.CaseHearingDate)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{head.IPCSection}</TableCell>
                            <TableCell className="hidden lg:table-cell">{head.BeginReferenceName}</TableCell>
                          </TableRow>
                          {expandedRows[index] && (
                            <TableRow className="bg-gray-50 lg:hidden">
                              <TableCell colSpan={10}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                {head.Document ? (
                                  <div className="sm:hidden">
                                    <strong>Document:</strong>
                                    <a 
                                      href={`http://localhost:8000/uploads/${head.Document}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-blue-600 hover:underline ml-1"
                                    >
                                      View
                                    </a>
                                  </div>
                                ) : (
                                  <div className="sm:hidden"><strong>Document:</strong> N/A</div>
                                )}
                                {
                                  <div className="md:hidden flex items-center gap-2">
                                    <strong>Hearing Summary:</strong>
                                    <Button onClick={() => addHearingSummary(head)} className="flex items-center max-w-min">
                                        <ClipboardPlus className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={() => viewHearingSummary(head)} className="flex items-center max-w-min">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                }
                                {head.SpName && (
                                  <div className="md:hidden"><strong>Jurisdiction:</strong> {head.SpName}</div>
                                )}
                                {head.PsName && (
                                  <div className="md:hidden"><strong>Police Station:</strong> {head.PsName}</div>
                                )}
                                {head.CaseDate && (
                                  <div className="lg:hidden"><strong>Case Date:</strong> {formatDate(head.CaseDate)}</div>
                                )}
                                {head.CaseType && (
                                  <div className="lg:hidden"><strong>Case Type:</strong> {head.CaseType}</div>
                                )}
                                {head.CaseHearingDate && (
                                  <div className="lg:hidden"><strong>Case Hearing Date:</strong> {formatDate(head.CaseHearingDate)}</div>
                                )}
                                {head.IPCSection && (
                                  <div className="lg:hidden"><strong>IPC Section:</strong> {head.IPCSection}</div>
                                )}
                                {head.BeginReferenceName && (
                                  <div className="lg:hidden"><strong>Reference:</strong> {head.BeginReferenceName}</div>
                                )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {[...Array(totalPages || 0)].map((_, index) => (
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

export default PPAllCaseList

