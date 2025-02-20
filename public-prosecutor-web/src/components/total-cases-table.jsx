"use client";
import { BASE_URL } from "@/app/constants";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, LoaderCircle, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import { CustomAlertDialog } from "@/components/custom-alert-dialog";
import { useAlertDialog } from "@/hooks/useAlertDialog";
import { Input } from "./ui/input";
import { DatePicker } from "./date-picker";
import { Badge } from "./ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CaseTable() {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } =
    useAlertDialog();
  const [selectedCase, setSelectedCase] = useState(null);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 10;
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleConfirm = () => {
    closeAlert();
    showallCaseBetweenRange(null, null);
    setSelectedCase(null);
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
    Object.values(data)?.some((value) =>
      value?.toString()?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    )
  );

  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredData?.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredData?.length / casesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto py-5">
      <CustomAlertDialog
        isOpen={isOpen}
        alertType={alertType}
        alertMessage={alertMessage}
        onClose={closeAlert}
        onConfirm={handleConfirm}
      />

      <div className="flex gap-4 mb-3">
        <DatePicker
          date={fromDate}
          setDate={setFromDate}
          placeholder="From (Date Range)"
        />
        <DatePicker
          date={toDate}
          setDate={setToDate}
          placeholder="To (Date Range)"
        />
        <Button
          className="ml-2 bg-blue-400 hover:bg-blue-600"
          onClick={() => showallCaseBetweenRange(fromDate, toDate)}
        >
          {loading ? "Loading..." : "Get Cases"}
        </Button>
      </div>
      <div className="w-full h-[1px] bg-slate-100 my-4"></div>
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
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-100">
            {/* Desktop Columns */}
            <TableHead className="hidden md:table-cell font-bold">
              PP User Name
            </TableHead>
            <TableHead className="font-bold">Case Number</TableHead>
            <TableHead className="hidden md:table-cell font-bold">
              PS Name
            </TableHead>
            <TableHead className="hidden md:table-cell font-bold">
              Case Date
            </TableHead>
            <TableHead className="hidden md:table-cell font-bold">
              Case Status
            </TableHead>
            {/* Mobile-only Column */}
            <TableHead className="md:hidden font-bold">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            [...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="md:hidden">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Something Went Wrong! Please try again.
              </TableCell>
            </TableRow>
          ) : currentCases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No case found
              </TableCell>
            </TableRow>
          ) : (
            currentCases.map((caseItem, index) => (
              <TableRow key={index}>
                <TableCell className="hidden md:table-cell">
                  {caseItem.PPuserName || "Not Assigned"}
                </TableCell>
                <TableCell>{caseItem.CaseNumber}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {caseItem.PsName}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(caseItem.CaseDate)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {caseItem.IsAssigned ? (
                    <Badge className="bg-emerald-400">Assigned</Badge>
                  ) : (
                    <Badge className="bg-orange-300">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="md:hidden">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCase(caseItem);
                      setMobileDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" /> Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
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
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
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
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
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
      {/* Mobile-Only Details Dialog */}
      <div className="md:hidden">
        <Dialog open={mobileDialogOpen} onOpenChange={setMobileDialogOpen}>
          <DialogContent className="sm:max-w-auto">
            <DialogHeader>
              <DialogTitle>Case Details</DialogTitle>
            </DialogHeader>
            <DialogDescription asChild>
              <Card>
                <CardContent>
                  {selectedCase && (
                    <div>
                      <p>
                        <strong>PP User Name:</strong>{" "}
                        {selectedCase.PPuserName || "Not Assigned"}
                      </p>
                      <p>
                        <strong>Case Number:</strong> {selectedCase.CaseNumber}
                      </p>
                      {selectedCase.SpName && (
                        <p>
                          <strong>SP Name:</strong> {selectedCase.SpName}
                        </p>
                      )}
                      <p>
                        <strong>PS Name:</strong> {selectedCase.PsName}
                      </p>
                      <p>
                        <strong>Case Date:</strong>{" "}
                        {formatDate(selectedCase.CaseDate)}
                      </p>
                      {selectedCase.CaseType && (
                        <p>
                          <strong>Case Type:</strong> {selectedCase.CaseType}
                        </p>
                      )}
                      {selectedCase.CaseHearingDate && (
                        <p>
                          <strong>Case Hearing Date:</strong>{" "}
                          {formatDate(selectedCase.CaseHearingDate)}
                        </p>
                      )}
                      {selectedCase.IPCSection && (
                        <p>
                          <strong>IPC Section:</strong>{" "}
                          {selectedCase.IPCSection}
                        </p>
                      )}
                      {selectedCase.BeginReferenceName && (
                        <p>
                          <strong>Begin Reference:</strong>{" "}
                          {selectedCase.BeginReferenceName}
                        </p>
                      )}
                      {typeof selectedCase.SP_Status !== "undefined" && (
                        <p>
                          <strong>SP Mail Seen:</strong>{" "}
                          {selectedCase.SP_Status ? "Yes" : "No"}
                        </p>
                      )}
                      {typeof selectedCase.PS_Status !== "undefined" && (
                        <p>
                          <strong>PS Mail Seen:</strong>{" "}
                          {selectedCase.PS_Status ? "Yes" : "No"}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
