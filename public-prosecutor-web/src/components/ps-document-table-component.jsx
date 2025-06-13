// "use client"
// import { useEffect, useState } from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
// import { AlertCircle, CheckCircle2, CheckCircle2Icon, Eye, FileCheck2, Loader, MapPin, Search, Trash } from "lucide-react"
// import { CustomAlertDialog } from "@/components/custom-alert-dialog"
// import { useAlertDialog } from "@/hooks/useAlertDialog"
// import Image from "next/image"
// import { VisuallyHidden } from "@/components/ui/visually-hidden"
// import Cookies from "react-cookies";
// import { useToast } from "@/hooks/use-toast"
// import { ToastAction } from "@/components/ui/toast"
// import { motion } from "framer-motion";
// import { decrypt } from "@/utils/crypto"
// import { useSelector } from "react-redux"
// import { Button } from "./ui/button"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import {
//   uploadCaseDocuments,
// } from "@/app/api"
// import moment from "moment"

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// const getFileName = (path) => {
//   return path ? path.split("/").pop().replace(/^[0-9]+_/, "") : "Unknown";
// };

// const getFileType = (path) => {
//   return path ? path.split(".").pop().toUpperCase() : "Unknown";
// };

// const DocumentTable = ({ documents, isLoadingDocumentTable, identity }) => {
//   const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
//   const [isLocationDetailsModalOpen, setIsLocationDetailsModalOpen] = useState(false)
//   const [selectedDoc, setSelectedDoc] = useState("")
//   const [upDocuments, setUpDocuments] = useState([]);
//   const [message, setMessage] = useState("")
//   const [error, setError] = useState("")
//   const [user, setUser] = useState(null)
//   const encryptedUser = useSelector((state) => state.auth.user)
//   const token = useSelector((state) => state.auth.token)
//   const [isLoading, setIsLoading] = useState(false)
//   const [selectedLocationDetails, setSelectedLocationDetails] = useState("")
//   const [verifiedResponse, setVerifiedResponse] = useState(null)
//   const [verifyElectricityLoading, setVerifyElectricityLoading] = useState(false)
//   const [verifyApplicationLoading, setVerifyApplicationLoading] = useState(false)
//   const [verified, setVerified] = useState(false)
//   const [docType, setDocType] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [userType, setUserType] = useState(null);
//   const [zoom, setZoom] = useState(false);
//   const userTypeCookies = Cookies.load("type");
//   const { toast } = useToast()
//   const [type, setType] = useState("")

//   const [formData, setFormData] = useState({
//     EntryUserID: "",
//   })

//   const handleView = async (filePath) => {
//     try {
//       const fileName = getFileName(filePath);
      
//       // Fetch the file as a binary blob
//       const response = await fetch(`${BASE_URL}upload/download?filename=${encodeURIComponent(fileName)}`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`, // If authentication is needed
//         },
//       });
  
//       if (!response.ok) throw new Error("Failed to fetch file");
  
//       const fileBlob = await response.blob(); // Convert response to Blob
//       const fileURL = URL.createObjectURL(fileBlob);
//       window.open(fileURL, "_blank"); // Open in new tab
  
//     } catch (error) {
//       openAlert("error", error.message || "Failed to open document.");
//     }
//   }; 

//   useEffect(() => {
//     const decoded_user = JSON.parse(decrypt(encryptedUser))
//     setUser(decoded_user)
//     setFormData((prevState) => ({
//       ...prevState,
//       EntryUserID: decoded_user.AuthorityUserID,
//     }))
//   }, [encryptedUser])

//   const SkeletonLoader = () => (
//     <>
//       {[...Array(3)].map((_, index) => (
//         <TableRow key={index}>
//           <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
//           <TableCell><div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div></TableCell>
//           <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
//         </TableRow>
//       ))}
//     </>
//   )
//   const handleConfirm = () => {
//     closeAlert()
//     window.location.reload();
//   }

