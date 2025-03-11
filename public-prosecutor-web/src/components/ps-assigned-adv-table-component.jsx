"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, CheckCircle2Icon, Eye, FileCheck2, Loader, MapPin, Search, Trash } from "lucide-react"
import Image from "next/image"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import Cookies from "react-cookies";
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { motion } from "framer-motion";
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { Button } from "./ui/button"
import { postRequest } from "@/app/commonAPI";
import moment from "moment"
import { useSelector } from "react-redux"
import { decrypt } from "@/utils/crypto"

const AssignedTable = ({ documents, isLoadingDocumentTable, identity }) => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [user, setUser] = useState(null)
  const encryptedUser = useSelector((state) => state.auth.user)
  const token = useSelector((state) => state.auth.token)
  const [isLocationDetailsModalOpen, setIsLocationDetailsModalOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState("")
  const [selectedLocationDetails, setSelectedLocationDetails] = useState("")
  const [verifiedResponse, setVerifiedResponse] = useState(null)
  const [verifyElectricityLoading, setVerifyElectricityLoading] = useState(false)
  const [verifyApplicationLoading, setVerifyApplicationLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [docType, setDocType] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userType, setUserType] = useState(null);
  const [zoom, setZoom] = useState(false);
  const userTypeCookies = Cookies.load("type");
  const { toast } = useToast()
  const [type, setType] = useState("")

  const [formData, setFormData] = useState({
      EntryUserID: "",
    })
  
    useEffect(() => {
      const decoded_user = JSON.parse(decrypt(encryptedUser))
      setUser(decoded_user)
      setFormData((prevState) => ({
        ...prevState,
        EntryUserID: decoded_user.AuthorityUserID,
      }))
    }, [encryptedUser])

  const SkeletonLoader = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <TableRow key={index}>
          <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
          <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
          <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
        </TableRow>
      ))}
    </>
  )

  const handleConfirm = () => {
    closeAlert()
    window.location.reload();
  }

  return (
    <>
    <CustomAlertDialog
                isOpen={isOpen}
                alertType={alertType}
                alertMessage={alertMessage}
                onClose={closeAlert}
                onConfirm={handleConfirm}
              />
    <Card className="m-5">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100 hover:bg-slate-100">
                <TableHead>Advocate Name</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>E-mail Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingDocumentTable ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : documents?.length > 0 ? (
                documents.map((doc, index) => (
                  <TableRow key={index}>
                    <TableCell>{doc.advocateName}</TableCell>
                    <TableCell>{doc.advocateContactNumber}</TableCell>
                    <TableCell>{doc.advocateEmail}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No Advocates Assigned</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </>
  )
}

export default AssignedTable

