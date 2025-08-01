"use client"

import React, { use, useEffect, useState } from "react"
import Sidebar from '@/components/notsidebar'
import Navbar from '@/components/notnavbar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getDetailsApplicationId, getPccCrimeDetails, updateCriminalInfoApi, getDocByCaseId, getAssignedByCaseId, getUnassignedByCaseId, getAssignedDeptByCaseId } from "./api"
import moment, { isMoment } from "moment"
import DocumentTable from "@/components/document-table-component"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import ApplicationStatusHistory from "@/components/application-status-history"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import Cookies from "react-cookies";
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { useSelector } from "react-redux"
import AssignedTable from "@/components/assigned-adv-table-component"
import UnassignedTable from "@/components/unassigned-adv-table-component"
import AssignedDeptTable from "@/components/assigned-dept-table-component-no-action"
import UnassignedDeptTable from "@/components/unassigned-dept-table-component"

export default function Page ({ params }) {
  const unwrappedParams = use(params);
  const { caseId } = unwrappedParams;
  const dec_caseId = decodeURIComponent(caseId);
  const case_id = atob(dec_caseId);
  const encryptedUser = useSelector((state) => state.auth.user)
  const token = useSelector((state) => state.auth.token)
  const [user, setUser] = useState("");
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const FileNumber = case_id;
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [documentDetails, setDocumentsDetails] = useState(null);
  const [assignedDetails, setAssignedDetails] = useState(null);
  const [unassignedDetails, setUnassignedDetails] = useState(null);
  const [assignedDeptDetails, setAssignedDeptDetails] = useState(null);
  const [unassignedDeptDetails, setUnassignedDeptDetails] = useState(null);
  const [isLoadingStatusHistrory, setIsLoadingStatusHistrory] = useState(true)
  const [isLoadingDocumentTable, setIsLoadingDocumentTable] = useState(true)
  const [isLoadingAssignedTable, setIsLoadingAssignedTable] = useState(true)
  const [isLoadingUnassignedTable, setIsLoadingUnassignedTable] = useState(true);
  const [isLoadingCriminalRecordFound, setIsLoadingCriminalRecordFound] = useState(false)
  const [isLoadingCriminalRecordNotFound, setIsLoadingCriminalRecordNotFound] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [kolkataPoliceSelectedRows, setKolkataPoliceSelectedRows] = useState([]);
  const [cidSelectedRows, setCidSelectedRows] = useState([]);
  const [criminalRecordsRemark, setCriminalRecordsRemark] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [PSName, setPSName] = useState("");

  const { toast } = useToast()

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoadingStatusHistrory(true);
        setIsLoadingDocumentTable(true);
  
        const response = await getDocByCaseId(case_id); 
        console.log("Case Docs:", response); 
        setDocumentsDetails(response?.data);
      } catch (e) {
        console.log("Error:", e);
      } finally {
        setIsLoadingStatusHistrory(false);
        setIsLoadingDocumentTable(false);
      }
    };
  
    fetchDocuments(); 
  }, [user]);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        setIsLoadingStatusHistrory(true);
        setIsLoadingAssignedTable(true);
  
        const response = await getAssignedByCaseId(case_id); 
        console.log("Assigned:", response); 
        setAssignedDetails(response?.data);
      } catch (e) {
        console.log("Error:", e);
      } finally {
        setIsLoadingStatusHistrory(false);
        setIsLoadingAssignedTable(false);
      }
    };
  
    fetchAssigned(); 
  }, [user]);

  useEffect(() => {
    const fetchUnassigned = async () => {
      try {
        setIsLoadingStatusHistrory(true);
        setIsLoadingUnassignedTable(true);
  
        const response = await getUnassignedByCaseId(case_id); 
        console.log("Unassigned:", response); 
        setUnassignedDetails(response?.data);
      } catch (e) {
        console.log("Error:", e);
      } finally {
        setIsLoadingStatusHistrory(false);
        setIsLoadingUnassignedTable(false);
      }
    };
  
    fetchUnassigned(); 
  }, [user]);

  useEffect(() => {
    const fetchDeptAssigned = async () => {
      try {
        setIsLoadingStatusHistrory(true);
        setIsLoadingUnassignedTable(true);
  
        const response = await getAssignedDeptByCaseId(case_id); 
        console.log("Dept Assigned:", response); 
        setAssignedDeptDetails(response?.data);
      } catch (e) {
        console.log("Error:", e);
      } finally {
        setIsLoadingStatusHistrory(false);
        setIsLoadingUnassignedTable(false);
      }
    };
  
    fetchDeptAssigned(); 
  }, [user]);

  const handleConfirm = () => {
    closeAlert()
  }

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
          <div className="container mx-auto px-6 py-8">
            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="flex gap-6 justify-center mb-4">
                <TabsTrigger className="rounded-full bg-white hover:text-blue-500 ring-1 ring-slate-500/40 hover:shadow-md data-[state=active]:bg-blue-500 data-[state=active]:text-white" value="documents">Uploaded Documents</TabsTrigger>
              </TabsList>

              {/* Document(s) Uploaded for the Application */}
              <TabsContent value="documents">
                <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3">
                    <h2 className="text-2xl font-bold text-white">Document(s) Uploaded for the Case</h2>
                  </div>
                  <DocumentTable documents={documentDetails} isLoadingDocumentTable={isLoadingDocumentTable} identity={case_id} />
                </div>
              </TabsContent>

            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

