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
import { ClipboardPlus, LoaderCircle, Search } from "lucide-react";
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
import { Input } from "./ui/input";
import { DatePicker } from "./date-picker";
import { fetchPPUsers, handleNotifyToPPUser } from "@/app/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function CaseTable() {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } =
    useAlertDialog();
  const [selectedCase, setSelectedCase] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const casesPerPage = 10;
  const [allCases, setAllCases] = useState([]);
  const [ppUsers, setPPUsers] = useState(null);
  const [selectedPPUser, setSelectedPPUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [assignCaseLoading, setAssignCaseLoading] = useState(false);
  const [error, setError] = useState(null);
  const userDetails = useSelector((state) => state.auth.user);
  const [user, setUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCaseSelected, setIsCaseSelected] = useState(false);
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

  const handleAssignCasetoPPUser = async () => {
    try {
      setAssignCaseLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${BASE_URL}assigncase`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          PPUserID: selectedPPUser,
          EntryUserID: user?.AuthorityUserID,
          CaseID: selectedCase?.CaseId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign case");
      }

      const result = await response.json();

      if (result.status === 0) {
        const emailResult = await handleNotifyToPPUser(
          selectedCase?.CaseId,
          selectedPPUser
        );
        const { PPUserName, DistrictName, PoliceStationName } =
          emailResult.data;
        openAlert(
          "success",
          `${PPUserName} has been assigned to Case and email sent successfully to ${DistrictName}, ${PoliceStationName} PS`
        );
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      openAlert("error", err?.message);
    } finally {
      setAssignCaseLoading(false);
    }
  };

  const handleConfirm = () => {
    closeAlert();
    showallCaseBetweenRange(null, null);
    setSelectedCase(null);
    setIsCaseSelected(false);
    setSelectedPPUser("");
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
          isAssign: 0,
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
    if (user) {
      fetchPPUsers(user?.AuthorityUserID)
        .then((result) => {
          setPPUsers(result);
        })
        .catch((err) => {
          setError(err);
        });
    }
  }, [user]);

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
              Action
            </TableHead>
            {/* Mobile Column */}
            <TableHead className="md:hidden font-bold">Assign</TableHead>
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
              <TableCell colSpan={6} className="text-center text-red-500">
                {error}
              </TableCell>
            </TableRow>
          ) : currentCases.length > 0 ? (
            currentCases.map((caseItem, index) => (
              <TableRow key={index}>
                {/* Desktop cells */}
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
                {/* Desktop Action Dialog */}
                <TableCell className="hidden md:table-cell">
                  <Dialog
                    open={isCaseSelected}
                    onOpenChange={setIsCaseSelected}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCaseSelected(true);
                          setSelectedCase(caseItem);
                          setSelectedPPUser("");
                        }}
                      >
                        <ClipboardPlus /> Assign Case
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Case Number - {selectedCase?.CaseNumber || "N/A"}
                        </DialogTitle>
                      </DialogHeader>
                      <Card>
                        <CardContent>
                          {selectedCase && (
                            <div className="space-y-2">
                              <p>
                                <strong>PP User Name:</strong>{" "}
                                {selectedCase.PPuserName || "Not Assigned"}
                              </p>
                              <p>
                                <strong>SP Name:</strong> {selectedCase.SpName}
                              </p>
                              <p>
                                <strong>PS Name:</strong> {selectedCase.PsName}
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
                                {formatDate(selectedCase.CaseHearingDate)}
                              </p>
                              <p>
                                <strong>IPC Section:</strong>{" "}
                                {selectedCase.IPCSection}
                              </p>
                              <p>
                                <strong>Begin Reference:</strong>{" "}
                                {selectedCase.BeginReferenceName}
                              </p>
                              <p>
                                <strong>Whether SP seen the mail:</strong>{" "}
                                {selectedCase?.SP_Status ? "Yes" : "No"}
                              </p>
                              <p>
                                <strong>Whether PS seen the mail:</strong>{" "}
                                {selectedCase?.PS_Status ? "Yes" : "No"}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      <div className="space-y-2 mt-4">
                        <label
                          htmlFor="pp-user-select-desktop"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Assign to PP User
                        </label>
                        <Select
                          onValueChange={setSelectedPPUser}
                          value={selectedPPUser}
                        >
                          <SelectTrigger id="pp-user-select-desktop">
                            <SelectValue placeholder="Select a PP user" />
                          </SelectTrigger>
                          <SelectContent>
                            {ppUsers?.map((user) => (
                              <SelectItem
                                key={user.pp_id}
                                value={user.pp_id.toString()}
                              >
                                {user.pp_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        disabled={assignCaseLoading}
                        onClick={handleAssignCasetoPPUser}
                        className="bg-blue-500 hover:bg-blue-600 mt-4"
                      >
                        {assignCaseLoading ? "Loading..." : "Assign"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                {/* Mobile Action Dialog */}
                <TableCell className="md:hidden">
                  <Dialog
                    open={isCaseSelected}
                    onOpenChange={setIsCaseSelected}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCaseSelected(true);
                          setSelectedCase(caseItem);
                          setSelectedPPUser("");
                        }}
                      >
                        <ClipboardPlus /> Assign
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Case Number - {selectedCase?.CaseNumber || "N/A"}
                        </DialogTitle>
                      </DialogHeader>
                      <Card>
                        <CardContent>
                          {selectedCase && (
                            <div className="space-y-2">
                              <p>
                                <strong>PP User Name:</strong>{" "}
                                {selectedCase.PPuserName || "Not Assigned"}
                              </p>
                              <p>
                                <strong>SP Name:</strong> {selectedCase.SpName}
                              </p>
                              <p>
                                <strong>PS Name:</strong> {selectedCase.PsName}
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
                                {formatDate(selectedCase.CaseHearingDate)}
                              </p>
                              <p>
                                <strong>IPC Section:</strong>{" "}
                                {selectedCase.IPCSection}
                              </p>
                              <p>
                                <strong>Begin Reference:</strong>{" "}
                                {selectedCase.BeginReferenceName}
                              </p>
                              <p>
                                <strong>Whether SP seen the mail:</strong>{" "}
                                {selectedCase?.SP_Status ? "Yes" : "No"}
                              </p>
                              <p>
                                <strong>Whether PS seen the mail:</strong>{" "}
                                {selectedCase?.PS_Status ? "Yes" : "No"}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      <div className="space-y-2 mt-4">
                        <label
                          htmlFor="pp-user-select-mobile"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Assign to PP User
                        </label>
                        <Select
                          onValueChange={setSelectedPPUser}
                          value={selectedPPUser}
                        >
                          <SelectTrigger id="pp-user-select-mobile">
                            <SelectValue placeholder="Select a PP user" />
                          </SelectTrigger>
                          <SelectContent>
                            {ppUsers?.map((user) => (
                              <SelectItem
                                key={user.pp_id}
                                value={user.pp_id.toString()}
                              >
                                {user.pp_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        disabled={assignCaseLoading}
                        onClick={handleAssignCasetoPPUser}
                        className="bg-blue-500 hover:bg-blue-600 mt-4"
                      >
                        {assignCaseLoading ? "Loading..." : "Assign"}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No data available
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
    </div>
  );
}
