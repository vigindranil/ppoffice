'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ChevronDown, ChevronUp, Eye, MoreHorizontal, Search, Trash2, UserPen } from 'lucide-react'


export default function PPUserTable() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortColumn, setSortColumn] = useState('pp_id')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/getppuser?EntryuserID=2', {
          headers: {
            'Authorization': 'Bearer '+token
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const result = await response.json()
        if (result.status === 0 && result.message === "Data found") {
          setUsers(result.data)
        } else {
          throw new Error(result.message || 'Failed to fetch data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const sortData = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }

    const sortedUsers = [...users].sort((a, b) => {
      if (a[column] < b[column]) return sortDirection === 'asc' ? -1 : 1
      if (a[column] > b[column]) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setUsers(sortedUsers)
  }

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) return <div className="text-center py-10">Loading...</div>
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div>
          <span className="mr-2 text-xs">Total Users: {filteredUsers.length}</span>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              {Object.keys(users[0]).filter((key) => (key == 'pp_name')  || (key == 'pp_username') || (key == 'pp_email')).map((key) => (
                <TableHead key={key} className="font-bold">
                  {key.replace('pp_', '').toUpperCase()}
                </TableHead>
              ))}
              <TableHead className="font-bold">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.pp_id}>
                {Object.entries(user).filter(([key]) => (key == 'pp_name')  || (key == 'pp_username') || (key == 'pp_email')).map(([key, value]) => (
                  <TableCell key={key}>{value}</TableCell>
                ))}
                <TableCell className="flex">
                  <Eye className='text-muted-foreground hover:text-blue-600 hover:font-bold cursor-pointer mr-1' size={16}/>
                  <UserPen className='text-muted-foreground hover:text-yellow-600 hover:font-bold cursor-pointer mr-1' size={16}/>
                  <Trash2 className='text-muted-foreground hover:text-red-600 hover:font-bold cursor-pointer mr-1' size={16}/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              aria-disabled={currentPage === 1}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink 
                href="#" 
                onClick={() => setCurrentPage(i + 1)}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              aria-disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

