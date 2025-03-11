"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { PlusCircle } from "lucide-react"
import { postRequest } from "@/app/commonAPI"

const UnassignedDeptTable = ({ identity }) => {
  const [districts, setDistricts] = useState([])
  const [policeStations, setPoliceStations] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedPoliceStation, setSelectedPoliceStation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()

  useEffect(() => {
    fetchDistricts()
  }, [])

  const fetchDistricts = async () => {
    try {
      setIsLoading(true)
      const response = await postRequest("alldistrict-case", { caseId: identity })
      if (response.status === 0 && response.data) {
        setDistricts(response.data)
      }
    } catch (error) {
      console.error("Error fetching districts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPoliceStations = async (districtId) => {
    try {
      setIsLoading(true)
      const response = await postRequest("allps-case-district", { caseId: identity, districtId })
      if (response.status === 0 && response.data) {
        setPoliceStations(response.data)
      }
    } catch (error) {
      console.error("Error fetching police stations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDistrictChange = (e) => {
    const districtId = e.target.value
    setSelectedDistrict(districtId)
    setSelectedPoliceStation("")
    if (districtId) {
      fetchPoliceStations(districtId)
    } else {
      setPoliceStations([])
    }
  }

  const handlePoliceStationChange = (e) => {
    setSelectedPoliceStation(e.target.value)
  }

  const handleAssign = async () => {
    if (!selectedDistrict || !selectedPoliceStation) {
      toast({
        title: "Error",
        description: "Please select both district and police station",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await postRequest("assigncase", {
        assignId: "0",
        ppUserId: "0",
        caseId: identity,
        districtId: selectedDistrict,
        psId: selectedPoliceStation,
        EntryUserId: "2", // This should be dynamic based on logged in user
      })

      if (response.success) {
        openAlert("success", "Department Assigned & Notifications Sent Successfully!")
      }
    } catch (error) {
      console.error("Error assigning department:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = () => {
    closeAlert()
    setSelectedDistrict("")
    setSelectedPoliceStation("")
    setPoliceStations([])
    fetchDistricts()
    window.location.reload()
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
        <CardContent className="p-6">
          <div className="grid gap-6">
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                Select District
              </label>
              <select
                id="district"
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={isLoading}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select a district</option>
                {districts.map((district) => (
                  <option key={district.districtId} value={district.districtId}>
                    {district.districtName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="policeStation" className="block text-sm font-medium text-gray-700 mb-1">
                Select Police Station
              </label>
              <select
                id="policeStation"
                value={selectedPoliceStation}
                onChange={handlePoliceStationChange}
                disabled={!selectedDistrict || isLoading}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select a police station</option>
                {policeStations.map((station) => (
                  <option key={station.policeStationId} value={station.policeStationId}>
                    {station.policeStationName}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleAssign}
              disabled={!selectedDistrict || !selectedPoliceStation || isLoading}
              className="mt-4"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {isLoading ? "Assigning..." : "Assign Department"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default UnassignedDeptTable