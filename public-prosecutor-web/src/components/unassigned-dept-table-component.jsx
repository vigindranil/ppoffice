"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { PlusCircle } from "lucide-react"
import { postRequest } from "@/app/commonAPI"
import { ProgressModal } from "./progress-modal"

const UnassignedDeptTable = ({ identity }) => {
  const [districts, setDistricts] = useState([])
  const [policeStations, setPoliceStations] = useState([])
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedPoliceStation, setSelectedPoliceStation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [progressSteps, setProgressSteps] = useState([])
  const [isProcessComplete, setIsProcessComplete] = useState(false)

  useEffect(() => {
    fetchDistricts()
  }, [])

  const fetchDistricts = async () => {
    try {
      setIsLoading(true)
      const response = await postRequest("alldistrict-case", { caseId: identity })
      console.log(response)
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

  // Helper function to update a specific step's status
  const updateStepStatus = (stepId, status, errorMessage) => {
    setProgressSteps((currentSteps) =>
      currentSteps.map((step) =>
        step.id === stepId ? { ...step, status, ...(errorMessage ? { errorMessage } : {}) } : step,
      ),
    )
  }

  const handleAssign = async () => {
    if (!selectedDistrict || !selectedPoliceStation) {
      openAlert("error", "Please select both district and police station")
      return
    }

    try {
      setIsLoading(true)

      // Get district and police station names for display
      // const districtName = districts.find((d) => d.districtId === selectedDistrict)?.districtName || "Selected district"
      // const psName =
      //   policeStations.find((p) => p.policeStationId === selectedPoliceStation)?.policeStationName ||
      //   "Selected police station"

      // Initialize progress steps
      setProgressSteps([
        // { id: "assign", label: `Assigning department: ${districtName} - ${psName}`, status: "pending" },
        { id: "assign", label: `Assigning Selected Department`, status: "pending" },
        { id: "emailAdvocates", label: "Notifying assigned advocates", status: "pending" },
        { id: "emailPrevDepts", label: "Notifying previously assigned departments", status: "pending" },
        { id: "emailNewDept", label: "Notifying newly assigned department", status: "pending" },
      ])

      // Open the progress modal
      setProgressModalOpen(true)

      // Update the assign step to loading
      updateStepStatus("assign", "loading")

      // Assign department
      const response = await postRequest("assigncase", {
        assignId: "0",
        ppUserId: "0",
        caseId: identity,
        districtId: selectedDistrict,
        psId: selectedPoliceStation,
        EntryUserId: "2", // Should be dynamic based on logged-in user
      })

      if (response.status === 0) {
        updateStepStatus("assign", "success")
        console.log("Department assigned successfully")

        // Update email advocates step to loading
        updateStepStatus("emailAdvocates", "loading")

        try {
          // Fetch assigned advocates
          const assignedAdvResponse = await postRequest("assigned-advocates", { caseId: identity })

          if (assignedAdvResponse?.data?.length > 0) {
            let allEmailsSent = true

            for (const adv of assignedAdvResponse.data) {
              try {
                const advEmailRes = await postRequest("send-email-pp", {
                  CaseID: identity,
                  PPuserID: adv.advocateId,
                })

                if (!advEmailRes) {
                  allEmailsSent = false
                  console.log(`Failed to send email to advocate ${adv.advocateName}`)
                }
              } catch (error) {
                allEmailsSent = false
                console.log(`Error sending email to advocate ${adv.advocateName}:`, error)
              }
            }

            if (allEmailsSent) {
              updateStepStatus("emailAdvocates", "success")
            } else {
              updateStepStatus("emailAdvocates", "error", "Some advocate emails failed to send")
            }
          } else {
            updateStepStatus("emailAdvocates", "success")
            console.log("No previously assigned advocates found.")
          }
        } catch (error) {
          updateStepStatus("emailAdvocates", "error", "Failed to fetch assigned advocates")
          console.log("Error fetching assigned advocates:", error)
        }

        // Update email previous departments step to loading
        updateStepStatus("emailPrevDepts", "loading")

        try {
          // Fetch previously assigned departments
          const assignedDeptResponse = await postRequest("assigned-dept", { caseId: identity })

          if (assignedDeptResponse?.data?.length > 0) {
            let allDeptEmailsSent = true

            for (const dept of assignedDeptResponse.data) {
              try {
                const deptEmailRes = await postRequest("send-email", {
                  CaseID: identity,
                  DistrictID: dept.districtId,
                  PSID: dept.policeStationId,
                })

                if (!deptEmailRes) {
                  allDeptEmailsSent = false
                  console.log(`Failed to send email to department ${dept.districtName} (${dept.policeStationName})`)
                }
              } catch (error) {
                allDeptEmailsSent = false
                console.log(
                  `Error sending email to department ${dept.districtName} (${dept.policeStationName}):`,
                  error,
                )
              }
            }

            if (allDeptEmailsSent) {
              updateStepStatus("emailPrevDepts", "success")
            } else {
              updateStepStatus("emailPrevDepts", "error", "Some department emails failed to send")
            }
          } else {
            updateStepStatus("emailPrevDepts", "success")
            console.log("No previously assigned departments found.")
          }
        } catch (error) {
          updateStepStatus("emailPrevDepts", "error", "Failed to fetch assigned departments")
          console.log("Error fetching assigned departments:", error)
        }

        // Update email new department step to loading
        updateStepStatus("emailNewDept", "loading")

        try {
          // Send email to the newly assigned department
          const newDeptEmailRes = await postRequest("send-email", {
            CaseID: identity,
            DistrictID: selectedDistrict,
            PSID: selectedPoliceStation,
          })

          if (newDeptEmailRes) {
            updateStepStatus("emailNewDept", "success")
          } else {
            updateStepStatus("emailNewDept", "error", "Failed to send email to newly assigned department")
          }

          console.log("Email sent to the newly assigned department:", newDeptEmailRes)
        } catch (error) {
          updateStepStatus("emailNewDept", "error", "Error sending email to newly assigned department")
          console.log("Error sending email to the newly assigned department:", error)
        }

        // Check if all steps were successful
        const allSuccessful = progressSteps.every((step) => step.status === "success")

        if (allSuccessful) {
          openAlert("success", "Department Assigned & All Notifications Sent Successfully!")
        } else {
          const completedSteps = progressSteps.filter((step) => step.status === "success").length
          const totalSteps = progressSteps.length
          openAlert(
            "info",
            `Department assigned with ${completedSteps}/${totalSteps} steps completed successfully. Check the progress details for more information.`,
          )
        }
      } else {
        updateStepStatus("assign", "error", "Failed to assign department")
        openAlert("error", "Failed to assign department. Please try again.")
      }
    } catch (error) {
      console.error("Error assigning department:", error)
      openAlert("error", "Failed to assign department. Please try again.")
    } finally {
      setIsLoading(false)
      setIsProcessComplete(true)
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

  const closeProgressModal = () => {
    setProgressModalOpen(false)
    setIsProcessComplete(false)
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
      <ProgressModal
        isOpen={progressModalOpen}
        onClose={closeProgressModal}
        steps={progressSteps}
        title="Assigning Department"
        isComplete={isProcessComplete}
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