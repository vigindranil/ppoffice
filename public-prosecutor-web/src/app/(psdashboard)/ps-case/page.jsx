// 'use client'

// import { useState, useEffect } from 'react'
// import AdminSidebarLayout from "@/components/sidebar-layout"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Skeleton } from "@/components/ui/skeleton"

// export default function CasesPage() {
//   const [cases, setCases] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     const fetchCases = async () => {
//       try {
//         const response = await fetch('http://localhost:8000/api/showallCasesBypsId?psId=355')
//         if (!response.ok) {
//           throw new Error('Failed to fetch cases')
//         }
//         const data = await response.json()
//         if (data.status === 0 && data.message === "Data found") {
//           setCases(data.data)
//         } else {
//           throw new Error(data.message || 'Failed to fetch cases')
//         }
//       } catch (err) {
//         setError(err.message)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchCases()
//   }, [])

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A'
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//   }

//   return (
//     <AdminSidebarLayout>
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle>All Cases</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="space-y-2">
//               <Skeleton className="h-4 w-full" />
//               <Skeleton className="h-4 w-full" />
//               <Skeleton className="h-4 w-full" />
//             </div>
//           ) : error ? (
//             <div className="text-red-500">{error}</div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Case Number</TableHead>
//                   <TableHead>PP User Name</TableHead>
//                   <TableHead>SP Name</TableHead>
//                   <TableHead>PS Name</TableHead>
//                   <TableHead>Case Date</TableHead>
//                   <TableHead>Case Type</TableHead>
//                   <TableHead>Hearing Date</TableHead>
//                   <TableHead>IPC Section</TableHead>
//                   <TableHead>Reference Number</TableHead>
//                   <TableHead>Begin Reference Name</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {cases.map((caseItem) => (
//                   <TableRow key={caseItem.CaseId}>
//                     <TableCell>{caseItem.CaseNumber || 'N/A'}</TableCell>
//                     <TableCell>{caseItem.PPuserName || 'N/A'}</TableCell>
//                     <TableCell>{caseItem.SpName}</TableCell>
//                     <TableCell>{caseItem.PsName}</TableCell>
//                     <TableCell>{formatDate(caseItem.CaseDate)}</TableCell>
//                     <TableCell>{caseItem.CaseType}</TableCell>
//                     <TableCell>{formatDate(caseItem.CaseHearingDate)}</TableCell>
//                     <TableCell>{caseItem.IPCSection}</TableCell>
//                     <TableCell>{caseItem.ReferenceNumber}</TableCell>
//                     <TableCell>{caseItem.BeginReferenceName}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </AdminSidebarLayout>
//   )
// }


// 'use client'

// import { useEffect, useState } from 'react'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
// import { LoaderCircle, Eye } from 'lucide-react'
// import { Badge } from "@/components/ui/badge";
// import { BASE_URL } from '@/app/constants'

// export default function CaseTableByPsId() {
//   const [cases, setCases] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [selectedCase, setSelectedCase] = useState(null)
//   const [isCaseSelected, setIsCaseSelected] = useState(false)

//   const [currentPage, setCurrentPage] = useState(1)
//   const casesPerPage = 10

//   const fetchCases = async (psId) => {
//     try {
//       const response = await fetch(`${BASE_URL}showallCasesBypsId?psId=${psId}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch cases');
//       }

//       const result = await response.json();
//       if (result.status === 0) {
//         return result.data || [];  // Return data on success
//       } else {
//         throw new Error(result.message || 'Failed to fetch cases');
//       }
//     } catch (error) {
//       throw error;  // Rethrow error to be handled outside
//     }
//   };

//   useEffect(() => {
//     fetchCases()
//   }, [])

//   const indexOfLastCase = currentPage * casesPerPage
//   const indexOfFirstCase = indexOfLastCase - casesPerPage
//   const currentCases = cases.slice(indexOfFirstCase, indexOfLastCase)

//   const totalPages = Math.ceil(cases.length / casesPerPage)

//   const paginate = (pageNumber) => setCurrentPage(pageNumber)

//   if (loading) return <div className="text-center py-10"><LoaderCircle className="animate-spin mx-auto" /></div>
//   if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>

