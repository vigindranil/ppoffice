"use client"
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { postRequest } from "@/app/commonAPI";

const UnassignedTable = ({ documents, isLoadingDocumentTable, identity }) => {
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);

  // const handleAssign = async (doc) => {
  //   try {
  //     setIsAssigning(true);
  //     const response = await fetch(`${BASE_URL}assigncase`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         assignId: "0",
  //         ppUserId: doc.AdvocateId,
  //         caseId: identity,
  //         districtId: "0",
  //         psId: "0",
  //         EntryUserId: "2",
  //       }),
  //     });
      
  //     const result = await response.json();
  //     if (response.ok) {
  //       toast({ description: "Case assigned successfully!", status: "success" });
  //       window.location.reload();
  //     } else {
  //       toast({ description: result.message || "Failed to assign case", status: "error" });
  //     }
  //   } catch (error) {
  //     toast({ description: "An error occurred. Please try again.", status: "error" });
  //   } finally {
  //     setIsAssigning(false);
  //   }
  // };


  const handleAssign = async (doc) => {
    try {
      setIsAssigning(true);
      return await postRequest("assigncase", {
        assignId: "0",
        ppUserId: doc.AdvocateId,
        caseId: identity,
        districtId: "0",
        psId: "0",
        EntryUserId: "2",
      });
    } catch (error) {
      console.log("Error:", error);
      return null;
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Card className="m-5">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100 hover:bg-slate-100">
                <TableHead>Advocate Name</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingDocumentTable ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : documents?.length > 0 ? (
                documents.map((doc, index) => (
                  <TableRow key={index}>
                    <TableCell>{doc.AdvocateName}</TableCell>
                    <TableCell>
                      <Button
                        className="bg-blue-100 hover:bg-blue-200 text-sm text-blue-600"
                        onClick={() => handleAssign(doc)}
                        disabled={isAssigning}
                      >
                        <PlusCircle className="text-blue-600 mr-2 h-4 w-4" />
                        {isAssigning ? "Assigning..." : "Assign"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">No Advocates found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnassignedTable;