//   return (
//     <>
//       <CustomAlertDialog
//         isOpen={isOpen}
//         alertType={alertType}
//         alertMessage={alertMessage}
//         onClose={closeAlert}
//         onConfirm={handleConfirm}
//       />
//       <Card className="m-5">
//         <CardContent className="p-0">
//           <div className="flex flex-col gap-4">
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-slate-100 hover:bg-slate-100">
//                     <TableHead>Document Name</TableHead>
//                     <TableHead>File Type</TableHead>
//                     <TableHead>Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {isLoadingDocumentTable ? (
//                     <TableRow>
//                       <TableCell colSpan={3} className="text-center">Loading...</TableCell>
//                     </TableRow>
//                   ) : documents?.length > 0 ? (
//                     documents.map((doc, index) => (
//                       <TableRow key={index}>
//                         <TableCell>{getFileName(doc.caseDocument)}</TableCell>
//                         <TableCell>{getFileType(doc.caseDocument)}</TableCell>
//                         <TableCell>
//                         <Button
//                             className="bg-blue-100 hover:bg-blue-200 text-sm text-blue-600"
//                             onClick={() => handleView(doc.caseDocument)}
//                           >
//                             <Eye className="text-blue-600 mr-2 h-4 w-4" /> View
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={3} className="text-center">No documents found</TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
            
//           </div>
//         </CardContent>
//       </Card>
//     </>
//   )
// }

// export default DocumentTable

// "use client"
// import { useEffect, useState } from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
// import { AlertCircle, CheckCircle2, CheckCircle2Icon, Eye, FileCheck2, Loader, MapPin, Search, Trash } from "lucide-react"
// import { CustomAlertDialog } from "@/components/custom-alert-dialog"
// import { useAlertDialog } from "@/hooks/useAlertDialog"
// import Cookies from "react-cookies";
// import { useToast } from "@/hooks/use-toast"
// import { decrypt } from "@/utils/crypto"
// import { useSelector } from "react-redux"
// import { Button } from "./ui/button"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import {
//   uploadCaseDocuments,
// } from "@/app/api"

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// const getFileName = (path) => {
//   return path ? path.split("/").pop().replace(/^[0-9]+_/, "") : "Unknown";
// };

// const getFileType = (path) => {
//   return path ? path.split(".").pop().toUpperCase() : "Unknown";
// };

// const DocumentTable = ({ documents, isLoadingDocumentTable, identity }) => {
//   const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
//   const [isLocationDetailsModalOpen, setIsLocationDetailsModalOpen] = useState(false)
//   const [selectedDoc, setSelectedDoc] = useState("")
//   const [upDocuments, setUpDocuments] = useState([]);
//   const [message, setMessage] = useState("")
//   const [error, setError] = useState("")
//   const [user, setUser] = useState(null)
//   const encryptedUser = useSelector((state) => state.auth.user)
//   const token = useSelector((state) => state.auth.token)
//   const [isLoading, setIsLoading] = useState(false)
//   const [selectedLocationDetails, setSelectedLocationDetails] = useState("")
//   const [verifiedResponse, setVerifiedResponse] = useState(null)
//   const [verifyElectricityLoading, setVerifyElectricityLoading] = useState(false)
//   const [verifyApplicationLoading, setVerifyApplicationLoading] = useState(false)
//   const [verified, setVerified] = useState(false)
//   const [docType, setDocType] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [userType, setUserType] = useState(null);
//   const [zoom, setZoom] = useState(false);
//   const userTypeCookies = Cookies.load("type");
//   const { toast } = useToast()
//   const [type, setType] = useState("")

//   const [formData, setFormData] = useState({
//     EntryUserID: "",
//   })

//   const handleView = async (filePath) => {
//     try {
//       const fileName = getFileName(filePath);

