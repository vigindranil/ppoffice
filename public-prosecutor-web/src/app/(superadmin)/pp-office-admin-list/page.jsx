"use client";

import React, { useState, useEffect } from "react";
import { showPPOfficeAdminUserList } from "@/app/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  ClipboardPlus,
  LoaderCircle,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const PPOfficeAdminList = () => {
  const [adminList, setAdminList] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({}); // For tracking expanded rows on small screens
  const itemsPerPage = 10;
  const dispatch = useDispatch();
  const encryptedUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [user, setUser] = useState("");

  useEffect(() => {
    if (encryptedUser) {
      const decoded_user = JSON.parse(decrypt(encryptedUser));
      setUser(decoded_user);
    }
  }, [encryptedUser]);

  useEffect(() => {
    if (user) {
      showPPOfficeAdminUserList({ EntryuserID: user.AuthorityUserID })
        .then((result) => {
          setAdminList(result);
        })
        .catch((err) => {
          setMessage(err?.message || "An unexpected error occurred");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user]);

  const filteredData = adminList?.filter((data) =>
    Object.values(data).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOfficeAdminlist = filteredData?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <Card className="overflow-hidden">
          <CardHeader className=" text-white bg-green-600 text-xl">
            <CardTitle className="">
              Public Prosecutor Office Admin List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {message ? (
              <p className="text-red-600 mb-4 text-center">{message}</p>
            ) : (
              <div className="container mx-auto py-10">
                {/* Top controls: Search & total records */}
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
                    <span className="mr-2 text-xs">
                      Total number of records: {filteredData.length}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {/* Column for the toggle button on small screens */}
                        <TableHead className="font-bold"></TableHead>
                        {/* Always visible columns */}
                        <TableHead className="font-bold">Name</TableHead>
                        <TableHead className="font-bold">Username</TableHead>
                        {/* Visible on md+ */}
                        <TableHead className="font-bold hidden md:table-cell">
                          Email
                        </TableHead>
                        <TableHead className="font-bold hidden md:table-cell">
                          Contact Number
                        </TableHead>
                        {/* Visible on lg+ */}
                        <TableHead className="font-bold hidden lg:table-cell">
                          License Number
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        // Skeleton loading rows while data is being fetched
                        [...Array(5)].map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="bg-slate-300 h-4 w-4" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="bg-slate-300 h-4 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="bg-slate-300 h-4 w-20" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="bg-slate-300 h-4 w-24" />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Skeleton className="bg-slate-300 h-4 w-20" />
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Skeleton className="bg-slate-300 h-4 w-24" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : currentOfficeAdminlist?.length > 0 ? (
                        currentOfficeAdminlist.map((admin, index) => (
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
                              {/* Always visible columns */}
                              <TableCell>{admin.ppadmin_name}</TableCell>
                              <TableCell>{admin.ppadmin_username}</TableCell>
                              {/* Visible on md+ */}
                              <TableCell className="hidden md:table-cell">
                                {admin.ppadmin_email}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {admin.ppadmin_contactnumber}
                              </TableCell>
                              {/* Visible on lg+ */}
                              <TableCell className="hidden lg:table-cell">
                                {admin.ppadmin_licensenumber}
                              </TableCell>
                            </TableRow>
                            {/* Expanded row for additional details on small screens */}
                            {expandedRows[index] && (
                              <TableRow className="bg-gray-50 lg:hidden">
                                <TableCell colSpan={6}>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                    {admin.ppadmin_email && (
                                      <div>
                                        <strong>Email:</strong>{" "}
                                        {admin.ppadmin_email}
                                      </div>
                                    )}
                                    {admin.ppadmin_contactnumber && (
                                      <div>
                                        <strong>Contact Number:</strong>{" "}
                                        {admin.ppadmin_contactnumber}
                                      </div>
                                    )}
                                    {admin.ppadmin_licensenumber && (
                                      <div>
                                        <strong>License Number:</strong>{" "}
                                        {admin.ppadmin_licensenumber}
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
                          <TableCell colSpan={6} className="text-center">
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
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
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

export default PPOfficeAdminList;
