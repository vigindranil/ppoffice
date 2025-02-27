"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, CheckCircle2Icon, Eye, FileCheck2, Loader, MapPin, Search, Trash } from "lucide-react"
import Image from "next/image"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { getBirthCertificateDetails, getWBSEDCLDetails, verifyApplication } from "@/app/applicationDetails/[FileNumber]/api"
import Cookies from "react-cookies";
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { motion } from "framer-motion";
import { Button } from "./ui/button"
import moment from "moment"

const AssignedTable = ({ documents, isLoadingDocumentTable }) => {
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

  const SkeletonLoader = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <TableRow key={index}>
          <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
          <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
        </TableRow>
      ))}
    </>
  )

  return (
    <Card className="m-5">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100 hover:bg-slate-100">
                <TableHead>Advocate Name</TableHead>
                <TableHead>Action</TableHead>
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
                    <TableCell>
                      <Button
                        className="bg-blue-100 hover:bg-blue-200 text-sm text-blue-600"
                        onClick={() =>  window.open(`${PORT_URL}${doc.caseDocument}`, "_blank")}
                      >
                        <Trash className="text-blue-600 mr-2 h-4 w-4" /> Remove
                      </Button>
                    </TableCell>
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
  )
}

export default AssignedTable

