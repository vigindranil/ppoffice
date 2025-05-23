"use client"
import { BASE_URL } from "@/app/constants"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, FileSpreadsheet, LoaderCircle, Search } from "lucide-react"
import { useSelector } from "react-redux"
import { decrypt } from "@/utils/crypto"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import HearingListPage from "@/app/(psdashboard)/ps-hearing-summary-list/page"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { Input } from "./ui/input"
import * as XLSX from "xlsx"
import { postRequest } from "@/app/commonAPI"
import SmartPagination from '@/components/SmartPagination'

export default function CaseTable({ps}) {
  const router = useRouter()
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [selectedCase, setSelectedCase] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const casesPerPage = 10
  const [allCases, setAllCases] = useState([])
  const [selectedPPUser, setSelectedPPUser] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const userDetails = useSelector((state) => state.auth.user)
  const [user, setUser] = useState("")
  const [caseDetails, setCaseDetails] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [reference, setReference] = useState([]);
  const [isCaseSelected, setIsCaseSelected] = useState(false)
  const [showHearingSummaryList, setShowHearingSummaryList] = useState(false)
  // Define isLoading state that was missing but used in handleReset
  const [isLoading, setIsLoading] = useState(false)
  // Define showAddHearingSummary state that was missing but used in handleReset
  const [showAddHearingSummary, setShowAddHearingSummary] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return null

    const date = new Date(dateString)

    // Format as "yyyy-mm-dd"
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0") // Month is 0-based
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const viewHearingSummary = (caseItem) => {
    setCaseDetails({
      CaseDate: caseItem.CaseDate,
      CaseHearingDate: caseItem.CaseHearingDate,
      CaseId: caseItem.CaseId,
      caseTypeID: caseItem.caseTypeID,
      CaseNumber: caseItem.CaseNumber,
    })
    setShowHearingSummaryList(true)
  }

  const handleReset = () => {
    setIsLoading(false)
    setShowAddHearingSummary(false)
    setShowHearingSummaryList(false)
    setCaseDetails(null)
  }

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cases")
    const currentDate = new Date()
    const formattedDate = currentDate.toISOString().split("T")[0]
    const fileName = `my_case_list_${formattedDate}.xlsx`

    XLSX.writeFile(workbook, fileName)
  }

  const handleConfirm = () => {
    closeAlert()
    showallCaseBetweenRange(ps)
    setSelectedCase(null)
    setIsCaseSelected(false)
    setSelectedPPUser("")
  }

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(userDetails))
    setUser(decoded_user)
  }, [userDetails])

  const showallCaseBetweenRange = async (ps_id) => {

    try {
      setLoading(true)
      const response = await postRequest("showallCasesBypsId", {
        psId: ps_id,
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
    if (ps && user && user.AuthorityUserID) {
      showallCaseBetweenRange(ps);
    }
  }, [ps, user]);

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

  if (loading)
    return (
      <div className="text-center py-10">
        <LoaderCircle className="animate-spin mx-auto" />
      </div>
    )
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>

  // Render the component based on state
  return (
    <div className="relative min-h-screen w-full">
      {showHearingSummaryList ? (
        <HearingListPage onBack={handleReset} caseDetails={caseDetails} />
      ) : (
        <>
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
            <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4 rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between mb-5 bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3 rounded-t-lg">
                <CardTitle className="text-white text-xl">Police Station Cases</CardTitle>
                <Button onClick={downloadExcel} className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export to Excel
                </Button>
              </CardHeader>
              <CardContent>
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
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100">
                        {/* <TableHead className="font-bold">PP User Name</TableHead> */}
                        <TableHead className="font-bold">Case Date</TableHead>
                        <TableHead className="font-bold">Case Number</TableHead>
                        <TableHead className="font-bold">PS Name</TableHead>
                        <TableHead className="font-bold">Reference</TableHead>
                        <TableHead className="font-bold">More Details</TableHead>
                        <TableHead className="font-bold">Case Resources</TableHead>
                        <TableHead className="font-bold">Hearing Summaries</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCases.map((caseItem, index) => (
                        <TableRow key={index}>
                          {/* <TableCell>{caseItem.PPuserName || 'Not Assigned'}</TableCell> */}
                          <TableCell>{formatDate(caseItem.CaseDate)}</TableCell>
                          <TableCell>{caseItem.CaseNumber}</TableCell>
                          <TableCell>{caseItem.PsName}</TableCell>
                          <TableCell>
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
                          <TableCell>
                            <Dialog open={isCaseSelected} onOpenChange={setIsCaseSelected}>
                              <DialogTrigger asChild>
                                <Button
                                  className="bg-blue-100 hover:bg-blue-200 text-sm text-blue-600"
                                  onClick={() => {
                                    setIsCaseSelected(true)
                                    setSelectedCase(caseItem)
                                    setSelectedPPUser("")
                                  }}
                                >
                                  <Eye /> View
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
                                          <p>
                                            <strong>Case Date:</strong> {formatDate(selectedCase.CaseDate)}
                                          </p>
                                          <p>
                                            <strong>Case Number:</strong> {selectedCase.CaseNumber}
                                          </p>
                                          <p>
                                            <strong>SP Name:</strong> {selectedCase.SpName}
                                          </p>
                                          <p>
                                            <strong>PS Name:</strong> {selectedCase.PsName}
                                          </p>
                                          <p>
                                            <strong>Case Type:</strong> {selectedCase.CaseType}
                                          </p>
                                          <p>
                                            <strong>Case Hearing Date:</strong>{" "}
                                            {formatDate(selectedCase.CaseHearingDate)}
                                          </p>
                                          <p>
                                            <strong>IPC Sections:</strong>{' '}
                                            {selectedCase.ipcSections && selectedCase.ipcSections.length > 0
                                              ? selectedCase.ipcSections.map(ipc => ipc.IpcSection).filter(Boolean).join(', ')
                                              : 'None'}
                                          </p>
                                          {/* <p><strong>Whether SP seen the mail:</strong> {selectedCase?.SP_Status ? 'Yes' : 'No'}</p>
                                          <p><strong>Whether PS seen the mail:</strong> {selectedCase?.PS_Status ? 'Yes' : 'No'}</p> */}
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
                              className="bg-green-100 hover:bg-green-200 text-sm text-green-600"
                              onClick={() => {
                                const caseID = caseItem.CaseId
                                const enc_caseId = btoa(caseID)
                                router.push(`/ro-case-library/${enc_caseId}`)
                              }}
                            >
                              <Eye /> View
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button onClick={() => viewHearingSummary(caseItem)} className="max-w-min">
                              <Eye />
                              View
                            </Button>
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
              </CardContent>
            </Card>
          </main>
        </>
      )}
    </div>
  )
}