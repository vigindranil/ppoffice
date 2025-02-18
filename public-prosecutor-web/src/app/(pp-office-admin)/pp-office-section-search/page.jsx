"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Check, ChevronsUpDown } from "lucide-react"
import { BASE_URL } from "@/app/constants"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandInput } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const SearchComponent = () => {
  const [searchTerms, setSearchTerms] = useState({
    bnsSection: "",
    ipcSection: "",
    subject: "",
    summary: "",
  })
  const [searchResults, setSearchResults] = useState({
    bnsSection: [],
    ipcSection: [],
    subject: [],
    summary: [],
  })
  const [selectedBnsSection, setSelectedBnsSection] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [correspondingInfo, setCorrespondingInfo] = useState({
    BnsSection: "",
    IpcSection: "",
    IbsSubject: "",
    IbsSummary: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({
    bnsSection: null,
    ipcSection: null,
    subject: null,
    summary: null,
  })
  const [openCombobox, setOpenCombobox] = useState({
    bnsSection: false,
    ipcSection: false,
    subject: false,
    summary: false,
  })

  const clearOtherFields = (currentType) => {
    const newTerms = { bnsSection: "", ipcSection: "", subject: "", summary: "" }
    newTerms[currentType] = searchTerms[currentType]
    setSearchTerms(newTerms)
  }

  const debouncedSearch = useDebounce(handleSearch, 500)

  async function handleSearch(type, term) {
    if (!term) {
      setSearchResults({ ...searchResults, [type]: [] })
      return
    }

    setIsLoading(true)
    setErrors({ ...errors, [type]: null })

    try {
      const token = sessionStorage.getItem("token")
      const response = await fetch(`${BASE_URL}search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, searchTerm: term }),
      })

      const data = await response.json()

      if (data.status === 0) {
        setSearchResults({ ...searchResults, [type]: data.data })
      } else {
        setErrors({ ...errors, [type]: data.message })
        setSearchResults({ ...searchResults, [type]: [] })
      }
    } catch (err) {
      console.error("Search error:", err)
      setErrors({ ...errors, [type]: "An error occurred during search." })
      setSearchResults({ ...searchResults, [type]: [] })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBnsSectionSelect = useCallback(async (bnsSection) => {
    setSelectedSubject(null)
    setSelectedBnsSection(bnsSection)
    setSearchTerms({ ...searchTerms, bnsSection: bnsSection.bnsSection })

    try {
      const token = sessionStorage.getItem("token")
      const response = await fetch(`${BASE_URL}showIbsByBnsId`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bnsId: bnsSection.bnsId }),
      })

      const data = await response.json()

      if (data.status === 0) {
        setCorrespondingInfo(data.data[0])
      } else {
        console.error("Error fetching corresponding info:", data.message)
      }
    } catch (error) {
      console.error("Error fetching corresponding info:", error)
    }
  }, [searchTerms])

  const handleSubjectSelect = useCallback(async (subject) => {
    setSelectedBnsSection(null)
    setSelectedSubject(subject)
    setSearchTerms({ ...searchTerms, subject: subject.ibsSubject })

    try {
      const token = sessionStorage.getItem("token")
      const response = await fetch(`${BASE_URL}showIbsByBnsId`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bnsId: subject.bnsId }),
      })

      const data = await response.json()

      if (data.status === 0) {
        setCorrespondingInfo(data.data[0])
      } else {
        console.error("Error fetching corresponding info:", data.message)
      }
    } catch (error) {
      console.error("Error fetching corresponding info:", error)
    }
  }, [searchTerms])

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(searchTerms).map((type) => (
              <div key={type} className="space-y-2">
                <label htmlFor={type} className="text-sm font-medium capitalize">
                  {type}
                </label>
                <Popover
                  open={openCombobox[type]}
                  onOpenChange={(open) => {
                    if (open) clearOtherFields(type)
                    setOpenCombobox({ ...openCombobox, [type]: open })
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {searchTerms[type] || `Search ${type}...`}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder={`Search ${type}...`}
                        className="h-9"
                        onValueChange={(value) => {
                          setSearchTerms({ ...searchTerms, [type]: value })
                          debouncedSearch(type, value)
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                          {searchResults[type].map((item) => (
                            <CommandItem
                              key={item.bnsId}
                              value={item.ibsSubject || item.bnsSection}
                              onSelect={() => {
                                setSearchTerms({ ...searchTerms, [type]: item.ibsSubject || item.bnsSection })
                                setOpenCombobox({ ...openCombobox, [type]: false })
                                if (type === "bnsSection") handleBnsSectionSelect(item)
                                if (type === "subject") handleSubjectSelect(item)
                              }}
                            >
                              {item.ibsSubject || item.bnsSection}
                              <Check className="ml-auto opacity-100" />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedBnsSection && (
        <Card>
          <CardHeader>
            <CardTitle>Corresponding Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="text-sm font-medium">IPC Section</label>
              <input className="w-full border p-2 rounded" type="text" value={correspondingInfo.IpcSection} readOnly />
              <label className="text-sm font-medium">Subject</label>
              <input className="w-full border p-2 rounded" type="text" value={correspondingInfo.IbsSubject} readOnly />
              <label className="text-sm font-medium">Summary</label>
              <textarea className="w-full border p-2 rounded" type="text" value={correspondingInfo.IbsSummary} readOnly />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle>Corresponding Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="text-sm font-medium">BNS Section</label>
              <input className="w-full border p-2 rounded" type="text" value={correspondingInfo.BnsSection} readOnly />
              <label className="text-sm font-medium">IPC Section</label>
              <input className="w-full border p-2 rounded" type="text" value={correspondingInfo.IpcSection} readOnly />
              <label className="text-sm font-medium">Summary</label>
              <textarea className="w-full border p-2 rounded" type="text" value={correspondingInfo.IbsSummary} readOnly />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function useDebounce(func, delay) {
  const [debouncedFunction] = useState(() => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }, [])

  return debouncedFunction
}

export default SearchComponent