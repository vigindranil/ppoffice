"use client"

import { PORT_URL } from "@/app/constants"
import React, { useState, useEffect, useCallback } from "react"
import { showHearingSummaryList } from "@/app/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch, useSelector } from "react-redux"
import { decrypt } from "@/utils/crypto"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, FileSpreadsheet, Search, Undo2 } from "lucide-react"
import * as XLSX from "xlsx"
import { Skeleton } from "@/components/ui/skeleton"

const HearingListPage = ({ onBack, caseDetails }) => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [allHearingList, setAllHearingList] = useState([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState({})
  const itemsPerPage = 10
  const dispatch = useDispatch()
  const encryptedUser = useSelector((state) => state.auth.user)
  const [user, setUser] = useState("")
  const [caseTypeList, setCaseTypeList] = useState([])
  const [caseTypeName, setCaseTypeName] = useState("")

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser))
    setUser(decoded_user)
  }, [encryptedUser])

  // const fetchCaseTypes = useCallback(async () => {
  //   try {
  //     const result = await getcasetype()
  //     setCaseTypeList(result)
  //   } catch (err) {
  //     openAlert("error", err?.message || "An unexpected error occurred")
  //   }
  // }, [openAlert])

  // useEffect(() => {
  //   if (user) {
  //     fetchCaseTypes()
  //   }
  // }, [user, fetchCaseTypes])

  useEffect(() => {
    if (caseDetails && caseTypeList.length > 0) {
      const selectedCaseType = caseTypeList.find(
        (caseType) => caseType.CasetypeId.toString() === (caseDetails.caseTypeID ? caseDetails.caseTypeID.toString() : ""),
      )
      setCaseTypeName(selectedCaseType ? selectedCaseType.CasetypeName : "Unknown")
    }
  }, [caseDetails, caseTypeList])

  const fetchHearingSummaries = useCallback(async () => {
    if (user && caseDetails?.CaseId) {
      try {
        const result = await showHearingSummaryList(caseDetails.CaseId)
        console.log("API Response: ", result)
        setAllHearingList(result || [])
      } catch (err) {
        // setMessage(err?.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false)
      }
    }
  }, [user, caseDetails])

  useEffect(() => {
    fetchHearingSummaries()
  }, [fetchHearingSummaries])

  const filteredData = allHearingList?.filter((data) =>
    Object?.values(data)?.some((value) => value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAllHearingList = filteredData?.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cases")
    const currentDate = new Date()
    const formattedDate = currentDate.toISOString().split("T")[0]
    const fileName = `hearing_summary_list_${caseDetails.CaseId}_${formattedDate}.xlsx`

    XLSX.writeFile(workbook, fileName)
  }

  const handleConfirm = () => {
    closeAlert()
  }

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <CustomAlertDialog
          isOpen={isOpen}
          alertType={alertType}
          alertMessage={alertMessage}
          onClose={closeAlert}
          onConfirm={handleConfirm}
        />
        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4">
          <CardHeader className="flex flex-col items-start">
            <CardTitle>Hearing Summary List</CardTitle>
            {caseDetails && (
              <div className="mt-4">
                <p className="font-bold">Case Number: {caseDetails.CaseNumber}</p>
                <p className="font-bold">Case Date: {formatDate(caseDetails.CaseDate)}</p>
                {/* <p className="font-bold">Case Type: {caseTypeName}</p> */}
              </div>
            )}
            <Button onClick={downloadExcel} className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </Button>
            <Button onClick={onBack} className="absolute top-4 right-4">
              Back
              <Undo2 />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="container mx-auto py-10">
              <div className="flex justify-between items-center mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search Hearings..."
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
                      <TableHead className="font-bold">Case Summary ID</TableHead>
                      <TableHead className="font-bold hidden sm:table-cell">Document</TableHead>
                      <TableHead className="font-bold hidden md:table-cell">Description</TableHead>
                      <TableHead className="font-bold hidden md:table-cell">Required Documents</TableHead>
                      <TableHead className="font-bold hidden md:table-cell">SP Name</TableHead>
                      <TableHead className="font-bold hidden md:table-cell">PS Name</TableHead>
                      <TableHead className="font-bold hidden lg:table-cell">Hearing Date</TableHead>
                      <TableHead className="font-bold hidden lg:table-cell">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-8" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-24" />
                          </TableCell>
                          <TableCell className="flex space-x-2">
                            <Skeleton className="bg-slate-300 h-8 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : currentAllHearingList?.length > 0 ? (
                      currentAllHearingList?.map((head, index) => (
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
                            <TableCell>{head.CaseSummaryId}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {head.Document ? (
                                <div>
                                  <a
                                    href={`${PORT_URL}uploads/${head.Document.split("\\").pop()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View
                                  </a>
                                </div>
                              ) : (
                                <div>N/A</div>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{head.CaseDescription}</TableCell>
                            <TableCell className="hidden md:table-cell">{head.CaseRequiredDocument}</TableCell>
                            <TableCell className="hidden md:table-cell">{head.SPName}</TableCell>
                            <TableCell className="hidden md:table-cell">{head.PSName}</TableCell>
                            <TableCell className="hidden lg:table-cell">{formatDate(head.NextHearingDate)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{head.Remarks}</TableCell>
                          </TableRow>
                          {expandedRows[index] && (
                            <TableRow className="bg-gray-50 lg:hidden">
                              <TableCell colSpan={10}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                  {head.Document ? (
                                    <div className="sm:hidden">
                                      <strong>Document:</strong>
                                      <a
                                        href={`${PORT_URL}uploads/${head.Document.split("\\").pop()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        View
                                      </a>
                                    </div>
                                  ) : (
                                    <div className="sm:hidden">
                                      <strong>Document:</strong> N/A
                                    </div>
                                  )}
                                  {head.CaseDescription && (
                                    <div className="md:hidden">
                                      <strong>Description:</strong> {head.CaseDescription}
                                    </div>
                                  )}
                                  {head.CaseRequiredDocument && (
                                    <div className="md:hidden">
                                      <strong>Required Documents:</strong> {head.CaseRequiredDocument}
                                    </div>
                                  )}
                                  {head.SPName && (
                                    <div className="md:hidden">
                                      <strong>SP Name:</strong> {head.SPName}
                                    </div>
                                  )}
                                  {head.PSName && (
                                    <div className="md:hidden">
                                      <strong>PS Name:</strong> {head.PSName}
                                    </div>
                                  )}
                                  {head.NextHearingDate && (
                                    <div className="lg:hidden">
                                      <strong>Hearing Date:</strong> {formatDate(head.NextHearingDate)}
                                    </div>
                                  )}
                                  {head.Remarks && (
                                    <div className="lg:hidden">
                                      <strong>Remarks:</strong> {head.Remarks}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No hearing summary data available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {[...Array(totalPages || 0)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink onClick={() => paginate(index + 1)} isActive={currentPage === index + 1}>
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default HearingListPage