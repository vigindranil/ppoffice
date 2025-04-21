"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, CheckCircle2Icon, Eye, FileCheck2, Loader, MapPin, Search, Trash } from "lucide-react"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import Cookies from "react-cookies";
import { useToast } from "@/hooks/use-toast"
import { decrypt } from "@/utils/crypto"
import { useSelector } from "react-redux"
import { Button } from "./ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  uploadCaseDocuments,
} from "@/app/api"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getFileName = (path) => {
  return path ? path.split("/").pop().replace(/^[0-9]+_/, "") : "Unknown";
};

const getFileType = (path) => {
  return path ? path.split(".").pop().toUpperCase() : "Unknown";
};

const DocumentTable = ({ documents, isLoadingDocumentTable, identity }) => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [isLocationDetailsModalOpen, setIsLocationDetailsModalOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState("")
  const [upDocuments, setUpDocuments] = useState([]);
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [user, setUser] = useState(null)
  const encryptedUser = useSelector((state) => state.auth.user)
  const token = useSelector((state) => state.auth.token)
  const [isLoading, setIsLoading] = useState(false)
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

  const handleView = async (filePath) => {
    try {
      const fileName = getFileName(filePath);

      // Fetch the file as a binary blob
      const response = await fetch(`${BASE_URL}upload/download?filename=${encodeURIComponent(fileName)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // If authentication is needed
        },
      });

      if (!response.ok) throw new Error("Failed to fetch file");

      const fileBlob = await response.blob(); // Convert response to Blob
      const fileURL = URL.createObjectURL(fileBlob);
      window.open(fileURL, "_blank"); // Open in new tab

    } catch (error) {
      openAlert("error", error.message || "Failed to open document.");
    }
  };

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser))
    setUser(decoded_user)
    setFormData((prevState) => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID,
    }))
  }, [encryptedUser])


  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 50000 * 1024) {
        openAlert("error", `${file.name} exceeds 50 MB.`);
        return false;
      }
      if (!["application/pdf"].includes(file.type)) {
        openAlert("error", `${file.name} is not a valid format (PDF only).`);
        return false;
      }
      return true;
    });

    setUpDocuments(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index) => {
    setUpDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddDoc = async () => {
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const caseId = identity;
      let response = null;

      if (upDocuments.length > 0) {
        response = await uploadCaseDocuments(caseId, upDocuments, user.AuthorityUserID);
      }

      if (response) {
        openAlert("success", "Documents added successfully");
        setUpDocuments([]);
      }

      return response;

    } catch (err) {
      openAlert("error", err?.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const SkeletonLoader = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <TableRow key={index}>
          <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
          <TableCell><div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div></TableCell>
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
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead>Document Name</TableHead>
                    <TableHead>File Type</TableHead>
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
                        <TableCell>{getFileName(doc.caseDocument)}</TableCell>
                        <TableCell>{getFileType(doc.caseDocument)}</TableCell>
                        <TableCell>
                          <Button
                            className="bg-blue-100 hover:bg-blue-200 text-sm text-blue-600"
                            onClick={() => handleView(doc.caseDocument)}
                          >
                            <Eye className="text-blue-600 mr-2 h-4 w-4" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No documents found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1 space-y-2 px-4">
                <Label>Upload Case Documents</Label>
                <Input type="file" multiple onChange={handleFileChange} />

                {upDocuments.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold mb-2">Selected Documents:</p>
                    <ul className="space-y-2">
                      {upDocuments.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                          <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeDocument(index)}
                            className="ml-2"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-sm text-gray-500">Max file size: 50 MB. Allowed formats: PDF</p>
              </div>
            </div>
            <Button onClick={handleAddDoc} className="max-w-min bg-blue-500 mx-auto my-5 mt-5" disabled={isLoading}>
              {isLoading ? "Please Wait..." : "Add Document(s)"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default DocumentTable

