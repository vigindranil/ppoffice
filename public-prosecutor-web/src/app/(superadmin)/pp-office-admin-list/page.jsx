'use client'

import React, { useState, useEffect } from 'react'
import { showPPOfficeAdminUserList } from '@/app/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClipboardPlus, LoaderCircle, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch, useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { Input } from '@/components/ui/input'
import SmartPagination from '@/components/SmartPagination'

const PPOfficeAdminList = () => {
  const [adminList, setAdminList] = useState([])
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
      showPPOfficeAdminUserList({ EntryuserID: user.AuthorityUserID })
        .then((result) => {
          // console.log(result);
          setAdminList(result);
        })
        .catch((err) => {
          setMessage(err?.message || "An unexpected error occurred");
        })
        .finally(() => {
          setIsLoading(false);
        })

    }
  }, [user])

  const filteredData = adminList?.filter((data) =>
    Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentOfficeAdminlist = filteredData?.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)


  return (
    <div className="relative min-h-screen w-full">
      <div
        className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4">
          <CardHeader>
            <CardTitle>Public Prosecutor Office Admin List</CardTitle>
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
                      placeholder="Search Office Admins..."
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
                      {/* <TableHead className="font-bold">ID</TableHead> */}
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Username</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold">Contact Number</TableHead>
                      <TableHead className="font-bold">License Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOfficeAdminlist?.map((head, index) => (
                      <TableRow key={index}>
                        {/* <TableCell>{head.ppadmin_id}</TableCell> */}
                        <TableCell>{head.ppadmin_name}</TableCell>
                        <TableCell>{head.ppadmin_username}</TableCell>
                        <TableCell>{head.ppadmin_email}</TableCell>
                        <TableCell>{head.ppadmin_contactnumber}</TableCell>
                        <TableCell>{head.ppadmin_licensenumber}</TableCell>
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

export default PPOfficeAdminList



