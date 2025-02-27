"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getApplicationStatus } from "@/app/totalPending/api"
import moment from "moment"
import { useRouter } from "next/navigation"
import { acceptApplication } from "@/app/allFiles/api"
import { FileAcceptModal } from "./file-accept-modal"
import { toast } from "@/hooks/use-toast"
import { ToastAction } from "./ui/toast"
import Cookies from "react-cookies"
import { TransferModal } from "@/components/transferModal"
import { BookOpenCheck, CheckCheck, CheckCircle2, CopyCheck, FileUser, Rotate3d } from "lucide-react"
import { transferapplication } from "@/app/allFiles-sp/api"
import { Skeleton } from "@/components/ui/skeleton";

export default function PendingApplicationDatatable({ status }) {
  const user_role = Cookies.load('type');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedDetails, setSelectedDetails] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const itemsPerPage = 6
  const [applicationStatus, setApplicationStatus] = useState(null)
  const [verificationData, setVerificationData] = useState([])
  const [isFileAcceptModalOpen, setIsFileAcceptModalOpen] = useState(false)
  const [remarks, setRemarks] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedPoliceStation, setSelectedPoliceStation] = useState("");
  const ps = Cookies.load('ps');
  const router = useRouter()
  const [EO_POLICE_STATION, setEO_POLICE_STATION] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const filteredData = verificationData?.filter((row) =>
    Object?.values(row)?.some((value) => value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())),
  )

  const fetchApplicationStatus = async () => {
    try {
      setIsLoading(true)
      const response = await getApplicationStatus(status, 30)
      setVerificationData(response.data)
    } catch (error) {
      console.log("Error fetching application status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(verificationData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "VerificationData")
    XLSX.writeFile(wb, "police_verification_data.xlsx")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.autoTable({
      head: [["File Number", "Applicant Name", "Police Station", "Phone No.", "Verification Address"]],
      body: verificationData.map((row) => [
        row.FileNumber,
        row.ApplicantName,
        row.PsName,
        row.PhoneNo,
        row.VerificationAddress,
      ]),
    })
    doc.save("police_verification_data.pdf")
  }

  const handleOpenTransferModal = () => {
    setIsTransferModalOpen(true)
  }

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false)
  }

  const onTransfer = async (fileNumber, remarks, selectedDistrict, selectedPoliceStation) => {
    if (!selectedDistrict || !selectedPoliceStation) {
      console.log("Please fill in all fields before transferring.");
      return;
    }

    try {
      console.log("Calling API with:", {
        fileNumber,
        locationIp: "115.187.62.100",
        deviceId: "deviceId",
        remarks,
        districtId: selectedDistrict,
        psId: selectedPoliceStation,
        macAddress: "test-s4dn-3aos-dn338",
      });

      const response = await transferapplication({
        fileNumber,
        locationIp: "115.187.62.100",
        deviceId: "deviceId",
        remarks,
        districtId: selectedDistrict,
        psId: selectedPoliceStation,
        macAddress: "test-s4dn-3aos-dn338",
      });

      if (response.status == 0) {
        await fetchApplicationStatus();
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Successfull!</span>
            </div>
          ),
          description: response?.message,
          action: <ToastAction altText="Try again">Close</ToastAction>,
        })
        setRemarks("");
        setSelectedDistrict("");
        setSelectedPoliceStation("");
        setIsTransferModalOpen(false)
      } else {
        console.log("Transfer failed. No response from API.");
      }
    } catch (error) {
      console.log("Error transferring application:", error);
    }
  };

  const printTable = () => {
    const printContent = document.getElementById("police-verification-table")
    const windowPrint = window.open("", "", "left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0")
    windowPrint.document.write(printContent.innerHTML)
    windowPrint.document.close()
    windowPrint.focus()
    windowPrint.print()
    windowPrint.close()
  }

  const handleAcceptFile = async (applicationId, citizentype, dateOfBirth, mobileNo) => {
    try {
      if (!citizentype) {
        toast({
          variant: "destructive",
          title: "Select Citizen Type!",
          description: "Please select citizen type and then try again",
        })
      }
      if (!dateOfBirth) {
        toast({
          variant: "destructive",
          title: "Date of Birth is not available!",
          description: "An error occurred",
        })
      }

      // Implement the logic for accepting the file
      const response = await acceptApplication(applicationId, citizentype, dateOfBirth, mobileNo);


      if (response?.status == 0) {
        await fetchApplicationStatus();
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Successfull!</span>
            </div>
          ),
          description: "Case accepted successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Failed to accept file!",
          description: response?.message,
        })
      }
    } catch (e) {
      console.log('Error:', e.message);
      toast({
        variant: "destructive",
        title: "Failed to accept file!",
        description: 'An error occurred',
      })
    }
  }

  const handleViewPPAttachment = (fileNumber) => {
    console.log(`Viewing PP Attachment for file ${fileNumber}`)
    // Implement the logic for viewing the PP attachment
    // This could open a new window or modal with the attachment
  }

  useEffect(() => {
    fetchApplicationStatus()
  }, [searchTerm]) // Added searchTerm as a dependency

  useEffect(() => {
    fetchApplicationStatus()
  }, [refreshFlag]) // Added searchTerm as a dependency

  useEffect(() => setEO_POLICE_STATION(ps), [ps])

  return (
    <div className="container mx-auto px-0 space-y-8 shadow-sm">
      <div className="mt-0 bg-white dark:bg-gray-800 rounded-t-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 px-6 py-3">
          <h2 className="text-2xl font-bold text-white">Total Pending Applications at {EO_POLICE_STATION && EO_POLICE_STATION} PS</h2>
        </div>
      </div>
      <div className="p-6">
        {isDetailsModalOpen && selectedDetails && (
          <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
              </DialogHeader>
              <DialogDescription className="space-y-2">
                These are the details of the passport application.
              </DialogDescription>
              <div className="space-y-2">
                <ul>
                  <li className="text-sm">
                    <span className="font-bold text-md">PV Sequence:</span> {selectedDetails.PVSequenceNo}
                  </li>
                  <li className="text-sm">
                    <span className="font-bold text-md">File Number:</span> {selectedDetails.FileNumber}
                  </li>
                  <li className="text-sm">
                    <span className="font-bold text-md">Email ID:</span> {selectedDetails.EmailID}
                  </li>
                  <li className="text-sm">
                    <span className="font-bold text-md">Applicant Name:</span> {selectedDetails.ApplicantName}
                  </li>
                  <li className="text-sm">
                    <span className="font-bold text-md">Police Station:</span> {selectedDetails.PsName}
                  </li>
                  <li className="text-sm">
                    <span className="font-bold text-md">Phone No:</span> {selectedDetails.PhoneNo}
                  </li>
                  <li className="text-sm">
                    <span className="font-bold text-md">Spouse Name:</span> {selectedDetails.SpouseName}
                  </li>
                  <li className="text-sm">
                    <span className="font-bold text-md">Address:</span> {selectedDetails.VerificationAddress}
                  </li>
                  <li className="text-sm">
                    <span className="font-bold text-md">Gender:</span> {selectedDetails.Gender}
                  </li>
                  <li className="text-sm">
                    <span className="font-bold text-md">Place Of Birth:</span> {selectedDetails.PlaceOfBirth}
                  </li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <div className="flex items-center justify-between mb-6">
          <div className="space-x-2">
            <Button variant="outline" onClick={exportToExcel}>
              Excel
            </Button>
            {/* <Button variant="outline" onClick={exportToPDF}>
              PDF
            </Button>
            <Button variant="outline" onClick={printTable}>
              Print
            </Button> */}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Search:</span>
            <Input
              className="w-64"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="border rounded-lg" id="police-verification-table">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#e6f3ff]">
                <TableHead className="font-semibold">File Number</TableHead>
                <TableHead className="font-semibold">Applicant Name</TableHead>
                <TableHead className="font-semibold">Police Station</TableHead>
                <TableHead className="font-semibold">Phone No.</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">Verification Address</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-6 w-24 bg-slate-200" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32 bg-slate-200" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32 bg-slate-200" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 bg-slate-200" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40 bg-slate-200" /></TableCell>
                      <TableCell><div className="flex gap-2"><Skeleton className="h-10 w-10 rounded-full bg-slate-200" /><Skeleton className="h-10 w-10 rounded-full bg-slate-200" /></div></TableCell>
                    </TableRow>
                  ))
                ) : currentData?.length ?
                  currentData?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row?.FileNumber || "N/A"}</TableCell>
                      <TableCell>{row?.ApplicantName || "N/A"}</TableCell>
                      <TableCell>{row?.PsName || "N/A"}</TableCell>
                      <TableCell>{row?.PhoneNo || "N/A"}</TableCell>
                      <TableCell>{row?.VerificationAddress || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <div className="relative group">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-stone-100 ring-[0.5px] ring-slate-300 text-blue-700 hover:bg-blue-400 hover:text-slate-700 text-xs px-[0.65rem] py-0 rounded-full flex gap-1"
                              onClick={() => router.push(`/applicationDetails/${row?.FileNumber}`)}
                            >
                              <FileUser className="m-0 p-0" />
                            </Button>
                            <span className="absolute left-1/2 -top-11 -translate-x-1/2 scale-0 bg-white shadow-md text-slate-500 text-xs rounded px-2 py-1 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200">
                              View Application
                            </span>
                          </div>

                          <div className="relative group">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-stone-100 ring-[0.5px] ring-slate-300 text-green-700 hover:bg-green-400 hover:text-slate-700 text-xs px-[0.65rem] py-0 rounded-full flex gap-1"
                              onClick={() => {
                                setSelectedDetails(row)
                                setIsFileAcceptModalOpen(true)
                              }}
                            >
                              <CopyCheck className="m-0 p-0" />
                            </Button>
                            <span className="absolute left-1/2 -top-11 -translate-x-1/2 scale-0 bg-white shadow-md text-slate-500 text-xs rounded px-2 py-1 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200">
                              Accept Application
                            </span>
                          </div>
                          {(user_role == 10) &&
                            <div className="relative group">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-gray-100 ring-[0.5px] text-gray-700 hover:bg-teal-400 hover:text-slate-700 text-xs px-[0.65rem] py-0 rounded-full flex gap-1"
                                onClick={handleOpenTransferModal}
                              >
                                <Rotate3d className="mx-0 px-0" />
                              </Button>
                              <span className="absolute left-1/2 -top-11 -translate-x-1/2 scale-0 bg-white shadow-md text-slate-500 text-xs rounded px-2 py-1 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200">
                                Transfer to PS
                              </span>
                              <TransferModal
                                isOpen={isTransferModalOpen}
                                onClose={handleCloseTransferModal}
                                fileNumber={row?.FileNumber}
                                applicantName={row?.ApplicantName}
                                onTransfer={onTransfer} // Pass the function here
                              />
                            </div>
                          }
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : <TableRow>
                    <TableCell className="text-center" colSpan={6}>No record found</TableCell>
                  </TableRow>}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
        {/* {isDetailsModalOpen && selectedDetails && (
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>File Details</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  These are the details of the file.
                </DialogDescription>
                <div className="space-y-2">
                    <div>
                      <li className="list-none">PV Sequence: {selectedDetails.pvSequence}</li>
                    </div>
                    <div>
                      <li className="list-none">File Number: {selectedDetails.fileNumber}</li>
                    </div>
                    <div>
                      <li className="list-none">Status: {selectedDetails.status}</li>
                    </div>
                    <div>
                      <li className="list-none">Applicant Name: {selectedDetails.applicantName}</li>
                    </div>
                    <div>
                      <li className="list-none">Police Station: {selectedDetails.policeStation}</li>
                    </div>
                    <div>
                      <li className="list-none">Phone No: {selectedDetails.phoneNo}</li>
                    </div>
                    <div>
                      <li className="list-none">Date of Birth: {selectedDetails.dateOfBirth}</li>
                    </div>
                  </div>
              </DialogContent>
            </Dialog>
          )} */}
        {isFileAcceptModalOpen && selectedDetails && (
          <FileAcceptModal
            isOpen={isFileAcceptModalOpen}
            onClose={() => setIsFileAcceptModalOpen(false)}
            fileData={selectedDetails}
            onAccept={handleAcceptFile}
          />
        )}
      </div>
    </div >
  )
}

