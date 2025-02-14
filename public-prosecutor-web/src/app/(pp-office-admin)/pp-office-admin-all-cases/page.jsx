"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ClipboardPlus, Eye, LoaderCircle, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import { CustomAlertDialog } from "@/components/custom-alert-dialog";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { Badge } from "@/components/ui/badge";
import { BASE_URL } from "@/app/constants";

export default function CaseTable() {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } =
    useAlertDialog();
  const [selectedCase, setSelectedCase] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 10;
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCaseSelectedDesktop, setIsCaseSelectedDesktop] = useState(false);
  const [isCaseSelectedMobile, setIsCaseSelectedMobile] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);

    // Format as "yyyy-mm-dd"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleConfirm = () => {
    closeAlert();
    showallCaseBetweenRange(null, null);
    setSelectedCase(null);
    setIsCaseSelected(false);
  };

  const showallCaseBetweenRange = async (start, end) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${BASE_URL}showallCaseBetweenRange`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: formatDate(start),
          endDate: formatDate(end),
          isAssign: 2,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      if (result.status === 0) {
        setAllCases(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(userDetails));
    setUser(decoded_user);
  }, [userDetails]);

  useEffect(() => {
    showallCaseBetweenRange(null, null);
  }, []);

  const filteredData = allCases?.filter((data) =>
    Object?.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  );

  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredData?.slice(indexOfFirstCase, indexOfLastCase);

  const totalPages = Math.ceil(filteredData?.length / casesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4">
          <CardHeader>
            <CardTitle>All Case List</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-red-600 mb-4 text-center">{error}</p>
            ) : (
              <div className="container mx-auto py-10">
                <CustomAlertDialog
                  isOpen={isOpen}
                  alertType={alertType}
                  alertMessage={alertMessage}
                  onClose={closeAlert}
                  onConfirm={handleConfirm}
                />

                <div className="flex gap-4 mb-3">
                  <DatePicker
                    date={fromDate ? formatDate(fromDate) : null}
                    setDate={setFromDate}
                    placeholder="From (Date Range)"
                  />
                  <DatePicker
                    date={toDate ? formatDate(toDate) : null}
                    setDate={setToDate}
                    placeholder="To (Date Range)"
                  />
                  <Button
                    className="ml-2 bg-blue-500 hover:bg-blue-700"
                    onClick={() =>
                      showallCaseBetweenRange(
                        formatDate(fromDate),
                        formatDate(toDate)
                      )
                    }
                  >
                    {loading ? "Loading..." : "Get Cases"}
                  </Button>
                </div>
                <div className="w-100 h-[1px] bg-slate-100 my-4"></div>
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
                    <span className="mr-2 text-xs">
                      Total number of records: {filteredData.length}
                    </span>
                  </div>
                </div>
                <Table className="w-full border-collapse border-spacing-0">
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead className="md:table-cell">
                        PP User Name
                      </TableHead>
                      <TableHead className="md:table-cell hidden">
                        Case Number
                      </TableHead>
                      <TableHead className="md:table-cell hidden">
                        PS Name
                      </TableHead>
                      <TableHead className="md:table-cell hidden">
                        Case Date
                      </TableHead>
                      <TableHead className="hidden md:table-cell font-bold">
                        Case Status
                      </TableHead>
                      <TableHead className="hidden md:table-cell font-bold">
                        Action
                      </TableHead>
                      <TableHead className="font-bold md:table-cell lg:hidden text-center">
                        More Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      [...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell className="md:table-cell p-2">
                            <Skeleton className="bg-slate-300 h-4 w-28" />
                          </TableCell>
                          <TableCell className="md:table-cell hidden p-2">
                            <Skeleton className="bg-slate-300 h-4 w-24" />
                          </TableCell>
                          <TableCell className="md:table-cell hidden p-2">
                            <Skeleton className="bg-slate-300 h-4 w-24" />
                          </TableCell>
                          <TableCell className="md:table-cell hidden p-2">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell p-2">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell p-2">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="font-bold md:table-cell lg:hidden text-center p-2">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : currentCases.length > 0 ? (
                      currentCases.map((caseItem, index) => (
                        <TableRow key={index}>
                          <TableCell className="md:table-cell ">
                            {caseItem.PPuserName || "Not Assigned"}
                          </TableCell>
                          <TableCell className="md:table-cell hidden">
                            {caseItem.CaseNumber}
                          </TableCell>
                          <TableCell className="md:table-cell hidden">
                            {caseItem.PsName}
                          </TableCell>
                          <TableCell className="md:table-cell hidden">
                            {formatDate(caseItem.CaseDate)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {caseItem.IsAssigned ? (
                              <Badge className="bg-emerald-400">Assigned</Badge>
                            ) : (
                              <Badge className="bg-orange-300">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Dialog
                              open={isCaseSelectedDesktop}
                              onOpenChange={setIsCaseSelectedDesktop}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsCaseSelectedDesktop(true);
                                    setSelectedCase(caseItem);
                                  }}
                                >
                                  <Eye /> More Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Case Details</DialogTitle>
                                </DialogHeader>
                                <DialogDescription>
                                  {/* Make changes to your profile here. Click save when you're done. */}
                                </DialogDescription>
                                <Card>
                                  <CardHeader>
                                    <CardTitle>Case Details</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {selectedCase && (
                                      <>
                                        <div className="space-y-2">
                                          <p>
                                            <strong>PP User Name:</strong>{" "}
                                            {selectedCase.PPuserName}
                                          </p>
                                          <p>
                                            <strong>Case Number:</strong>{" "}
                                            {selectedCase.CaseNumber}
                                          </p>
                                          <p>
                                            <strong>SP Name:</strong>{" "}
                                            {selectedCase.SpName}
                                          </p>
                                          <p>
                                            <strong>PS Name:</strong>{" "}
                                            {selectedCase.PsName}
                                          </p>
                                          <p>
                                            <strong>Case Date:</strong>{" "}
                                            {formatDate(selectedCase.CaseDate)}
                                          </p>
                                          <p>
                                            <strong>Case Type:</strong>{" "}
                                            {selectedCase.CaseType}
                                          </p>
                                          <p>
                                            <strong>Case Hearing Date:</strong>{" "}
                                            {formatDate(
                                              selectedCase.CaseHearingDate
                                            )}
                                          </p>
                                          {/* <div>
                                            <p>
                                              <strong>Case Status :</strong>{" "}
                                              {selectedCase.IsAssigned ? (
                                                <span className="text-green-600 font-bold">
                                                  Assigned
                                                </span>
                                              ) : (
                                                <span className="text-green-600 font-bold">
                                                  Pending
                                                </span>
                                              )}
                                            </p>
                                          </div> */}
                                        </div>
                                      </>
                                    )}
                                  </CardContent>
                                </Card>
                              </DialogContent>
                            </Dialog>
                          </TableCell>

                          {/* For mobile only */}
                          <TableCell className="md:hidden text-center">
                            <Dialog
                              open={isCaseSelectedMobile}
                              onOpenChange={setIsCaseSelectedMobile}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setIsCaseSelectedMobile(true);
                                    setSelectedCase(caseItem);
                                  }}
                                >
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="w-full sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-4">
                                <DialogHeader>
                                  <DialogTitle>Case Details</DialogTitle>
                                </DialogHeader>
                                {selectedCase && (
                                  <Card>
                                    <CardContent>
                                      <div className="space-y-2">
                                        <p>
                                          <strong>PP User Name:</strong>{" "}
                                          {selectedCase.PPuserName ||
                                            "Not Assigned"}
                                        </p>
                                        <p>
                                          <strong>Case Number:</strong>{" "}
                                          {selectedCase.CaseNumber}
                                        </p>
                                        <p>
                                          <strong>SP Name:</strong>{" "}
                                          {selectedCase.SpName}
                                        </p>
                                        <p>
                                          <strong>PS Name:</strong>{" "}
                                          {selectedCase.PsName}
                                        </p>
                                        <p>
                                          <strong>Case Date:</strong>{" "}
                                          {formatDate(selectedCase.CaseDate)}
                                        </p>
                                        <p>
                                          <strong>Case Type:</strong>{" "}
                                          {selectedCase.CaseType}
                                        </p>
                                        <p>
                                          <strong>Case Hearing Date:</strong>{" "}
                                          {formatDate(
                                            selectedCase.CaseHearingDate
                                          )}
                                        </p>

                                        <div>
                                          <p>
                                            <strong>Case Status :</strong>{" "}
                                            {selectedCase.IsAssigned ? (
                                              <span className="text-green-600 font-bold">
                                                Assigned
                                              </span>
                                            ) : (
                                              <span className="text-green-600 font-bold">
                                                Pending
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No Cases available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
}
