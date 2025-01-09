'use client'

import React, { useState, useEffect } from 'react'
import { showSPUser, alldistrict } from '@/app/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ClipboardPlus, LoaderCircle, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDispatch, useSelector } from 'react-redux'
import { decrypt } from '@/utils/crypto'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"

const SPList = () => {
  const [spList, setSPList] = useState([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [districtId, setDistrictId] = useState(6);
  const [allDistrictList, setAllDistrictList] = useState([])
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

      alldistrict()
        .then((result) => {
          setAllDistrictList(result);
        })
        .catch((err) => {
          setMessage(err?.message || "An unexpected error occurred");
        });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      showSPUser({
        EntryuserID: user.AuthorityUserID,
        DistrictID: districtId
      })
        .then((result) => {
          setSPList(result);
        })
        .catch((err) => {
          setMessage(err?.message || "An unexpected error occurred");
        })
        .finally(() => {
          setIsLoading(false);
        })
    }
  }, [user, districtId])

  const handleDistrictChange = (value) => {
    setDistrictId(Number(value));
  }

  const filteredData = spList?.filter((data) =>
    Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentSpUserlist = filteredData?.slice(indexOfFirstItem, indexOfLastItem)

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
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
                  {/* District Dropdown */}
                  <div className="flex-1">
                    {/* <Label htmlFor="DistrictID">District</Label> */}
                    <Select
                      onValueChange={handleDistrictChange}
                      value={districtId.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Districts</SelectLabel>
                          <SelectItem value="0">All Districts</SelectItem>
                          {allDistrictList.map((district) => (
                            <SelectItem
                              key={district.districtId}
                              value={district.districtId.toString()}
                            >
                              {district.districtName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Input */}
                  <div className="flex-1 relative">
                    {/* <Label htmlFor="search">Search Office Admins</Label> */}
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        id="search"
                        placeholder="Search Office Admins..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Total Records */}
                <div className="text-right text-xs mt-2">
                  <span>Total number of records: {filteredData.length}</span>
                </div>

                {/* Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">ID</TableHead>
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Username</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold">Contact Number</TableHead>
                      <TableHead className="font-bold">WBP ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSpUserlist?.map((head, index) => (
                      <TableRow key={index}>
                        <TableCell>{head.sp_id}</TableCell>
                        <TableCell>{head.sp_name}</TableCell>
                        <TableCell>{head.sp_username}</TableCell>
                        <TableCell>{head.sp_email}</TableCell>
                        <TableCell>{head.sp_contactnumber}</TableCell>
                        <TableCell>{head.sp_WbpId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
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

export default SPList