//       // Fetch the file as a binary blob
//       const response = await fetch(`${BASE_URL}upload/download?filename=${encodeURIComponent(fileName)}`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`, // If authentication is needed
//         },
//       });

//       if (!response.ok) throw new Error("Failed to fetch file");

//       const fileBlob = await response.blob(); // Convert response to Blob
//       const fileURL = URL.createObjectURL(fileBlob);
//       window.open(fileURL, "_blank"); // Open in new tab

//     } catch (error) {
//       openAlert("error", error.message || "Failed to open document.");
//     }
//   };

//   useEffect(() => {
//     const decoded_user = JSON.parse(decrypt(encryptedUser))
//     setUser(decoded_user)
//     setFormData((prevState) => ({
//       ...prevState,
//       EntryUserID: decoded_user.AuthorityUserID,
//     }))
//   }, [encryptedUser])


//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     const validFiles = files.filter(file => {
//       if (file.size > 50000 * 1024) {
//         openAlert("error", `${file.name} exceeds 50 MB.`);
//         return false;
//       }
//       if (!["application/pdf"].includes(file.type)) {
//         openAlert("error", `${file.name} is not a valid format (PDF only).`);
//         return false;
//       }
//       return true;
//     });

//     setUpDocuments(prev => [...prev, ...validFiles]);
//   };

//   const removeDocument = (index) => {
//     setUpDocuments(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleAddDoc = async () => {
//     setIsLoading(true);
//     setError("");
//     setMessage("");

//     try {
//       const caseId = identity;
//       let response = null;

//       if (upDocuments.length > 0) {
//         response = await uploadCaseDocuments(caseId, upDocuments, user.AuthorityUserID);
//       }

//       if (response) {
//         openAlert("success", "Documents added successfully");
//         setUpDocuments([]);
//       }

//       return response;

//     } catch (err) {
//       openAlert("error", err?.message || "An unknown error occurred.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const SkeletonLoader = () => (
//     <>
//       {[...Array(3)].map((_, index) => (
//         <TableRow key={index}>
//           <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
//           <TableCell><div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div></TableCell>
//           <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
//         </TableRow>
//       ))}
//     </>
//   )
//   const handleConfirm = () => {
//     closeAlert()
//     window.location.reload();
//   }

//   return (
//     <>
//       <CustomAlertDialog
//         isOpen={isOpen}
//         alertType={alertType}
//         alertMessage={alertMessage}
//         onClose={closeAlert}
//         onConfirm={handleConfirm}
//       />
//       <Card className="m-5">
//         <CardContent className="p-0">
//           <div className="flex flex-col gap-4">
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-slate-100 hover:bg-slate-100">
//                     <TableHead>Document Name</TableHead>
//                     <TableHead>File Type</TableHead>
//                     <TableHead>Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {isLoadingDocumentTable ? (
//                     <TableRow>
//                       <TableCell colSpan={3} className="text-center">Loading...</TableCell>
//                     </TableRow>
//                   ) : documents?.length > 0 ? (
//                     documents.map((doc, index) => (
//                       <TableRow key={index}>
//                         <TableCell>{getFileName(doc.caseDocument)}</TableCell>
//                         <TableCell>{getFileType(doc.caseDocument)}</TableCell>
//                         <TableCell>
//                           <Button
//                             className="bg-blue-100 hover:bg-blue-200 text-sm text-blue-600"
//                             onClick={() => handleView(doc.caseDocument)}
//                           >
//                             <Eye className="text-blue-600 mr-2 h-4 w-4" /> View
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={3} className="text-center">No documents found</TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//             <div className="flex space-x-4">
//               <div className="flex-1 space-y-2 px-4">
//                 <Label>Upload Case Documents</Label>
//                 <Input type="file" multiple onChange={handleFileChange} />

