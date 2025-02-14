"use client";
import { PORT_URL } from "@/app/constants";
import React, { useState, useEffect } from "react";
import { showallCase } from "@/app/api";
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
import { Button } from "@/components/ui/button";
import { CustomAlertDialog } from "@/components/custom-alert-dialog";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import { Input } from "@/components/ui/input";
import { ClipboardPlus, Eye, FileSpreadsheet, Search } from "lucide-react";
import * as XLSX from "xlsx";
import AddHearingPage from "../add-hearing-summary/page";
import HearingListPage from "../pp-office-admin-hearing-summary-list/page";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PPAllCaseList = () => {
  const { isOpen, alertType, alertMessage, closeAlert } = useAlertDialog();
  const [allCaseList, setAllCaseList] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const dispatch = useDispatch();
  const encryptedUser = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");
  const [caseDetails, setCaseDetails] = useState(null);
  const [showAddHearingSummary, setShowAddHearingSummary] = useState(false);
  const [showHearingSummaryList, setShowHearingSummaryList] = useState(false);

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser));
    setUser(decoded_user);
  }, [encryptedUser]);

  useEffect(() => {
    if (user) {
      showallCase(1)
        .then((result) => {
          setAllCaseList(result);
        })
        .catch((err) => {
          setMessage(err?.message || "An unexpected error occurred");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user]);

  const handleReset = () => {
    setIsLoading(false);
    setShowAddHearingSummary(false);
    setShowHearingSummaryList(false);
    setCaseDetails(null);
  };

  const filteredData = allCaseList?.filter((data) =>
    Object.values(data).some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAllCaseList = filteredData?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const addHearingSummary = (head) => {
    setCaseDetails({
      CaseDate: head.CaseDate,
      CaseHearingDate: head.CaseHearingDate,
      CaseId: head.CaseId,
      caseTypeID: head.caseTypeID,
      CaseNumber: head.CaseNumber,
    });
    setShowAddHearingSummary(true);
  };

  const viewHearingSummary = (head) => {
    setCaseDetails({
      CaseDate: head.CaseDate,
      CaseHearingDate: head.CaseHearingDate,
      CaseId: head.CaseId,
      caseTypeID: head.caseTypeID,
      CaseNumber: head.CaseNumber,
    });
    setShowHearingSummaryList(true);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cases");
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const fileName = `assigned_case_list_${formattedDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (showAddHearingSummary) {
    return <AddHearingPage onBack={handleReset} caseDetails={caseDetails} />;
  }

  if (showHearingSummaryList) {
    return <HearingListPage onBack={handleReset} caseDetails={caseDetails} />;
  }

  const handleConfirm = () => {
    closeAlert();
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash2.jpg')]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
      <main className="relative flex-1 p-6 w-full min-h-screen">
        <CustomAlertDialog
          isOpen={isOpen}
          alertType={alertType}
          alertMessage={alertMessage}
          onClose={closeAlert}
          onConfirm={handleConfirm}
        />
        <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Assigned Case List</CardTitle>
            <Button onClick={downloadExcel} className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export to Excel
            </Button>
          </CardHeader>
          <CardContent>
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
                  <span className="mr-2 text-xs">
                    Total number of records: {filteredData.length}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Case Number</TableHead>
                      <TableHead className="font-bold hidden md:table-cell">
                        Document
                      </TableHead>
                      <TableHead className=" hidden md:table-cellfont-bold">
                        Hearing Summary
                      </TableHead>
                      <TableHead className="font-bold hidden md:table-cell">
                        Jurisdiction
                      </TableHead>
                      <TableHead className="font-bold hidden md:table-cell">
                        Police Station
                      </TableHead>
                      <TableHead className="font-bold hidden md:table-cell">
                        Case Date
                      </TableHead>
                      <TableHead className="font-bold hidden md:table-cell">
                        Case Type
                      </TableHead>
                      <TableHead className="font-bold hidden md:table-cell">
                        Case Hearing Date
                      </TableHead>
                      <TableHead className="font-bold hidden md:table-cell">
                        IPC Section
                      </TableHead>
                      <TableHead className="font-bold hidden md:table-cell">
                        Reference
                      </TableHead>
                      <TableHead className="font-bold md:hidden">
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="bg-slate-300 h-8 w-32" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                          <TableCell className="md:hidden">
                            <Skeleton className="bg-slate-300 h-4 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : currentAllCaseList?.length > 0 ? (
                      currentAllCaseList.map((head, index) => (
                        <TableRow key={index}>
                          <TableCell>{head.CaseNumber}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {head.Document ? (
                              <a
                                href={`${PORT_URL}${head.Document}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex justify-center items-center gap-2">
                              <Button
                                variant="outline"
                                onClick={() => addHearingSummary(head)}
                              >
                                <ClipboardPlus className="h-4 w-4" />
                                Add
                              </Button>
                              <Button onClick={() => viewHearingSummary(head)}>
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {head.SpName}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {head.PsName}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(head.CaseDate)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {head.CaseType}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(head.CaseHearingDate)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {head.IPCSection}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {head.BeginReferenceName}
                          </TableCell>
                          <TableCell className="md:hidden">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Case Details</DialogTitle>
                                  <DialogDescription className="text-left">
                                    <strong>Jurisdiction: </strong>
                                    <span className="text-black">
                                      {head.SpName}
                                    </span>{" "}
                                    <br />
                                    <strong>Police Station: </strong>
                                    <span className="text-black">
                                      {head.PsName}
                                    </span>{" "}
                                    <br />
                                    <strong>Case Date: </strong>
                                    <span className="text-black">
                                      {formatDate(head.CaseDate)}
                                    </span>{" "}
                                    <br />
                                    <strong>Case Type: </strong>
                                    <span className="text-black">
                                      {head.CaseType}
                                    </span>{" "}
                                    <br />
                                    <strong>Case Hearing Date: </strong>
                                    <span className="text-black">
                                      {formatDate(head.CaseHearingDate)}
                                    </span>{" "}
                                    <br />
                                    <strong>IPC Section: </strong>
                                    <span className="text-black">
                                      {head.IPCSection}
                                    </span>{" "}
                                    <br />
                                    <strong>Reference: </strong>
                                    <span className="text-black">
                                      {head.BeginReferenceName}
                                    </span>{" "}
                                    <br />
                                    <strong>Document: </strong>
                                    <span className="text-black">
                                      {head.Document ? (
                                        <a
                                          href={`${PORT_URL}${head.Document}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          View Document
                                        </a>
                                      ) : (
                                        "N/A"
                                      )}
                                    </span>
                                    <br />
                                    <strong>Hearing Summary: </strong>
                                    <br />
                                    <Button
                                      onClick={() => addHearingSummary(head)}
                                      className="inline-flex items-center gap-1"
                                    >
                                      <ClipboardPlus className="h-4 w-4" />
                                      Add
                                    </Button>
                                    <Button
                                      onClick={() => viewHearingSummary(head)}
                                      className="inline-flex items-center gap-1"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View
                                    </Button>
                                  </DialogDescription>
                                </DialogHeader>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center">
                          No Assigned Cases available.
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

export default PPAllCaseList;
