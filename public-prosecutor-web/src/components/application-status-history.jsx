"use client"
import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import moment from "moment"

const SkeletonLoader = () => (
  <>
    {[...Array(3)].map((_, index) => (
      <TableRow key={index}>
        <TableCell><div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div></TableCell>
        <TableCell><div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div></TableCell>
        <TableCell><div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div></TableCell>
        <TableCell><div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div></TableCell>
      </TableRow>
    ))}
  </>
)

const ApplicationStatusHistory = ({ status, isLoadingStatusHistrory }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10


  let totalPages = 1
  let startIndex = (currentPage - 1) * itemsPerPage
  let endIndex = startIndex + itemsPerPage
  let currentData = status?.slice(startIndex, endIndex)

  useEffect(() =>{
    if (!isLoadingStatusHistrory) { 
      try{

        totalPages = Math.ceil((status?.length || 0) / itemsPerPage)
        startIndex = (currentPage - 1) * itemsPerPage
        endIndex = startIndex + itemsPerPage
        currentData = status?.slice(startIndex, endIndex)
      }catch(e){
        console.log(e)
      }
    }
  }, [status])

  return (
    <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-3">
        <h2 className="text-2xl font-bold text-white">Application Timeline</h2>
      </div>
      <div className="m-6">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Application State</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Updated Date <small>(DD/MM/YYYY hh:mm:ss)</small></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingStatusHistrory ? (
                    <SkeletonLoader />
                  ) : currentData?.length > 0 ? (
                    currentData.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell>{stat?.FullName}</TableCell>
                        <TableCell>{stat?.UserRole}</TableCell>
                        <TableCell>{stat?.ApplicationState == "EoAccept" ? "Application Accepted By EO" : stat?.ApplicationState == "EoStartVerify" ? "Document Uploaded By EO" : stat?.ApplicationState}</TableCell>
                        <TableCell>{stat?.Remarks ? stat?.Remarks : 'N/A'}</TableCell>
                        <TableCell>{stat?.ApplicationStateUpdatedDateTime ? moment(stat?.ApplicationStateUpdatedDateTime).format("DD/MM/YYYY hh:mm:ss A") : 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No Data Found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {!isLoadingStatusHistrory && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, status?.length)} of {status?.length} entries
                </span>
                <div className="flex items-center space-x-2">
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ApplicationStatusHistory
