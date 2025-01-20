// 'use client'

// import { useState, useEffect } from 'react';  // Add this line to import the hooks
// import { BASE_URL } from "@/app/constants";

// const CaseDetails = () => {
//   const [cases, setCases] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Define CaseID (set a default or retrieve dynamically)
//   const CaseID = 190;  // Set this to the CaseID you want to use

//   // Fetch data using useEffect
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = sessionStorage.getItem('token');
//         const response = await fetch(`${BASE_URL}showCaseDetail`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`, // Pass the token in headers if required
//           },
//           body: JSON.stringify({ CaseID: CaseID }), // Pass the defined CaseID
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch case details');
//         }

//         const data = await response.json();
//         setCases(data.data || []);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []); // Empty dependency array ensures this effect runs only once when the component mounts
  
//   if (loading) {
//     return <p>Loading case details...</p>;
//   }

//   if (error) {
//     return <p>Error: {error}</p>;
//   }

//   return (
//     <div>
//       <h1>Case Details</h1>
//       {cases.length > 0 ? (
//         cases.map((caseItem) => (
//           <div key={caseItem.CaseSummaryId} style={{ marginBottom: '20px' }}>
//             <h2>Case Number: {caseItem.CaseNumber}</h2>
//             <p><strong>Description:</strong> {caseItem.CaseDescription}</p>
//             <p><strong>Required Document:</strong> {caseItem.CaseRequiredDocument}</p>
//             <p><strong>Case Date:</strong> {new Date(caseItem.CaseDate).toLocaleString()}</p>
//             <p><strong>Next Hearing Date:</strong> {new Date(caseItem.NextHearingDate).toLocaleString()}</p>
//             {caseItem.Document && (
//               <div>
//                 <strong>Document:</strong> <a href={`file:///${caseItem.Document}`} target="_blank" rel="noopener noreferrer">View Document</a>
//               </div>
//             )}
//             {caseItem.Remarks && <p><strong>Remarks:</strong> {caseItem.Remarks}</p>}
//             {/* Optionally render SPName and PSName */}
//             {caseItem.SPName && <p><strong>SP Name:</strong> {caseItem.SPName}</p>}
//             {caseItem.PSName && <p><strong>PS Name:</strong> {caseItem.PSName}</p>}
//           </div>
//         ))
//       ) : (
//         <p>No case details available.</p>
//       )}
//     </div>
//   );
// };

// export default CaseDetails;



'use client'

import { useState, useEffect } from 'react'
import { BASE_URL } from "@/app/constants"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileText } from 'lucide-react'

const CaseDetails = () => {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const CaseID = 190

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token')
        const response = await fetch(`${BASE_URL}showCaseDetail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ CaseID: CaseID }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch case details')
        }

        const data = await response.json()
        setCases(data.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  
  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
        </CardHeader>
        <CardContent>
          {cases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Required Document</TableHead>
                  <TableHead>Case Date</TableHead>
                  <TableHead>Next Hearing Date</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>SP Name</TableHead>
                  <TableHead>PS Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem) => (
                  <TableRow key={caseItem.CaseSummaryId}>
                    <TableCell>{caseItem.CaseNumber}</TableCell>
                    <TableCell>{caseItem.CaseDescription}</TableCell>
                    <TableCell>{caseItem.CaseRequiredDocument}</TableCell>
                    <TableCell>{new Date(caseItem.CaseDate).toLocaleString()}</TableCell>
                    <TableCell>{new Date(caseItem.NextHearingDate).toLocaleString()}</TableCell>
                    <TableCell>
                      {caseItem.Document && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`file:///${caseItem.Document}`} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" />
                            View
                          </a>
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{caseItem.Remarks}</TableCell>
                    <TableCell>{caseItem.SPName}</TableCell>
                    <TableCell>{caseItem.PSName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Data</AlertTitle>
              <AlertDescription>
                No case details available.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className="container mx-auto p-4">
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-[200px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

const ErrorMessage = ({ message }) => (
  <div className="container mx-auto p-4">
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  </div>
)

export default CaseDetails

