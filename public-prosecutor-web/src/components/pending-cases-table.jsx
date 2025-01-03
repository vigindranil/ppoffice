'use client'

import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ClipboardPlus, LoaderCircle } from 'lucide-react'


export default function CaseTable() {
  const [selectedCase, setSelectedCase] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const casesPerPage = 10
  const [allCases, setAllCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const indexOfLastCase = currentPage * casesPerPage
  const indexOfFirstCase = indexOfLastCase - casesPerPage
  const currentCases = allCases.slice(indexOfFirstCase, indexOfLastCase)

  const totalPages = Math.ceil(allCases.length / casesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const showallCaseBetweenRange = async (start, end) => {
      
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/showallCaseBetweenRange', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "startDate": start,
          "endDate": end
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const result = await response.json()
      if (result.status === 0) {
        setAllCases(result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    showallCaseBetweenRange(null, null)
  }, [])

  if (loading) return <div className="text-center py-10"><LoaderCircle className='animate-spin mx-auto' /></div>
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>

  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-100">
            <TableHead className="font-bold">PP User Name</TableHead>
            <TableHead className="font-bold">Case Number</TableHead>
            <TableHead className="font-bold">PS Name</TableHead>
            <TableHead className="font-bold">Case Date</TableHead>
            <TableHead className="font-bold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentCases.map((caseItem, index) => (
            <TableRow key={index}>
              <TableCell>{caseItem.PPuserName}</TableCell>
              <TableCell>{caseItem.CaseNumber}</TableCell>
              <TableCell>{caseItem.PsName}</TableCell>
              <TableCell>{formatDate(caseItem.CaseDate)}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className=""
                      onClick={() => setSelectedCase(caseItem)}
                    >
                      <ClipboardPlus /> Assign Case
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Assign Case</DialogTitle>
                    </DialogHeader>
                    <Card>
                      <CardHeader>
                        <CardTitle>Case Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedCase && (
                          <>
                          <div className="space-y-2">
                            <p><strong>PP User Name:</strong> {selectedCase.PPuserName}</p>
                            <p><strong>Case Number:</strong> {selectedCase.CaseNumber}</p>
                            <p><strong>SP Name:</strong> {selectedCase.SpName}</p>
                            <p><strong>PS Name:</strong> {selectedCase.PsName}</p>
                            <p><strong>Case Date:</strong> {formatDate(selectedCase.CaseDate)}</p>
                            <p><strong>Case Type:</strong> {selectedCase.CaseType}</p>
                            <p><strong>Case Hearing Date:</strong> {formatDate(selectedCase.CaseHearingDate)}</p>
                          </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Button className="bg-blue-500 hover:bg-blue-600">Assign</Button>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
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
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

