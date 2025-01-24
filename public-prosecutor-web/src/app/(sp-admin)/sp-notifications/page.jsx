"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { decrypt } from "@/utils/crypto";
import { CheckCheck } from "lucide-react";

export default function ProfilePage() {
  const [emailDetails, setEmailDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const userDetails = useSelector((state) => state.auth.user);

  const authorityTypeId = 30; // Example authorityTypeId
  const boundaryId = 7; // Example boundaryId

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(userDetails));
    setUser(decoded_user);
  }, [userDetails]);

  const loadEmailDetails = async (authorityTypeId, boundaryId) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/emailDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ "authorityTypeId": authorityTypeId, "boundaryId": boundaryId }),
      });

      const data = await response.json();
      if (response.ok) {
        // console.log(data.data);
        
        setEmailDetails(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    user && loadEmailDetails(user?.AuthorityTypeID, user?.BoundaryID);
    // user && loadEmailDetails(30, 7);
  }, [user]);

  const handleEmailRead = async (authorityTypeId, boundaryId, mailId, caseId) => {
   
    // console.log({ 
    //   "mailId": mailId,
    //   "caseId": caseId,
    //   "authorityTypeId": authorityTypeId,
    //   "boundaryId": boundaryId
    //  });
    
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/emailRead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          "mailId": mailId,
          "caseId": caseId,
          "authorityTypeId": authorityTypeId,
          "boundaryId": boundaryId
         }),
      });

      const data = await response.json();
      if (response.ok) {
        // console.log(data.message);
        // user && loadEmailDetails(30, 7);
        loadEmailDetails(user?.AuthorityTypeID, user?.BoundaryID);
      } else {
        // console.log(data.message);
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-12 w-[250px]" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-3xl mx-auto text-center py-2">
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
          <div className="absolute inset-0 bg-cover bg-center bg-[url('/img/dash1.jpg')]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
          <main className="relative flex-1 p-6 w-full min-h-screen">
            <Card className="w-full max-w-6xl mx-auto bg-white/100 backdrop-blur-sm my-4">
        <CardContent className="p-4 space-y-6">
          {emailDetails && emailDetails.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold mb-4">E-mail Notifications</h3>
              <div className="space-y-4">
                {emailDetails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-4 border ${email?.readStatus != 1 && 'bg-muted' } border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300`}
                  >
                    <div className="text-lg font-medium mb-2">
                      <div className="text-blue-600">
                        E-mail ID: <span className="font-normal text-gray-800">{email.mailId}</span> {email?.readStatus != 1 && <Badge className='h-2 w-2 p-0' variant='destructive'></Badge>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Case Number:</strong> {email.CaseNumber}
                    </p>
                    <div className="mt-4 flex justify-between">
                      <Dialog>
                        <DialogTrigger asChild>
                          {email?.readStatus == 1 ? <Button variant="outline" className="px-4 py-2 rounded-lg transition-colors duration-300">View</Button> : <Button onClick={()=>handleEmailRead(user?.AuthorityTypeID, user?.BoundaryID, email?.id, email?.caseID)} variant="outline" className="px-4 py-2 rounded-lg transition-colors duration-300">View</Button>}
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Mail Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Mail ID:</strong> {email.mailId}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Case Number:</strong> {email.CaseNumber}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>IPC Section:</strong> {email.Ipc_section}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Hearing Date:</strong> {new Date(email.Case_hearingDate).toLocaleString()}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {email?.readStatus == 1 && (<div className="flex"><span className="text-sm text-muted-foreground">seen </span> <CheckCheck className="h-5 w-5 mx-1 text-blue-400" /></div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No email details available</p>
          )}
        </CardContent>
      </Card>
      </main>
    </div>
  );
}