//   return (
//     <div className="container mx-auto py-10">
//       <Table>
//         <TableHeader>
//           <TableRow className="bg-slate-100">
//             <TableHead className="font-bold">SP Name</TableHead>
//             <TableHead className="font-bold">PS Name</TableHead>
//             <TableHead className="font-bold">Case Date</TableHead>
//             <TableHead className="font-bold">Case Type</TableHead>
//             <TableHead className="font-bold">IPC Section</TableHead>
//             <TableHead className="font-bold">Action</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {currentCases.map((caseItem, index) => (
//             <TableRow key={index}>
//               <TableCell>{caseItem.SpName || 'N/A'}</TableCell>
//               <TableCell>{caseItem.PsName || 'N/A'}</TableCell>
//               <TableCell>{new Date(caseItem.CaseDate).toLocaleDateString() || 'N/A'}</TableCell>
//               <TableCell>{caseItem.CaseType || 'N/A'}</TableCell>
//               <TableCell>{caseItem.IPCSection || 'N/A'}</TableCell>
//               <TableCell>
//                 <Dialog open={isCaseSelected} onOpenChange={setIsCaseSelected}>
//                   <DialogTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className=""
//                       onClick={() => {
//                         setSelectedCase(caseItem)
//                         setIsCaseSelected(true)
//                       }}
//                     >
//                       <Eye /> More Details
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent>
//                     <DialogHeader>
//                       <DialogTitle>Case Details</DialogTitle>
//                     </DialogHeader>
//                     <DialogDescription>
//                       View more details about the case below.
//                     </DialogDescription>
//                     <Card>
//                       <CardHeader>
//                         <CardTitle>Case Information</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         {selectedCase && (
//                           <div className="space-y-2">
//                             <p><strong>SP Name:</strong> {selectedCase.SpName}</p>
//                             <p><strong>PS Name:</strong> {selectedCase.PsName}</p>
//                             <p><strong>Case Date:</strong> {new Date(selectedCase.CaseDate).toLocaleDateString()}</p>
//                             <p><strong>Case Type:</strong> {selectedCase.CaseType}</p>
//                             <p><strong>IPC Section:</strong> {selectedCase.IPCSection}</p>
//                             <p><strong>Reference Number:</strong> {selectedCase.ReferenceNumber}</p>
//                             <p><strong>Begin Reference Name:</strong> {selectedCase.BeginReferenceName}</p>
//                           </div>
//                         )}
//                       </CardContent>
//                     </Card>
//                   </DialogContent>
//                 </Dialog>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//       <div className="mt-4">
//         <Pagination>
//           <PaginationContent>
//             <PaginationItem>
//               <PaginationPrevious
//                 onClick={() => paginate(Math.max(1, currentPage - 1))}
//                 className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
//               />
//             </PaginationItem>
//             {[...Array(totalPages)].map((_, index) => (
//               <PaginationItem key={index}>
//                 <PaginationLink
//                   onClick={() => paginate(index + 1)}
//                   isActive={currentPage === index + 1}
//                 >
//                   {index + 1}
//                 </PaginationLink>
//               </PaginationItem>
//             ))}
//             <PaginationItem>
//               <PaginationNext
//                 onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
//                 className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
//               />
//             </PaginationItem>
//           </PaginationContent>
//         </Pagination>
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { LoaderCircle, Eye } from 'lucide-react'
import { fetchCases } from '@/app/api'

export default function CaseTable() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCase, setSelectedCase] = useState(null)
  const [isCaseSelected, setIsCaseSelected] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const casesPerPage = 10

  useEffect(() => {
    const loadCases = async () => {
      setLoading(true)
      try {
        const fetchedCases = await fetchCases(355) // Hardcoded psId for this example
        setCases(fetchedCases)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCases()
  }, [])

  const indexOfLastCase = currentPage * casesPerPage
  const indexOfFirstCase = indexOfLastCase - casesPerPage
  const currentCases = cases.slice(indexOfFirstCase, indexOfLastCase)

  const totalPages = Math.ceil(cases.length / casesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) return <div className="text-center py-10"><LoaderCircle className="animate-spin mx-auto" /></div>
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-100">
            <TableHead className="font-bold">SP Name</TableHead>
            <TableHead className="font-bold">PS Name</TableHead>
            <TableHead className="font-bold">Case Date</TableHead>
            <TableHead className="font-bold">Case Type</TableHead>
            <TableHead className="font-bold">IPC Section</TableHead>
            <TableHead className="font-bold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentCases.map((caseItem) => (
            <TableRow key={caseItem.CaseId}>
              <TableCell>{caseItem.SpName || 'N/A'}</TableCell>
              <TableCell>{caseItem.PsName || 'N/A'}</TableCell>
              <TableCell>{new Date(caseItem.CaseDate).toLocaleDateString() || 'N/A'}</TableCell>
              <TableCell>{caseItem.CaseType || 'N/A'}</TableCell>
              <TableCell>{caseItem.IPCSection || 'N/A'}</TableCell>
              <TableCell>
                <Dialog open={isCaseSelected} onOpenChange={setIsCaseSelected}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCase(caseItem)
                        setIsCaseSelected(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> More Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Case Details</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                      View more details about the case below.
                    </DialogDescription>
                    <Card>
                      <CardHeader>
                        <CardTitle>Case Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedCase && (
                          <div className="space-y-2">
                            <p><strong>SP Name:</strong> {selectedCase.SpName}</p>
                            <p><strong>PS Name:</strong> {selectedCase.PsName}</p>
                            <p><strong>Case Date:</strong> {new Date(selectedCase.CaseDate).toLocaleDateString()}</p>
                            <p><strong>Case Type:</strong> {selectedCase.CaseType}</p>
                            <p><strong>IPC Section:</strong> {selectedCase.IPCSection}</p>
                            <p><strong>Reference Number:</strong> {selectedCase.ReferenceNumber}</p>
                            <p><strong>Begin Reference Name:</strong> {selectedCase.BeginReferenceName}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => paginate(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      </Table>

    </>
  )
}
