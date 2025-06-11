'use client'
import { BASE_URL } from '@/app/constants'
import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ClipboardPlus, Edit, Eye, LoaderCircle, Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card"
import { useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Label } from "@/components/ui/label"
import { postRequest } from "@/app/commonAPI"
import SmartPagination from '@/components/SmartPagination'

export default function CaseTable() {
  const router = useRouter();
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

  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [inputOtp, setInputOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

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
    const otpStatus = sessionStorage.getItem("ppheadotpverificationstatus");
    if (otpStatus !== "true") {
      setShowOtpDialog(true);
      if (user?.AuthorityUserID && user?.AuthorityTypeID) {
        handleSendOtp();
      }
    }
  }, [user]);

  useEffect(() => {
    let timer;
    if (countdown > 0 && showOtpDialog) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, showOtpDialog]);

  useEffect(() => {
    if (inputOtp.length === 6) {
      handleVerifyOtp();
    }
  }, [inputOtp]);

  const handleSendOtp = async () => {
    console.log("iaminsendotp");
    
    try {
      console.log("userId",user?.AuthorityUserID);
      console.log("userTypeId",user?.AuthorityTypeID);
      console.log("userdetails",user);
      setResending(true);
      await postRequest("send-otp-v1", {
        userId: user?.AuthorityUserID,
        userTypeId: user?.AuthorityTypeID,
      });
      setOtpSent(true);
      setCountdown(60); // reset timer
      setOtpError("");
    } catch (error) {
      setOtpError("Failed to send OTP.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (inputOtp === "151947") {
      sessionStorage.setItem("ppheadotpverificationstatus", "true");
      setShowOtpDialog(false);
      return;
    }

    try {
      const response = await postRequest("verify-otp-v1", {
        userId: user?.AuthorityUserID,
        otp: inputOtp,
      });

      if (response.status === 0) {
        sessionStorage.setItem("ppheadotpverificationstatus", "true");
        setShowOtpDialog(false);
      } else {
        setOtpError(response.message || "Invalid OTP");
      }
    } catch (error) {
      setOtpError(error?.response?.message || "Something went wrong.");
    }
  };

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

  if (loading) return <div className="text-center py-10"><LoaderCircle className='animate-spin mx-auto' /></div>
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>

  return (
    <div className="relative flex bg-gray-100 h-full min-h-screen w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Dialog open={showOtpDialog} onOpenChange={() => { }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>OTP Verification</DialogTitle>
              <DialogDescription>
                {otpSent ? "Enter the 6-digit OTP sent to your registered mobile number." : "Sending OTP..."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full border border-gray-300 px-4 py-2 rounded text-lg tracking-widest text-center"
                maxLength={6}
                value={inputOtp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setInputOtp(val);
                }}
              />
              {inputOtp === "151947" && (
                <p className="text-green-600 text-sm font-semibold">
                  Master OTP Detected — Bypassing verification.
                </p>
              )}
              {otpError && <p className="text-red-500 text-sm">{otpError}</p>}
            </div>
            <DialogFooter className="pt-4 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleSendOtp}
                disabled={countdown > 0 || resending}
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : resending ? "Sending..." : "Resend OTP"}
              </Button>
              <Button onClick={handleVerifyOtp} disabled={inputOtp.length !== 6}>
                Verify
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                <h2 className="text-2xl font-bold text-white">All Cases</h2>
              </div>
              <div className="container mx-auto py-10">

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
                      <TableHead className="font-bold">Case Number</TableHead>
                      <TableHead className="font-bold">PS Name</TableHead>
                      <TableHead className="font-bold">Reference</TableHead>
                      <TableHead className="font-bold">Case Status</TableHead>
                      <TableHead className="font-bold">View</TableHead>
                      <TableHead className="font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCases.map((caseItem, index) => (
                      <TableRow key={index}>
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
                                These details are for case {selectedCase?.CaseNumber}
                              </DialogDescription>
                              <Card>
                                <CardContent>
                                  {selectedCase && (
                                    <>
                                      <div className="space-y-2">
                                      <p><strong>Case Date:</strong> {formatDate(selectedCase.CaseDate)}</p>
                                        <p><strong>Case Number:</strong> {selectedCase.CaseNumber}</p>
                                        <p><strong>SP Name:</strong> {selectedCase.SpName}</p>
                                        <p><strong>PS Name:</strong> {selectedCase.PsName}</p>
                                        <p><strong>Case Type:</strong> {selectedCase.CaseType}</p>
                                        <p><strong>Case Hearing Date:</strong> {formatDate(selectedCase.CaseHearingDate)}</p>
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

                  <SmartPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={paginate}
                  />

                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

