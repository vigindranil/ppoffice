

// "use client";
// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';

// export default function ProfilePage() {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [emailDetails, setEmailDetails] = useState(null);

//   // Dynamic request body data
//   const authorityTypeId = 30; // Example authorityTypeId
//   const boundaryId = 7; // Example boundaryId

//   useEffect(() => {
//     // Load email details from the backend
//     const loadEmailDetails = async () => {
//       setLoading(true);
//       try {
//         const token = sessionStorage.getItem('token');
//         const response = await fetch('http://localhost:8000/api/emailDetails', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             authorityTypeId: authorityTypeId, // Dynamic value
//             boundaryId: boundaryId // Dynamic value
//           })
//         });

//         const data = await response.json();
//         if (response.ok) {
//           setEmailDetails(data.data); // Set the data from the response
//         } else {
//           setError(data.message); // Handle errors if any
//         }
//       } catch (err) {
//         setError('An error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadEmailDetails();
//   }, []); // Empty dependency array to run once on mount

//   if (loading) {
//     return (
//       <div className="container mx-auto py-10">
//         <Card className="w-full max-w-3xl mx-auto">
//           <CardHeader>
//             <Skeleton className="h-12 w-[250px]" />
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-col space-y-4">
//               <Skeleton className="h-4 w-[200px]" />
//               <Skeleton className="h-4 w-[150px]" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto py-10">
//         <Card className="w-full max-w-3xl mx-auto bg-red-50">
//           <CardHeader>
//             <CardTitle className="text-red-600">Error</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-red-600">{error}</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-10">
//       <Card className="w-full max-w-3xl mx-auto">
//         <CardHeader>
//           <CardTitle>Profile Email Details</CardTitle>
//         </CardHeader>
//         <CardContent className="p-4 space-y-6">
//   {emailDetails && emailDetails.length > 0 ? (
//     <div>
//       <h3 className="text-xl font-semibold mb-4">Case Details:</h3>
//       <div className="space-y-4">
//         {emailDetails.map((email) => (
//           <div
//             key={email.id}
//             className="p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
//           >
//             <div className="text-lg font-medium mb-2">
//               <p className="text-blue-600">Mail ID: <span className="font-normal text-gray-800">{email.mailId}</span></p>
//             </div>
//             <p className="text-sm text-gray-600 mb-1">
//               <strong>Case Number:</strong> {email.caseNumber}
//             </p>
//             <p className="text-sm text-gray-600 mb-1">
//               <strong>IPC Section:</strong> {email.Ipc_section}
//             </p>
//             <p className="text-sm text-gray-600 mb-1">
//               <strong>Hearing Date:</strong> {new Date(email.Case_hearingDate).toLocaleString()}
//             </p>
//             <div className="mt-6 text-center">
// <a href="/ps-email-view"><button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">
//           View
//         </button></a>
//       </div>
//           </div>

//         ))}

//       </div>

//     </div>
//   ) : (
//     <p className="text-center text-gray-500">No email details available</p>
//   )}
// </CardContent>
//       </Card>
//     </div>
//   );
// }

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

  useEffect(() => {
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

    // user && loadEmailDetails(user?.AuthorityUserID, user?.BoundaryID);
    user && loadEmailDetails(30, 7);
  }, [user]);

  const handleEmailRead = async (authorityTypeId, boundaryId, mailId, caseId) => {

    console.log({
      "mailId": mailId,
      "caseId": caseId,
      "authorityTypeId": authorityTypeId,
      "boundaryId": boundaryId
     });

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
        console.log(data.message);
      } else {
        console.log(data.message);
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
        <Card className="w-full max-w-3xl mx-auto bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-4 space-y-6">
          {emailDetails && emailDetails.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold mb-4">Email Notifications</h3>
              <div className="space-y-4">
                {emailDetails.map((email) => (
                  <div
                    key={email.id}
                    className="p-4 border bg-muted border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="text-lg font-medium mb-2">
                      <div className="text-blue-600">
                        Mail ID: <span className="font-normal text-gray-800">{email.mailId}</span> <Badge className='h-2 w-2 p-0' variant='destructive'></Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Case Number:</strong> {email.caseNumber}
                    </p>
                    <div className="mt-4 flex justify-between">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={()=>handleEmailRead(user?.AuthorityUserID, user?.BoundaryID, email?.id, email?.CaseId)} variant="outline" className="px-4 py-2 rounded-lg transition-colors duration-300">
                          {/* <Button variant="outline" className="px-4 py-2 rounded-lg transition-colors duration-300"> */}
                            View
                          </Button>
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
                              <strong>Case Number:</strong> {email.caseNumber}
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
                      <div className="flex"><span className="text-sm text-muted-foreground">seen </span> <CheckCheck className="h-5 w-5 mx-1 text-blue-400" /></div>
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
    </div>
  );
}
