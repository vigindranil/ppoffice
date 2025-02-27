"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import moment from "moment";
import { getKolkataPoliceCriminalRecordSearchv4, getPccCrimeDetails } from "@/app/applicationDetails/[FileNumber]/api";
import DateRangePicker from "./date-range-picker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "./ui/visually-hidden";
import { Eye } from "lucide-react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import Cookies from "react-cookies";

const SkeletonLoader = () => (
  <>
    {[...Array(3)].map((_, index) => (
      <TableRow key={index}>
        {[...Array(7)].map((_, i) => (
          <TableCell key={i}>
            <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

const CrimeAcivityTableKolkataPolice = ({ selectedRows, setSelectedRows, applicant_details }) => {
  const ps = Cookies.load("ps");
  const district = Cookies.load("district");
  const [crimeData, setCrimeData] = useState([]);
  const [isLoadingPccRecords, setIsLoadingPccRecords] = useState(false);
  const [kolkataPoliceRecords, setKolkataPoliceRecords] = useState({
    name_accused: applicant_details?.ApplicantName || "",
    criminal_aliases_name: "",
    address: applicant_details?.PermanentAddress || applicant_details?.VerificationAddress || "",
    father_accused: applicant_details?.FathersName,
    age_accused: "",
    from_date: "",
    to_date: "",
    case_yr: "",
    policestations: applicant_details?.Ps_Name,
    pageno: "1",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchCIDRecords = async (crimeData) => {
    try {
      setIsLoadingPccRecords(true);
      const response = await getKolkataPoliceCriminalRecordSearchv4(crimeData);

      // phonetic search
      const filterData = response?.data?.result?.filter(filter =>
        filter?.NAME?.toUpperCase().includes(kolkataPoliceRecords?.name_accused?.toUpperCase())
        && filter?.FATHERNAME?.toUpperCase().includes(kolkataPoliceRecords?.father_accused?.toUpperCase())
        // && ( filter.ADDRESS?.toUpperCase().includes(district?.toUpperCase()) || filter.ADDR?.toUpperCase().includes(district?.toUpperCase()) )
      );

      // console.log('filterData', filterData);

      setCrimeData(filterData || []);

      setCurrentPage(1); // Reset to first page on new search
    } catch (e) {
      console.log("Error:", e);
    } finally {
      setIsLoadingPccRecords(false);
    }
  };


  const totalPages = Math.ceil(crimeData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = crimeData.slice(startIndex, endIndex);

  const toggleSelection = (crimeDetail) => {
    setSelectedRows((prevSelected) => {
      const exists = prevSelected.some((item) => item.PROV_CRM_NO === crimeDetail.PROV_CRM_NO);
      return exists ? prevSelected.filter((item) => item.PROV_CRM_NO !== crimeDetail.PROV_CRM_NO) : [...prevSelected, crimeDetail];
    });
  };

  return (
    <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
      <div className="m-3">
        <h1 className="text-xl font-bold text-zinc-500">Kolkata Police Criminal Records</h1>
        <hr className="my-2" />
        <div className="flex items-center justify-center mb-6 flex-col">
          <div className="flex flex-wrap items-center gap-y-2 w-full my-4 px-14">
            <div className="w-1/3 px-3">
              <Label className="text-zinc-500">Applicant Name</Label>
              <Input
                type="text"
                placeholder="Enter First Name (required)"
                className="ring-0 border-gray-300 rounded-md w-full p-2"
                value={kolkataPoliceRecords?.name_accused}
                onChange={(e) => setKolkataPoliceRecords({ ...kolkataPoliceRecords, name_accused: e.target.value })}
              />
            </div>

            <div className="w-1/3 px-3">
              <Label className="text-zinc-500">Father's Name</Label>
              <Input
                type="text"
                placeholder="Enter Father Name (optional)"
                className="active:ring-0 focus:outline-none border-gray-300 rounded-md w-full p-2"
                value={kolkataPoliceRecords?.father_accused}
                onChange={(e) => setKolkataPoliceRecords({ ...kolkataPoliceRecords, father_accused: e.target.value })}
              />
            </div>

            <div className="w-1/3 px-3">
              <Label className="text-zinc-500">Police Station</Label>
              <Input
                type="text"
                placeholder="Enter PS (optional)"
                className="active:ring-0 focus:outline-none border-gray-300 rounded-md w-full p-2"
                value={kolkataPoliceRecords?.policestations}
                onChange={(e) => setKolkataPoliceRecords({ ...kolkataPoliceRecords, policestations: e.target.value })}
              />
            </div>

            <div className="w-full px-3">
              <Label className="text-zinc-500">Address</Label>
              <Textarea placeholder="Enter Address (optional)"
                className="active:ring-0 focus:outline-none border-gray-300 rounded-md w-[100%] p-2"
                value={kolkataPoliceRecords?.address}
                onChange={(e) => setKolkataPoliceRecords({ ...kolkataPoliceRecords, address: e.target.value })} />
            </div>

          </div>
          <Button
            variant="secondary"
            disabled={isLoadingPccRecords}
            className="mx-2 text-slate-700 hover:bg-zinc-200 shadow-sm border-2"
            onClick={() => fetchCIDRecords(kolkataPoliceRecords)}
          >
            {isLoadingPccRecords ? 'Searching...' : 'Search Criminal Records'}
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead>Select</TableHead>
                    <TableHead>Case Ref. No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPccRecords ? (
                    <SkeletonLoader />
                  ) : currentData.length > 0 ? (
                    currentData.map((crimeDetail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={selectedRows.some((item) => item.PROV_CRM_NO === crimeDetail.PROV_CRM_NO)}
                            onChange={() => toggleSelection(crimeDetail)}
                          />
                        </TableCell>
                        <TableCell>{crimeDetail?.PROV_CRM_NO || 'N/A'}</TableCell>
                        <TableCell>{crimeDetail?.NAME || 'N/A'}</TableCell>
                        <TableCell>{crimeDetail?.FATHERNAME || 'N/A'}</TableCell>
                        <TableCell>{crimeDetail?.ADDRESS || 'N/A'}</TableCell>
                        <TableCell>{crimeDetail?.CASEYEAR || 'N/A'}</TableCell>
                        <TableCell>
                          <button
                            className="flex bg-blue-100 justify-center items-center p-1 m-1 px-2 rounded-md hover:bg-blue-200 text-sm"
                            onClick={() => {
                              setSelectedDetails(crimeDetail)
                              setIsModalOpen(true)
                            }}
                          >
                            <Eye className="text-blue-600 mr-2 h-4 w-4" />
                            View
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No Record(s) Found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
                          {selectedDetails?.PROV_CRM_NO && <div><span className='font-bold'>PROV_CRM_NO:</span> <span>{selectedDetails?.PROV_CRM_NO}</span></div>}
                          {selectedDetails?.NAME && <div><span className='font-bold'>NAME:</span> <span>{selectedDetails?.NAME}</span></div>}
                          {selectedDetails?.ADDRESS && <div><span className='font-bold'>ADDRESS:</span> <span>{selectedDetails?.ADDRESS}</span></div>}
                          {selectedDetails?.FATHERNAME && <div><span className='font-bold'>FATHERNAME:</span> <span>{selectedDetails?.FATHERNAME}</span></div>}
                          {selectedDetails?.SEX && <div><span className='font-bold'>SEX:</span> <span>{selectedDetails?.SEX}</span></div>}
                          {selectedDetails?.AGE && <div><span className='font-bold'>AGE:</span> <span>{selectedDetails?.AGE}</span></div>}
                          {selectedDetails?.RELIGION && <div><span className='font-bold'>RELIGION:</span> <span>{selectedDetails?.RELIGION}</span></div>}
                          {selectedDetails?.NATIONALITY && <div><span className='font-bold'>NATIONALITY:</span> <span>{selectedDetails?.NATIONALITY}</span></div>}
                          {selectedDetails?.ANAME1 && <div><span className='font-bold'>ANAME1:</span> <span>{selectedDetails?.ANAME1}</span></div>}
                          {selectedDetails?.ANAME2 && <div><span className='font-bold'>ANAME2:</span> <span>{selectedDetails?.ANAME2}</span></div>}
                          {selectedDetails?.ANAME3 && <div><span className='font-bold'>ANAME3:</span> <span>{selectedDetails?.ANAME3}</span></div>}
                          {selectedDetails?.ANAME4 && <div><span className='font-bold'>ANAME4:</span> <span>{selectedDetails?.ANAME4}</span></div>}
                          {selectedDetails?.PSCODE && <div><span className='font-bold'>PSCODE:</span> <span>{selectedDetails?.PSCODE}</span></div>}
                          {selectedDetails?.ADDR && <div><span className='font-bold'>ADDR:</span> <span>{selectedDetails?.ADDR}</span></div>}
                          {selectedDetails?.BRIEF_FACT && <div><span className='font-bold'>BRIEF_FACT:</span> <span>{selectedDetails?.BRIEF_FACT}</span></div>}
                          {selectedDetails?.CLASS && <div><span className='font-bold'>CLASS:</span> <span>{selectedDetails?.CLASS}</span></div>}
                          {selectedDetails?.SUBCLASS && <div><span className='font-bold'>SUBCLASS:</span> <span>{selectedDetails?.SUBCLASS}</span></div>}
                          {selectedDetails?.TRNID && <div><span className='font-bold'>TRNID:</span> <span>{selectedDetails?.TRNID}</span></div>}
                          {selectedDetails?.CRIMEYEAR && <div><span className='font-bold'>CRIMEYEAR:</span> <span>{selectedDetails?.CRIMEYEAR}</span></div>}
                          {selectedDetails?.CRIMENO && <div><span className='font-bold'>CRIMENO:</span> <span>{selectedDetails?.CRIMENO}</span></div>}
                          {selectedDetails?.WA_YEAR && <div><span className='font-bold'>WA_YEAR:</span> <span>{selectedDetails?.WA_YEAR}</span></div>}
                          {selectedDetails?.WASLNO && <div><span className='font-bold'>WASLNO:</span> <span>{selectedDetails?.WASLNO}</span></div>}
                          {selectedDetails?.SLNO && <div><span className='font-bold'>SLNO:</span> <span>{selectedDetails?.SLNO}</span></div>}
                          {selectedDetails?.BEARD && <div><span className='font-bold'>BEARD:</span> <span>{selectedDetails?.BEARD}</span></div>}
                          {selectedDetails?.BIRTHMARK && <div><span className='font-bold'>BIRTHMARK:</span> <span>{selectedDetails?.BIRTHMARK}</span></div>}
                          {selectedDetails?.BUILT && <div><span className='font-bold'>BUILT:</span> <span>{selectedDetails?.BUILT}</span></div>}
                          {selectedDetails?.BURNMARK && <div><span className='font-bold'>BURNMARK:</span> <span>{selectedDetails?.BURNMARK}</span></div>}
                          {selectedDetails?.COMPLEXION && <div><span className='font-bold'>COMPLEXION:</span> <span>{selectedDetails?.COMPLEXION}</span></div>}
                          {selectedDetails?.CUTMARK && <div><span className='font-bold'>CUTMARK:</span> <span>{selectedDetails?.CUTMARK}</span></div>}
                          {selectedDetails?.DEFORMITY && <div><span className='font-bold'>DEFORMITY:</span> <span>{selectedDetails?.DEFORMITY}</span></div>}
                          {selectedDetails?.EAR && <div><span className='font-bold'>EAR:</span> <span>{selectedDetails?.EAR}</span></div>}
                          {selectedDetails?.EYE && <div><span className='font-bold'>EYE:</span> <span>{selectedDetails?.EYE}</span></div>}
                          {selectedDetails?.EYEBROW && <div><span className='font-bold'>EYEBROW:</span> <span>{selectedDetails?.EYEBROW}</span></div>}
                          {selectedDetails?.FACE && <div><span className='font-bold'>FACE:</span> <span>{selectedDetails?.FACE}</span></div>}
                          {selectedDetails?.HAIR && <div><span className='font-bold'>HAIR:</span> <span>{selectedDetails?.HAIR}</span></div>}
                          {selectedDetails?.MOLE && <div><span className='font-bold'>MOLE:</span> <span>{selectedDetails?.MOLE}</span></div>}
                          {selectedDetails?.MOUSTACHE && <div><span className='font-bold'>MOUSTACHE:</span> <span>{selectedDetails?.MOUSTACHE}</span></div>}
                          {selectedDetails?.NOSE && <div><span className='font-bold'>NOSE:</span> <span>{selectedDetails?.NOSE}</span></div>}
                          {selectedDetails?.SCARMARK && <div><span className='font-bold'>SCARMARK:</span> <span>{selectedDetails?.SCARMARK}</span></div>}
                          {selectedDetails?.TATTOOMARK && <div><span className='font-bold'>TATTOOMARK:</span> <span>{selectedDetails?.TATTOOMARK}</span></div>}
                          {selectedDetails?.WARTMARK && <div><span className='font-bold'>WARTMARK:</span> <span>{selectedDetails?.WARTMARK}</span></div>}
                          {selectedDetails?.CATEGORY && <div><span className='font-bold'>CATEGORY:</span> <span>{selectedDetails?.CATEGORY}</span></div>}
                          {selectedDetails?.US_CLASS && <div><span className='font-bold'>US_CLASS:</span> <span>{selectedDetails?.US_CLASS}</span></div>}
                          {selectedDetails?.MOD_OPER && <div><span className='font-bold'>MOD_OPER:</span> <span>{selectedDetails?.MOD_OPER}</span></div>}
                          {selectedDetails?.CASENO && <div><span className='font-bold'>CASENO:</span> <span>{selectedDetails?.CASENO}</span></div>}
                          {selectedDetails?.CASEYEAR && <div><span className='font-bold'>CASEYEAR:</span> <span>{selectedDetails?.CASEYEAR}</span></div>}
                          {selectedDetails?.CRSGENERALID && <div><span className='font-bold'>CRSGENERALID:</span> <span>{selectedDetails?.CRSGENERALID}</span></div>}
                          {selectedDetails?.ARREST_DATE && <div><span className='font-bold'>ARREST_DATE:</span> <span>{selectedDetails?.ARREST_DATE}</span></div>}
                        </div>
                      }
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {!isLoadingPccRecords && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 p-3">
                <span className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, crimeData.length)} of {crimeData.length} entries
                </span>
                <div className="flex items-center flex-wrap mx-3 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
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
            <h2 className="text-lg font-semibold">Record found from 'Kolkata Police Criminal Records' :</h2>
            <ul className="list-disc pl-5">
              {selectedRows.map((row, index) => (
                <li key={index} className="text-sm">
                  {row.NAME} - {row.PROV_CRM_NO} (Address: {row.ADDR || 'N/A'})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrimeAcivityTableKolkataPolice;
