"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPccCrimeDetails } from "@/app/applicationDetails/[FileNumber]/api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "./ui/visually-hidden";
import { Eye } from "lucide-react";
import { Label } from "./ui/label";
import Cookies from "react-cookies";

const CrimeAcivityTablePCC = ({ selectedRows, setSelectedRows, ApplicantName, FathersName }) => {
  const ps = Cookies.load("ps");
  const district = Cookies.load("district");
  const [crimeData, setCrimeData] = useState([]);
  const [isLoadingPccRecords, setIsLoadingPccRecords] = useState(false);
  const [pccInput, setPccInput] = useState({ fname: ApplicantName?.split(" ")[0], lname: ApplicantName?.split(" ")[1] });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState("");

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when crimeData updates
  }, [crimeData]);

  const fetchPccCrimeDetails = async (fname, lname) => {
    try {
      setIsLoadingPccRecords(true);
      const response = await getPccCrimeDetails(fname, lname);

      // phonetic search
      const filterData = response?.data?.Arrest?.filter(filter =>
        filter?.FirstName?.trimStart().toUpperCase() === pccInput?.fname?.toUpperCase().trim()
        && filter?.LastName?.toUpperCase().includes(pccInput?.lname?.toUpperCase())
        && filter.gurdainName?.toUpperCase().includes(FathersName?.toUpperCase())
        // && filter.psName?.toUpperCase().includes(ps?.toUpperCase())
        // && filter.distName?.toUpperCase().includes(district?.toUpperCase())
      );

      console.log('filterData', filterData);

      setCrimeData(filterData || []);
      setSelectedRows([]); // Clear previous selections on new search
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoadingPccRecords(false);
    }
  };

  const toggleSelection = (crimeDetail) => {
    setSelectedRows((prevSelected) => {
      const exists = prevSelected.some((item) => item.case_ref_id === crimeDetail.case_ref_id);
      return exists ? prevSelected.filter((item) => item.case_ref_id !== crimeDetail.case_ref_id) : [...prevSelected, crimeDetail];
    });
  };

  const totalPages = Math.ceil(crimeData.length / itemsPerPage);
  const currentData = crimeData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SkeletonLoader = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <TableRow key={index}>
          {[...Array(8)].map((_, i) => (
            <TableCell key={i}>
              <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
      <div className="m-3">
        <h1 className="text-xl font-bold text-zinc-500">C.I.D Criminal Records</h1>
        <hr className="my-2" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center justify-center">
            <div className="w-full px-3">
              <Label className="text-zinc-500">First Name</Label>
              <Input type="text" value={pccInput.fname} placeholder="Enter First Name" className="border-gray-300 rounded-md w-full p-2"
                onChange={(e) => setPccInput({ ...pccInput, fname: e.target.value })}
              />
            </div>
            <div className="w-full px-3">
              <Label className="text-zinc-500">Last Name</Label>
              <Input type="text" value={pccInput.lname} placeholder="Enter Last Name" className="border-gray-300 rounded-md w-full p-2"
                onChange={(e) => setPccInput({ ...pccInput, lname: e.target.value })}
              />
            </div>
            <Button variant="secondary" disabled={isLoadingPccRecords} className="mx-2 mt-5 text-slate-700 border-2 hover:bg-zinc-200" onClick={() => fetchPccCrimeDetails(pccInput.fname, pccInput.lname)}>
              {isLoadingPccRecords ? 'Searching...' : 'Search Criminal Records'}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100">
                    <TableHead>Select</TableHead>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Locality</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Police Station</TableHead>
                    <TableHead>Case Ref. No.</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPccRecords ? (
                    <SkeletonLoader />
                  ) : currentData.length > 0 ? (
                    currentData.map((crimeDetail, index) => (
                      <TableRow key={index} className="hover:bg-gray-100">
                        <TableCell>
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={selectedRows.some((item) => item.case_ref_id === crimeDetail.case_ref_id)}
                            onChange={() => toggleSelection(crimeDetail)}
                          />
                        </TableCell>
                        <TableCell>{crimeDetail?.FirstName || "N/A"}</TableCell>
                        <TableCell>{crimeDetail?.LastName || "N/A"}</TableCell>
                        <TableCell>{crimeDetail?.locality || "N/A"}</TableCell>
                        <TableCell>{crimeDetail?.distName || "N/A"}</TableCell>
                        <TableCell>{crimeDetail?.psName || "N/A"}</TableCell>
                        <TableCell>{crimeDetail?.case_ref_id || "N/A"}</TableCell>
                        <TableCell>
                          <button className="flex bg-blue-100 p-1 px-2 rounded-md hover:bg-blue-200 text-sm"
                            onClick={() => {
                              setSelectedDetails(crimeDetail)
                              setIsModalOpen(true)
                            }}>
                            <Eye className="text-blue-600 mr-2 h-4 w-4" />
                            View
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">No Record(s) Found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {!isLoadingPccRecords && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 p-3">
                <span className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, crimeData.length)} of {crimeData.length} entries
                </span>
                <div className="flex items-center space-x-1 flex-wrap gap-1">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    Prev
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)}>
                      {page}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Rows Display */}
        {selectedRows.length > 0 && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold">Record found from 'C.I.D Criminal Records' :</h2>
            <ul className="list-disc pl-5">
              {selectedRows.map((row, index) => (
                <li key={index} className="text-sm">
                  {row.FirstName} {row.LastName} - {row.case_ref_id} (police station: {row.psName || 'N/A'})
                </li>
              ))}
            </ul>
          </div>
        )}
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="w-full">
              <VisuallyHidden>
                <DialogTitle>Case Details</DialogTitle>
              </VisuallyHidden>
              <div className="space-y-2 h-full w-full px-5">
                <h1 className="text-center text-slate-500 font-bold text-xl mb-10 underline">Case Details</h1>
                {selectedDetails &&
                  <div>
                    {selectedDetails?.FirstName && <div><span className='font-bold'>First Name:</span> <span>{selectedDetails?.FirstName}</span></div>}
                    {selectedDetails?.LastName && <div><span className='font-bold'>Last Name:</span> <span>{selectedDetails?.LastName}</span></div>}
                    {selectedDetails?.Gender && <div><span className='font-bold'>Gender:</span> <span>{selectedDetails?.Gender}</span></div>}
                    {selectedDetails?.gurdainName && <div><span className='font-bold'>Gurdain Name:</span> <span>{selectedDetails?.gurdainName}</span></div>}
                    {selectedDetails?.alias && <div><span className='font-bold'>Nickname(alias):</span> <span>{selectedDetails?.alias}</span></div>}
                    {selectedDetails?.locality && <div><span className='font-bold'>Locality:</span> <span>{selectedDetails?.locality}</span></div>}
                    {selectedDetails?.psName && <div><span className='font-bold'>Police Station:</span> <span>{selectedDetails?.psName}</span></div>}
                    {selectedDetails?.distName && <div><span className='font-bold'>District:</span> <span>{selectedDetails?.distName}</span></div>}
                    {selectedDetails?.arrestDate && <div><span className='font-bold'>Arrest Date:</span> <span>{selectedDetails?.arrestDate}</span></div>}
                    {selectedDetails?.caseDetails && <div><span className='font-bold'>Case Details:</span> <span>{selectedDetails?.caseDetails}</span></div>}
                    {selectedDetails?.case_ref_id && <div><span className='font-bold'>Case Ref. ID:</span> <span>{selectedDetails?.case_ref_id}</span></div>}
                    {selectedDetails?.case_no && <div><span className='font-bold'>Case No.:</span> <span>{selectedDetails?.case_no}</span></div>}
                    {selectedDetails?.case_year && <div><span className='font-bold'>Case Year:</span> <span>{selectedDetails?.case_year}</span></div>}
                  </div>
                }
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default CrimeAcivityTablePCC;
