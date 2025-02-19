"use client";

import React, { useState, useEffect } from "react";
import { showPPOfficeHeadUserList } from "@/app/api";
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
import { ChevronDown, ChevronUp, FileSpreadsheet, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PPHeadList = () => {
  const [headList, setHeadList] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const itemsPerPage = 10;
  const dispatch = useDispatch();
  const encryptedUser = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser));
    setUser(decoded_user);
  }, [encryptedUser]);

  useEffect(() => {
    if (user) {
      showPPOfficeHeadUserList({ EntryuserID: user.AuthorityUserID })
        .then((result) => {
          setHeadList(result);
        })
        .catch((err) => {
          setMessage(err?.message || "An unexpected error occurred");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user]);

  const filteredData = headList?.filter((data) =>
    Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageHeadlist = filteredData?.slice(
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

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PP_Head_List");
    XLSX.writeFile(workbook, "pp_head_list.xlsx");
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen overflow-hidden">
        <Card className="w-full max-w-6xl overflow-hidden mx-auto bg-white/100 backdrop-blur-sm my-4">
          <CardHeader className="flex flex-row items-center justify-between mb-5 bg-green-600 p-4 text-xl text-white">
            <CardTitle>Public Prosecutor Head List</CardTitle>
            <div className="flex justify-end mb-4">
              <Button
                onClick={downloadExcel}
                className="bg-slate-200 text-black"
              >
                <FileSpreadsheet className="h-4 w-4 text-black" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                  <span className="mr-2 text-xs">
                    Total number of records: {filteredData.length}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* Column for toggle button on small screens */}
                      <TableHead className="font-bold"></TableHead>
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold hidden sm:table-cell">
                        Username
                      </TableHead>
                      <TableHead className="font-bold hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="font-bold hidden md:table-cell">
                        Contact Number
                      </TableHead>
                      <TableHead className="font-bold hidden lg:table-cell">
                        License Number
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Render skeleton rows while loading
                      [...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
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
                    ) : message ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-red-600"
                        >
                          {message}
                        </TableCell>
                      </TableRow>
                    ) : currentPageHeadlist?.length > 0 ? (
                      currentPageHeadlist.map((head, index) => (
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
                            <TableCell className="hidden sm:table-cell">
                              {head.ppHeaduser_username}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {head.ppHeadpuser_email}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {head.ppHeaduser_contactnumber}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {head.ppHeaduser_licensenumber}
                            </TableCell>
                          </TableRow>
                          {expandedRows[index] && (
                            <TableRow className="bg-gray-50 lg:hidden">
                              <TableCell colSpan={6}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
                                  {head.ppHeaduser_username && (
                                    <div className="sm:hidden">
                                      <strong>Username:</strong>{" "}
                                      {head.ppHeaduser_username}
                                    </div>
                                  )}
                                  {head.ppHeadpuser_email && (
                                    <div className="md:hidden">
                                      <strong>E-mail:</strong>{" "}
                                      {head.ppHeadpuser_email}
                                    </div>
                                  )}
                                  {head.ppHeaduser_contactnumber && (
                                    <div className="md:hidden">
                                      <strong>Contact Number:</strong>{" "}
                                      {head.ppHeaduser_contactnumber}
                                    </div>
                                  )}
                                  {head.ppHeaduser_licensenumber && (
                                    <div className="lg:hidden">
                                      <strong>License Number:</strong>{" "}
                                      {head.ppHeaduser_licensenumber}
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PPHeadList;
