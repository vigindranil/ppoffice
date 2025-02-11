'use client'

import React, { useState, useEffect } from 'react'
import { showCaseDetailsUser } from '@/app/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ClipboardPlus, LoaderCircle, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch, useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { Input } from '@/components/ui/input'

const PPAllCaseList = () => {
  const [allCaseList, setAllCaseList] = useState([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const dispatch = useDispatch()
  const encryptedUser = useSelector((state) => state.auth.user)
  const token = useSelector((state) => state.auth.token)
  const [user, setUser] = useState("");


  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser));
    setUser(decoded_user);
  }, [encryptedUser]);

  useEffect(() => {
    if (user) {
      showCaseDetailsUser(user?.AuthorityUserID)
        .then((result) => {
          // console.log(result);
          setAllCaseList(result);
        })
        .catch((err) => {
          setMessage(err?.message || "An unexpected error occurred");
        })
        .finally(() => {
          setIsLoading(false);
        })

    }
  }, [user])

  const filteredData = allCaseList?.filter((data) =>
    Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAllCaseList = filteredData?.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }


  return (
    <div className="relative min-h-screen w-full">
      <div
        className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4">
          <CardHeader>
            <CardTitle>Case Details List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center">Loading...</p>
            ) : message ? (
              <p className="text-red-600 mb-4 text-center">{message}</p>
            ) : (
              <div className="container mx-auto py-10">
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
                    <TableRow>
                    <TableHead className="font-bold">PP User Name</TableHead>
                    <TableHead className="font-bold">Case Number</TableHead>
                    <TableHead className="font-bold">SP Name</TableHead>
                    <TableHead className="font-bold">PS Name</TableHead>
                    <TableHead className="font-bold">Case Date</TableHead>
                    <TableHead className="font-bold">Case Type</TableHead>
                    <TableHead className="font-bold">Case Hearing Date</TableHead>
                    <TableHead className="font-bold">IPC Section</TableHead>
                    <TableHead className="font-bold">Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAllCaseList?.map((head, index) => (
                      <TableRow key={index}>
                        <TableCell>{head.PPuserName}</TableCell>
                        <TableCell>{head.CaseNumber}</TableCell>
                        <TableCell>{head.SpName}</TableCell>
                        <TableCell>{head.PsName}</TableCell>
                        <TableCell>{formatDate(head.CaseDate)}</TableCell>
                        <TableCell>{head.CaseType}</TableCell>
                        <TableCell>{formatDate(head.CaseHearingDate)}</TableCell>
                        <TableCell>{head.IPCSection}</TableCell>
                        <TableCell>{head.BeginReferenceName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {[...Array(totalPages || 0)].map((_, index) => (
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
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default PPAllCaseList



