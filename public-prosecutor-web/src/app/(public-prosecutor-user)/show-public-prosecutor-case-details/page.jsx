'use client'

import React, { useState, useEffect } from 'react'
import { showCaseDetailsUser } from '@/app/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card"
import { ClipboardPlus, LoaderCircle, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch, useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { Input } from '@/components/ui/input'
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button'
import SmartPagination from '@/components/SmartPagination'

const PPAllCaseList = () => {
  const router = useRouter()
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
      setIsLoading(true)
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

  const filteredData = allCaseList?.filter((data) => {
    const lowerSearch = searchTerm.toLowerCase();

    const matchesCaseFields = Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(lowerSearch)
    );

    const matchesReferences = data.references?.some(ref =>
      `${ref.RefferenceNumber} ${ref.CrmName} ${ref.RefferenceYear}`
        .toLowerCase()
        .includes(lowerSearch)
    );

    const matchesIPC = data.ipcSections?.some(ipc =>
      `${ipc.IpcSection} ${ipc.BnsSection} ${ipc.BnsId}`
        .toLowerCase()
        .includes(lowerSearch)
    );

    return matchesCaseFields || matchesReferences || matchesIPC;
  });


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
          <CardHeader className="mb-5 bg-gradient-to-r from-cyan-600 to-violet-600 px-6 py-3">
            <CardTitle className="text-white text-xl">All Case List</CardTitle>
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
                      <TableHead className="font-bold">Case Date</TableHead>
                      <TableHead className="font-bold">Case Number</TableHead>
                      <TableHead className="font-bold">Dept./Dist. Name</TableHead>
                      <TableHead className="font-bold">PS Name</TableHead>
                      <TableHead className="font-bold">Case Type</TableHead>
                      <TableHead className="font-bold">Case Hearing Date</TableHead>
                      <TableHead className="font-bold">IPC Section</TableHead>
                      <TableHead className="font-bold">Reference</TableHead>
                      <TableHead className="font-bold">Case Resources</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentAllCaseList?.map((head, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(head.CaseDate)}</TableCell>
                        <TableCell>{head.CaseNumber}</TableCell>
                        <TableCell>{head.SpName}</TableCell>
                        <TableCell>{head.PsName}</TableCell>
                        <TableCell>{head.CaseType}</TableCell>
                        <TableCell>{formatDate(head.CaseHearingDate)}</TableCell>
                        <TableCell>{head.ipcSections && head.ipcSections.length > 0
                          ? head.ipcSections.map(ipc => ipc.IpcSection).filter(Boolean).join(', ')
                          : 'None'}</TableCell>
                        <TableCell>
                          {head.references && head.references.length > 0 ? (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <span className="cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-200">
                                  {
                                    head.references
                                      .slice(0, 1)
                                      .map((ref, idx) => `${idx + 1}. ${ref.RefferenceNumber} - ${ref.CrmName} (${ref.RefferenceYear})`)
                                  }
                                  {head.references.length > 1 ? '...' : ''}
                                </span>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <ol className="list-decimal list-inside text-sm">
                                  {head.references.map((ref, idx) => (
                                    <li key={idx}>
                                      {ref.RefferenceNumber} - {ref.CrmName} ({ref.RefferenceYear})
                                    </li>
                                  ))}
                                </ol>
                              </HoverCardContent>
                            </HoverCard>
                          ) : (
                            <span>No references</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            className="bg-green-100 hover:bg-green-200 text-sm text-green-600"
                            onClick={() => {
                              const enc_caseId = btoa(head.CaseId)
                              router.push(`/adv-case-library/${enc_caseId}`)
                            }}
                          >
                            <ClipboardPlus className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4">

                  <SmartPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={paginate}
                  />

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