//                 {upDocuments.length > 0 && (
//                   <div className="mt-3">
//                     <p className="font-semibold mb-2">Selected Documents:</p>
//                     <ul className="space-y-2">
//                       {upDocuments.map((file, index) => (
//                         <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
//                           <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             onClick={() => removeDocument(index)}
//                             className="ml-2"
//                           >
//                             <Trash className="h-4 w-4" />
//                           </Button>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//                 <p className="text-sm text-gray-500">Max file size: 50 MB. Allowed formats: PDF</p>
//               </div>
//             </div>
//             <Button onClick={handleAddDoc} className="max-w-min bg-blue-500 mx-auto my-5 mt-5" disabled={isLoading}>
//               {isLoading ? "Please Wait..." : "Add Document(s)"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </>
//   )
// }

// export default DocumentTable

"use client"
import React, { useEffect, useState, useCallback } from "react" 
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, CheckCircle2Icon, Eye, FileCheck2, Loader, MapPin, Search, Trash, ChevronDown, ChevronUp } from "lucide-react"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import Cookies from "react-cookies";
import { useToast } from "@/hooks/use-toast"
import { decrypt } from "@/utils/crypto"
import { useSelector } from "react-redux"
import { Button } from "./ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import SmartPagination from "@/components/SmartPagination" 
import { postRequest } from "@/app/commonAPI"
import {
  uploadCaseDocuments
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

  // New states for CRANs and their documents
  const [crans, setCrans] = useState([]);
  const [expandedCranId, setExpandedCranId] = useState(null);
  const [cranDocuments, setCranDocuments] = useState({}); // Stores documents for each CranId: { cranId: [doc1, doc2] }
  const [loadingCrans, setLoadingCrans] = useState(false);
  const [loadingCranDocuments, setLoadingCranDocuments] = useState({}); // { cranId: boolean }

  // Pagination states for CRANs
  const [currentPage, setCurrentPage] = useState(1);
  const cransPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);


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
    if (encryptedUser) {
      const decoded_user = JSON.parse(decrypt(encryptedUser))
      setUser(decoded_user)
    }
  }, [encryptedUser])

  // Memoize fetchCrans to prevent infinite re-renders
  const fetchCrans = useCallback(async () => {
    if (user?.AuthorityUserID && identity) {
      setLoadingCrans(true);
      try {
        const payload = {
          CaseId: identity,
          RefferenceId: "0", // As per API example
          UserId: user.AuthorityUserID,
        };
        const response = await postRequest("get-cran-by-case", payload); 
        if (response && response.status === 0 && Array.isArray(response.data)) {
          setCrans(response.data);
          setTotalPages(Math.ceil(response.data.length / cransPerPage));
          if (response.data.length === 0) {
            openAlert("info", "No CRANs found for this case.");
          }
        } else {
          throw new Error(response?.message || "Failed to fetch CRANs or unexpected data format.");
        }
      } catch (error) {
        console.error("Error fetching CRANs:", error);
        openAlert("error", `Failed to fetch CRANs: ${error.message}`);
      } finally {
        setLoadingCrans(false);
      }
    }
  // }, [user?.AuthorityUserID, identity, openAlert, cransPerPage]); // Dependencies for useCallback
  }, [user?.AuthorityUserID, identity]); 

  // Call fetchCrans only when its dependencies change
  useEffect(() => {
    fetchCrans();
  }, [fetchCrans]); // Now fetchCrans is a stable dependency

  const handleToggleCranDocuments = useCallback(async (cranId) => {
    if (expandedCranId === cranId) {
      setExpandedCranId(null); // Collapse if already expanded
    } else {
      setExpandedCranId(cranId); // Expand this CRAN
      if (!cranDocuments[cranId]) { // Fetch documents only if not already fetched
        setLoadingCranDocuments(prev => ({ ...prev, [cranId]: true }));
        try {
          const payload = {
            CranId: cranId.toString(), // Ensure CranId is a string as per API example
            UserId: user.AuthorityUserID,
          };
          const response = await postRequest("get-doc-by-cran", payload);
          if (response && response.status === 0 && Array.isArray(response.data)) {
            setCranDocuments(prev => ({ ...prev, [cranId]: response.data }));
            if (response.data.length === 0) {
              toast({
                title: "No Documents",
                description: `No documents found for CRAN ${cranId}.`,
                variant: "info",
              });
            }
          } else {
            throw new Error(response?.message || `Failed to fetch documents for CRAN ${cranId}.`);
          }
        } catch (error) {
          console.error(`Error fetching documents for CRAN ${cranId}:`, error);
          openAlert("error", `Failed to fetch documents for CRAN ${cranId}: ${error.message}`);
        } finally {
          setLoadingCranDocuments(prev => ({ ...prev, [cranId]: false }));
        }
      }
    }
  }, [expandedCranId, cranDocuments, user?.AuthorityUserID, openAlert, toast]);


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

  // Get current CRANs for pagination
  const indexOfLastCran = currentPage * cransPerPage;
  const indexOfFirstCran = indexOfLastCran - cransPerPage;
  const currentCrans = crans.slice(indexOfFirstCran, indexOfLastCran);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
              <h3 className="text-lg font-semibold px-4 pt-4">Case Documents</h3>
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
                      <TableRow key={doc.caseDocument || index}>
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

            <div className="overflow-x-auto mt-8">
              <h3 className="text-lg font-semibold px-4 pt-4">CRANs and Associated Documents</h3>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead>CRAN Number</TableHead>
                    <TableHead>CRAN Year</TableHead>
                    <TableHead className="text-center">Documents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCrans ? (
                    <SkeletonLoader />
                  ) : currentCrans.length > 0 ? (
                    currentCrans.map((cran) => (
                      <React.Fragment key={cran.CranId}>
                        <TableRow>
                          <TableCell>{cran.CranNumber}</TableCell>
                          <TableCell>{cran.CranYear}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleCranDocuments(cran.CranId)}
                              className="w-full justify-center"
                            >
                              {expandedCranId === cran.CranId ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-2" /> Hide Documents
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-2" /> Show Documents
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedCranId === cran.CranId && (
                          <TableRow key={`${cran.CranId}-docs`}>
                            <TableCell colSpan={3} className="p-0">
                              <div className="bg-gray-50 p-4">
                                {loadingCranDocuments[cran.CranId] ? (
                                  <div className="flex items-center justify-center p-4">
                                    <Loader className="animate-spin mr-2" /> Loading CRAN documents...
                                  </div>
                                ) : cranDocuments[cran.CranId]?.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-gray-100 hover:bg-gray-100">
                                        <TableHead>Document Name</TableHead>
                                        <TableHead>File Type</TableHead>
                                        <TableHead>Action</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {cranDocuments[cran.CranId].map((doc, docIndex) => (
                                        <TableRow key={doc.DocumentId || docIndex}>
                                          <TableCell>{getFileName(doc.DocumentPath)}</TableCell>
                                          <TableCell>{getFileType(doc.DocumentPath)}</TableCell>
                                          <TableCell>
                                            <Button
                                              className="bg-blue-100 hover:bg-blue-200 text-sm text-blue-600"
                                              onClick={() => handleView(doc.DocumentPath)}
                                            >
                                              <Eye className="text-blue-600 mr-2 h-4 w-4" /> View
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <div className="text-center p-4 text-gray-500">No documents found for this CRAN.</div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No CRANs found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="p-4">
                <SmartPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>

            {/* <div className="flex space-x-4">
              <div className="flex-1 space-y-2 px-4">
                <Label>Upload Case Documents</Label>
                <Input type="file" multiple onChange={handleFileChange} />

                {upDocuments.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold mb-2">Selected Documents:</p>
                    <ul className="space-y-2">
                      {upDocuments.map((file, index) => (
                        <li key={file.name}>
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
            </Button> */}

          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default DocumentTable