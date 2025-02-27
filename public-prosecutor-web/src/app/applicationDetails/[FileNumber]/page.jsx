"use client"

import React, { useEffect, useState } from "react"
import Sidebar from '@/components/sidebar'
import Navbar from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getDetailsApplicationId, getPccCrimeDetails, updateCriminalInfoApi } from "./api"
import moment, { isMoment } from "moment"
import DocumentTable from "@/components/document-table-component"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import ApplicationStatusHistory from "@/components/application-status-history"
import { Badge } from "@/components/ui/badge"
import CrimeAcivityTablePCC from "@/components/crime-activity-verification-pcc"
import CrimeAcivityTableKolkataPolice from "@/components/crime-activity-verification-kolkata-police"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import Cookies from "react-cookies";

export default function Page({ FileNumber }) {
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [isLoadingStatusHistrory, setIsLoadingStatusHistrory] = useState(true)
  const [isLoadingDocumentTable, setIsLoadingDocumentTable] = useState(true);
  const [isLoadingCriminalRecordFound, setIsLoadingCriminalRecordFound] = useState(false)
  const [isLoadingCriminalRecordNotFound, setIsLoadingCriminalRecordNotFound] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [kolkataPoliceSelectedRows, setKolkataPoliceSelectedRows] = useState([]);
  const [cidSelectedRows, setCidSelectedRows] = useState([]);
  const [criminalRecordsRemark, setCriminalRecordsRemark] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [PSName, setPSName] = useState("");

  const { toast } = useToast()

  const fetchData = async (ApplicationId) => {
    try {
      setIsLoadingStatusHistrory(true)
      setIsLoadingDocumentTable(true)
      const response = await getDetailsApplicationId(ApplicationId);
      console.log("Application Details Data:", response);
      setApplicationDetails(response?.data);
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setIsLoadingStatusHistrory(false)
      setIsLoadingDocumentTable(false)
    }
  }

  const handleCriminalRecordFound = async () => {
    try {
      setIsLoadingCriminalRecordFound(true)

      const kolkataPoliceRecord = kolkataPoliceSelectedRows?.length;
      const cidRecord = cidSelectedRows?.length;
      let CriminalRecordType = "";
      let CaseRefferenceNumberKolkataPolice = [];
      let CaseRefferenceNumberCID = [];
      let PSNameKolkataPolice = [];
      let PSNameCID = [];

      if (kolkataPoliceRecord == 0 && cidRecord == 0) {
        toast({
          variant: "destructive",
          title: (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>No criminal records selected!</span>
            </div>
          ),
          description: "Please select any criminal record and then click on this button."
        })
      }

      if (kolkataPoliceRecord && cidRecord) {
        // CriminalRecordType = "Kolkata Police Criminal Record & CID Criminal Record"
        CriminalRecordType = 3
        CaseRefferenceNumberKolkataPolice = kolkataPoliceSelectedRows?.map(record => record?.PROV_CRM_NO || 'N/A');
        CaseRefferenceNumberCID = cidSelectedRows?.map(record => record?.case_ref_id || 'N/A');
        PSNameKolkataPolice = kolkataPoliceSelectedRows?.map(record => record?.PSCODE || 'N/A');
        PSNameCID = cidSelectedRows?.map(record => record?.psName || 'N/A');
      } else if (kolkataPoliceRecord) {
        // CriminalRecordType = "Kolkata Police Criminal Record"
        CriminalRecordType = 1
        CaseRefferenceNumberKolkataPolice = kolkataPoliceSelectedRows?.map(record => record?.PROV_CRM_NO || 'N/A');
        PSNameKolkataPolice = kolkataPoliceSelectedRows?.map(record => record?.PSCODE || 'N/A');
      } else if (cidRecord) {
        // CriminalRecordType = "CID Records"
        CriminalRecordType = 2
        CaseRefferenceNumberCID = cidSelectedRows?.map(record => record?.case_ref_id || 'N/A');
        PSNameCID = cidSelectedRows?.map(record => record?.psName || 'N/A');
      }

      if (kolkataPoliceRecord || cidRecord) {
        const payload = {
          "ApplicationID": FileNumber,
          "CaseRefferenceNumber": JSON.stringify({
            "KolkataPolice": CaseRefferenceNumberKolkataPolice,
            "CID": CaseRefferenceNumberCID,
          }),
          "PSName": JSON.stringify({
            "KolkataPolice": PSNameKolkataPolice,
            "CID": PSNameCID,
          }),
          "CriminalStatus": 1,
          "CriminalStatusRemarks": criminalRecordsRemark || 'N/A',
          "CriminalRecordType": CriminalRecordType,
        }
        const response = await updateCriminalInfoApi(payload);
        if (response?.status == 0) {
          await fetchData();
          toast({
            title: (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Successfull!</span>
              </div>
            ),
            description: "Criminal activity has been verified successfully"
          })
        } else {
          toast({
            variant: "destructive",
            title: (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to update criminal records!</span>
              </div>
            ),
            description: "Please try again later."
          })
        }
        console.log("updateCriminalInfoApi:", response);
      }
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setIsLoadingCriminalRecordFound(false)
    }
  }

  const handleCriminalRecordNotFound = async () => {
    try {
      setIsLoadingCriminalRecordNotFound(true)

      const payload = {
        "ApplicationID": FileNumber,
        "CaseRefferenceNumber": JSON.stringify({}),
        "PSName": JSON.stringify({}),
        "CriminalStatus": 2,
        "CriminalStatusRemarks": criminalRecordsRemark || 'N/A',
        "CriminalRecordType": 0,
      }
      const response = await updateCriminalInfoApi(payload);
      if (response?.status == 0) {
        await fetchData();
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Successfull!</span>
            </div>
          ),
          description: "Criminal activity has been verified successfully"
        })
      } else {
        toast({
          variant: "destructive",
          title: (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to update criminal records!</span>
            </div>
          ),
          description: "Please try again later."
        })
      }
      console.log("updateCriminalInfoApi:", response);

    } catch (e) {
      console.log("Error:", e);
    } finally {
      setIsLoadingCriminalRecordNotFound(false)
    }
  }


  useEffect(() => {
    console.log("FileNumber:", FileNumber);
    FileNumber && fetchData(FileNumber);
    const district = Cookies.load('ds');
    const ps = Cookies.load('ps');

    if (district && ps) {
      setDistrictName(district);
      setPSName(ps);
    }
  }, [FileNumber, verificationSuccess]);


  return (
    <div className="flex bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3">
                <h2 className="text-2xl font-bold text-white">Application Details</h2>
              </div>

              <Card className="m-5">
                <CardContent>
                  {isLoadingStatusHistrory ?
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">File Number</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Applicant Name</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Police Station Name</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Gender</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Date Of Birth</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Place Of Birth</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Spouse Name</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Fathers Name</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">PV Initiation Date</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">PV Request Status</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Permanent Address</span>
                          <div className="h-14 bg-gray-300 rounded w-80 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Verification Address</span>
                          <div className="h-14 bg-gray-300 rounded w-80 animate-pulse"></div>
                        </div>
                      </div>


                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">PV Status Date</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">PV Sequence No</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Email ID</span>
                          <div className="h-4 bg-gray-300 rounded w-34 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Phone No.</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                    </div>
                    :
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">File Number</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.FileNumber || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Applicant Name</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.ApplicantName || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Police Station Name</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.Ps_Name || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Gender</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.Gender || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Date Of Birth</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.DateOfBirth ? moment(applicationDetails?.applicationDetails?.DateOfBirth).format('DD/MM/YYYY') : 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Place Of Birth</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.PlaceOfBirth || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Spouse Name</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.SpouseName || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Fathers Name</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.FathersName || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">PV Initiation Date</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.PVInitiationDate || 'N/A' ? moment(applicationDetails?.applicationDetails?.PVInitiationDate).format('DD/MM/YYYY') : 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">PV Request Status</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.PVRequestStatus || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Permanent Address</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.PermanentAddress || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Verification Address</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.VerificationAddress || 'N/A'}</span>
                        </div>
                      </div>


                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">PV Status Date</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.PVStatusDate || 'N/A' ? moment(applicationDetails?.applicationDetails?.PVStatusDate).format('DD/MM/YYYY') : 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">PV Sequence No</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.PVSequenceNo || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Email ID</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.EmailID || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Phone No.</span>
                          <span className="text-base">
                            {applicationDetails?.applicationDetails?.PhoneNo}
                          </span>
                        </div>
                      </div>

                    </div>
                  }
                </CardContent>
              </Card>
            </div>

            {(applicationDetails?.applicationDetails?.AadharVerifiedstatus !== null && applicationDetails?.applicationDetails?.AadharVerifiedstatus !== 0) && <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-300 px-6 py-3">
                <h2 className="text-2xl font-bold text-white">AADHAAR Details</h2>
              </div>

              <Card className="m-5">
                <CardContent>
                  {isLoadingStatusHistrory ?
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Number</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Name</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Father Name</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Address</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Gender</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Date Of Birth</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Verified Status</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Verified By</span>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    :
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Number</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.AadharNumber ? "XXXXXXXX" + atob(applicationDetails?.applicationDetails?.AadharNumber).slice(-4) : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Name</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.AadharName || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Father Name</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.AadharFathername || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 my-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Address</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.AadharAddress || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Gender</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.AadharGender || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Date Of Birth</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.AadharDOB ? moment(applicationDetails?.applicationDetails?.DateOfBirth).format('DD/MM/YYYY') : 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Verified Status</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.AadharVerifiedstatus == 1 ? <Badge className="bg-emerald-400 hover:bg-emerald-400">matched</Badge> : <Badge className="bg-red-500 hover:bg-red-500">not machted</Badge>}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-500">Aadhaar Verified By</span>
                          <span className="text-base">{applicationDetails?.applicationDetails?.AadharVerifiedby}</span>
                        </div>
                      </div>
                    </div>
                  }
                </CardContent>
              </Card>
            </div>}


            <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3">
                <h2 className="text-2xl font-bold text-white">Document(s) Uploaded for the Application</h2>
              </div>
              <DocumentTable fileNo={FileNumber} documents={applicationDetails?.documents} docPath={applicationDetails?.filepath} isLoadingDocumentTable={isLoadingDocumentTable} verificationSuccess={setVerificationSuccess} />
            </div>

            {/* Crime Activity Verification */}
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden min-h-[200px]">
              <div className="bg-gradient-to-r from-violet-600 to-amber-600 px-6 py-3">
                <h2 className="text-2xl font-bold text-white">Criminal Activity Verification</h2>
              </div>
              {
                isLoadingStatusHistrory ? 
                <div className="space-y-2 w-full min-h-[200px] h-full py-10 flex justify-center items-baseline">
                  <div className="flex flex-col w-full min-h-[200px] text-center justify-center items-center text-gray-400">Loading...</div>
                </div>
                  :
                  (applicationDetails?.applicationDetails?.CriminalStatus == 1) ?
                    <>
                      <div className="space-y-2 w-full min-h-[200px] h-full py-10 flex justify-center items-baseline">
                        <div className="flex flex-col w-full min-h-[200px] text-center justify-center items-center">
                          <span className="text-base font-medium text-red-500 flex gap-1 items-center"><AlertCircle /> Criminal Record(s) Found</span>
                          <div className="flex flex-col justify-start items-start w-auto max-w-[600px] py-2">
                            <span className="text-sm text-gray-500 mb-2"><b className="text-black">Grounds for Criminal Records:</b> {applicationDetails?.applicationDetails?.CriminalRecordType == 3 ? 'Kolkata Police Criminal Records & C.I.D Criminal Records' : applicationDetails?.applicationDetails?.CriminalRecordType == 2 ? 'C.I.D Criminal Record' : 'Kolkata Police Criminal Records'}</span>
                            <span className="text-sm text-gray-500 mb-2"><b className="text-black">Verified By:</b> {applicationDetails?.applicationDetails?.CriminalRecoedVerifiedby}</span>
                            <span className="text-sm text-gray-500 mb-2"><b className="text-black">Case Reference No. (Kolkata Police Records):</b> {applicationDetails?.applicationDetails?.CaseRefferenceNumber ? JSON.parse(applicationDetails?.applicationDetails?.CaseRefferenceNumber)?.KolkataPolice?.join(", ") : 'N/A'}</span>
                            <span className="text-sm text-gray-500 mb-2"><b className="text-black">Police Station. (Kolkat Police Records):</b> {applicationDetails?.applicationDetails?.CriminalRecordPsName ? JSON.parse(applicationDetails?.applicationDetails?.CriminalRecordPsName)?.KolkataPolice?.join(", ") : 'N/A'}</span>
                            <span className="text-sm text-gray-500 mb-2"><b className="text-black">Case Reference No. (CID Records):</b> {applicationDetails?.applicationDetails?.CaseRefferenceNumber ? JSON.parse(applicationDetails?.applicationDetails?.CaseRefferenceNumber)?.CID?.join(", ") : 'N/A'}</span>
                            <span className="text-sm text-gray-500 mb-2"><b className="text-black">Police Station. (CID Records):</b> {applicationDetails?.applicationDetails?.CriminalRecordPsName ? JSON.parse(applicationDetails?.applicationDetails?.CriminalRecordPsName)?.CID?.join(", ") : 'N/A'}</span>
                            <span className="text-justify text-sm text-gray-500 mb-2"><b className="text-black">Remarks:</b> {applicationDetails?.applicationDetails?.CrimalRemarks || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </> :
                    (applicationDetails?.applicationDetails?.CriminalStatus == 2) ?
                      <>
                        <div className="space-y-2 w-full min-h-[200px] h-full py-10 flex justify-center items-baseline">
                          <div className="flex flex-col w-full min-h-[200px] text-center justify-center items-center">
                            <span className="text-base font-medium text-gray-500">No Criminal Records Found</span>
                            <div className="flex flex-col justify-start items-start w-auto max-w-[500px] py-2">
                              <span className="text-sm"><b>Verified By:</b> {applicationDetails?.applicationDetails?.CriminalRecoedVerifiedby}</span>
                              <span className="text-justify text-sm"><b>Remarks:</b> {applicationDetails?.applicationDetails?.CrimalRemarks || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </> :
                      <>
                        {/* Kolkata Police Crime Records */}
                        < CrimeAcivityTableKolkataPolice applicant_details={applicationDetails?.applicationDetails} selectedRows={kolkataPoliceSelectedRows} setSelectedRows={setKolkataPoliceSelectedRows} />

                        {/* PCC Criminal Records */}
                        <CrimeAcivityTablePCC ApplicantName={applicationDetails?.applicationDetails?.ApplicantName} FathersName={applicationDetails?.applicationDetails?.FathersName} selectedRows={cidSelectedRows} setSelectedRows={setCidSelectedRows} />

                        <div className="flex justify-center px-5 py-5 gap-2 flex-col">
                          <div className="w-full">
                            <Textarea className="w-[60%] mx-auto border-2" placeholder="Enter any remarks (optional)" value={criminalRecordsRemark} onChange={(e) => setCriminalRecordsRemark(e.target.value)}></Textarea>
                          </div>
                          <div className="w-full flex justify-center gap-2">

                            <Button disabled={isLoadingCriminalRecordFound} variant="destructive" className="text-sm py-2 px-3 rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
                              onClick={() => handleCriminalRecordFound()}>
                              {isLoadingCriminalRecordFound ? 'Please Wait...' : 'Criminal Record(s) Found'}
                            </Button>
                            <Button disabled={isLoadingCriminalRecordNotFound} variant="secondary" className="text-sm py-2 px-3 rounded-md shadow-sm border-2 hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                              onClick={() => handleCriminalRecordNotFound()
                              }>
                              {isLoadingCriminalRecordNotFound ? 'Please Wait...' : 'Criminal Record Not Found'}
                            </Button>
                          </div>
                        </div>
                      </>

              }


            </div>

            <ApplicationStatusHistory status={applicationDetails?.status} isLoadingStatusHistrory={isLoadingStatusHistrory} />
          </div>
        </main>
      </div>
    </div>
  )
}

