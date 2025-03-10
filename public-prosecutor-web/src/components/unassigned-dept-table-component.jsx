"use client"
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { postRequest } from "@/app/commonAPI";

const UnassignedDeptTable = ({ documents, isLoadingDocumentTable, identity }) => {
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);


  const handleAssign = async (doc) => {
    try {
      setIsAssigning(true);
      const response = await postRequest("assigncase", {
        assignId: "0",
        ppUserId: doc.AdvocateId,
        caseId: identity,
        districtId: "0",
        psId: "0",
        EntryUserId: "2",
      });

      // const issent = await postRequest("send-email-pp", {
      //   CaseID: identity,
      //   PPuserID: doc.AdvocateId,
      // });

      // console.log(issent);

      // const res = await postRequest("send-email", {
      //   CaseID: identity,
      // });

      // console.log(res);

      if (response) {
        openAlert("success", "Advocate Assigned & Notifications Sent Successfully!")
      }

      return response;
    } catch (error) {
      console.log("Error:", error);
      return null;
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirm = () => {
    closeAlert()
    window.location.reload();
  }

  return (
    <>
      <CustomAlertDialog
        isOpen={isOpen}
        alertType={alertType}
        alertMessage={alertMessage}
        onClose={closeAlert}
        onConfirm={handleConfirm}
      />
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
                          {isAssigning ? "Please Wait..." : "Assign"}
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
    </>
  );
};

export default UnassignedDeptTable;
