"use client";

import React, { useState, useEffect } from "react";
import { showSPUser, alldistrict } from "@/app/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import { Input } from "@/components/ui/input";

const SPList = () => {
  const [spList, setSPList] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [districtId, setDistrictId] = useState(0);
  const [allDistrictList, setAllDistrictList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({}); // <-- track expanded rows
  const itemsPerPage = 10;

  const dispatch = useDispatch();
  const encryptedUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [user, setUser] = useState("");

  // Simulate loading spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Decrypt user data
  useEffect(() => {
    if (encryptedUser) {
      const decoded_user = JSON.parse(decrypt(encryptedUser));
      setUser(decoded_user);
    }
  }, [encryptedUser]);

  // Fetch all districts once user is available
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

  // Fetch SP User list whenever user or district changes
  useEffect(() => {
    if (user) {
      showSPUser({
        EntryuserID: user.AuthorityUserID,
        DistrictID: districtId,
      })
        .then((result) => {
          setSPList(result);
        })
        .catch((err) => {
          setMessage(err?.message || "An unexpected error occurred");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user, districtId]);

  // Handle district dropdown change
  const handleDistrictChange = (value) => {
    setDistrictId(Number(value));
  };

  // Filter data based on search term
  const filteredData = spList?.filter((data) =>
    Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSpUserlist = filteredData?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle row expansion
  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>

      <main className="relative flex-1 p-6 w-full min-h-screen">
        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4 overflow-hidden">
          <CardHeader className=" text-white bg-green-600 text-xl">
            <CardTitle>Superintendent of Police List</CardTitle>
          </CardHeader>

          <CardContent>
            {message ? (
              <p className="text-red-600 mb-4 text-center">{message}</p>
            ) : (
              <div className="container mx-auto py-5">
                {/* Top controls: District dropdown + Search */}
                {/* Total records */}
                <div className="text-right text-xs mt-2">
                  <span>Total number of records: {filteredData.length}</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
                  {/* District Dropdown */}
                  <div className="flex-1">
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
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
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

                {/* Responsive Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {/* Empty head for the toggle button */}
                        <TableHead className="font-bold"></TableHead>
                        {/* Always visible on small screens */}
                        <TableHead className="font-bold">Name</TableHead>
                        <TableHead className="font-bold">Username</TableHead>
                        {/* Hidden on small screens; visible on md+ */}
                        <TableHead className="font-bold hidden md:table-cell">
                          ID
                        </TableHead>
                        <TableHead className="font-bold hidden md:table-cell">
                          Email
                        </TableHead>
                        <TableHead className="font-bold hidden md:table-cell">
                          Contact Number
                        </TableHead>
                        {/* Hidden on smaller than lg */}
                        <TableHead className="font-bold hidden lg:table-cell">
                          WBP ID
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {isLoading ? (
                        // Skeleton loading rows
                        [...Array(5)].map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="bg-slate-300 h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="bg-slate-300 h-4 w-32" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="bg-slate-300 h-4 w-28" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="bg-slate-300 h-4 w-32" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="bg-slate-300 h-4 w-28" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="bg-slate-300 h-4 w-24" />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Skeleton className="bg-slate-300 h-4 w-24" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : currentSpUserlist?.length > 0 ? (
                        currentSpUserlist.map((head, index) => (
                          <React.Fragment key={index}>
                            <TableRow>
                              <TableCell>
                                {/* Toggle button: only visible on small screens */}
                                <button
                                  className="p-0 lg:hidden"
                                  onClick={() => toggleRowExpansion(index)}
                                >
                                  {expandedRows[index] ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                              </TableCell>

                              {/* Always visible on small screens */}
                              <TableCell>{head.sp_name}</TableCell>
                              <TableCell>{head.sp_username}</TableCell>

                              {/* Visible on md+ */}
                              <TableCell className="hidden md:table-cell">
                                {head.sp_id}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {head.sp_email}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {head.sp_contactnumber}
                              </TableCell>

                              {/* Visible on lg+ */}
                              <TableCell className="hidden lg:table-cell">
                                {head.sp_WbpId}
                              </TableCell>
                            </TableRow>

                            {/* Expanded row for smaller screens */}
                            {expandedRows[index] && (
                              <TableRow className="bg-gray-50 lg:hidden">
                                <TableCell colSpan={10}>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                    {/* ID, Email, Contact Number, WBP ID 
                                        displayed only on small screens (md:hidden) */}
                                    {head.sp_id && (
                                      <div className="md:hidden">
                                        <strong>ID:</strong> {head.sp_id}
                                      </div>
                                    )}
                                    {head.sp_email && (
                                      <div className="md:hidden">
                                        <strong>Email:</strong> {head.sp_email}
                                      </div>
                                    )}
                                    {head.sp_contactnumber && (
                                      <div className="md:hidden">
                                        <strong>Contact:</strong>{" "}
                                        {head.sp_contactnumber}
                                      </div>
                                    )}
                                    {head.sp_WbpId && (
                                      <div className="lg:hidden">
                                        <strong>WBP ID:</strong> {head.sp_WbpId}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            No Data Found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          className={
                            currentPage === 1
                              ? "cursor-pointer opacity-100"
                              : ""
                          }
                        />
                      </PaginationItem>
                      {[...Array(totalPages || 0)].map((_, index) => (
                        <PaginationItem className="cursor-pointer" key={index}>
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
                          onClick={() =>
                            paginate(Math.min(totalPages, currentPage + 1))
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
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
  );
};

export default SPList;
