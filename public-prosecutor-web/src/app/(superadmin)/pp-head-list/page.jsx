'use client'

import React, { useState, useEffect } from 'react'
import { showPPOfficeHeadUserList } from '@/app/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, FileSpreadsheet, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch, useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { Input } from '@/components/ui/input'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import SmartPagination from '@/components/SmartPagination'

const PPHeadList = () => {
  const [headList, setHeadList] = useState([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState({})
  const itemsPerPage = 10
  const dispatch = useDispatch()
  const encryptedUser = useSelector((state) => state.auth.user)
  const [user, setUser] = useState("")

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser))
    setUser(decoded_user)
  }, [encryptedUser])

  useEffect(() => {
    if (user) {
      showPPOfficeHeadUserList({ EntryuserID: user.AuthorityUserID })
        .then((result) => {
          setHeadList(result)
        })
        .catch((err) => {
          setMessage(err?.message || "An unexpected error occurred")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [user])

  const filteredData = headList?.filter((data) =>
    Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPageHeadlist = filteredData?.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const toggleRowExpansion = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "PP_Head_List")
    XLSX.writeFile(workbook, "pp_head_list.xlsx")
  }

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Public Prosecutor Head List</CardTitle>
            <Button onClick={downloadExcel} className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </Button>
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
                      placeholder="Search Head officials..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div>
                    <span className="mr-2 text-xs">Total number of records: {filteredData.length}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold"></TableHead>
                        <TableHead className="font-bold">Name</TableHead>
                        <TableHead className="font-bold hidden sm:table-cell">Username</TableHead>
                        <TableHead className="font-bold hidden md:table-cell">Email</TableHead>
                        <TableHead className="font-bold hidden md:table-cell">Contact Number</TableHead>
                        <TableHead className="font-bold hidden lg:table-cell">License Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPageHeadlist?.map((head, index) => (
                        <React.Fragment key={index}>
                          <TableRow>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 lg:hidden"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                {expandedRows[index] ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>{head.ppHeaduser_name}</TableCell>
                            <TableCell className="hidden sm:table-cell">{head.ppHeaduser_username}</TableCell>
                            <TableCell className="hidden md:table-cell">{head.ppHeadpuser_email}</TableCell>
                            <TableCell className="hidden md:table-cell">{head.ppHeaduser_contactnumber}</TableCell>
                            <TableCell className="hidden lg:table-cell">{head.ppHeaduser_licensenumber}</TableCell>
                          </TableRow>
                          {expandedRows[index] && (
                            <TableRow className="bg-gray-50 lg:hidden">
                              <TableCell colSpan={10}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                  {head.ppHeaduser_username && (
                                    <div className="sm:hidden"><strong>Username:</strong> {head.ppHeaduser_username}</div>
                                  )}
                                  {head.ppHeadpuser_email && (
                                    <div className="md:hidden"><strong>E-mail:</strong> {head.ppHeadpuser_email}</div>
                                  )}
                                  {head.ppHeaduser_contactnumber && (
                                    <div className="md:hidden"><strong>Contact Number:</strong> {head.ppHeaduser_contactnumber}</div>
                                  )}
                                  {head.ppHeaduser_licensenumber && (
                                    <div className="lg:hidden"><strong>License Number:</strong> {head.ppHeaduser_licensenumber}</div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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

export default PPHeadList

