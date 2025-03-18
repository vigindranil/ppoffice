"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { PlusCircle } from "lucide-react"
import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast"
import { postRequest } from "@/app/commonAPI"
import { ProgressModal } from "./progress-modal"
import { useSelector } from "react-redux"
import { decrypt } from "@/utils/crypto"

const UnassignedTable = ({ documents, isLoadingDocumentTable, identity }) => {
  const [user, setUser] = useState(null)
  const encryptedUser = useSelector((state) => state.auth.user)
  const token = useSelector((state) => state.auth.token)
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()
  const { toast } = useToast()
  const [isAssigning, setIsAssigning] = useState(false)
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [progressSteps, setProgressSteps] = useState([])
  const [isProcessComplete, setIsProcessComplete] = useState(false)

  const [formData, setFormData] = useState({
    EntryUserID: "",
  })

  useEffect(() => {
    const decoded_user = JSON.parse(decrypt(encryptedUser))
    setUser(decoded_user)
    setFormData((prevState) => ({
      ...prevState,
      EntryUserID: decoded_user.AuthorityUserID,
    }))
  }, [encryptedUser])

  // Helper function to update a specific step's status
  const updateStepStatus = (stepId, status, errorMessage) => {
    setProgressSteps((currentSteps) =>
      currentSteps.map((step) =>
        step.id === stepId ? { ...step, status, ...(errorMessage ? { errorMessage } : {}) } : step,
      ),
    )
  }

  const handleAssign = async (doc) => {
    try {
      setIsAssigning(true)

      // Initialize progress steps
      setProgressSteps([
        { id: "assign", label: `Assigning advocate: ${doc.AdvocateName}`, status: "pending" },
        { id: "emailPrevAdvocates", label: "Notifying previously assigned advocates", status: "pending" },
        { id: "emailAdvocate", label: `Sending email to advocate: ${doc.AdvocateName}`, status: "pending" },
        { id: "emailPrevDepts", label: "Notifying previously assigned departments", status: "pending" },
        { id: "emailOriginDept", label: "Notifying originally assigned department", status: "pending" },
      ])

      // Open the progress modal
      setProgressModalOpen(true)

      // Update the assign step to loading
      updateStepStatus("assign", "loading")

      // Assign the advocate
      const response = await postRequest("assigncase", {
        assignId: "0",
        ppUserId: doc.AdvocateId,
        caseId: identity,
        districtId: "0",
        psId: "0",
        EntryUserId: formData.EntryUserID,
      })

      // Mark assign step as success or error
      if (response) {
        updateStepStatus("assign", "success")
      } else {
        updateStepStatus("assign", "error", "Failed to assign advocate")
        throw new Error("Failed to assign advocate")
      }

      // Update email previous advocates step to loading
      updateStepStatus("emailPrevAdvocates", "loading")

      try {
        // Fetch previously assigned advocates
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
            updateStepStatus("emailPrevAdvocates", "success")
          } else {
            updateStepStatus("emailPrevAdvocates", "error", "Some emails failed to send")
          }
        } else {
          updateStepStatus("emailPrevAdvocates", "success")
          console.log("No previously assigned advocates found.")
        }
      } catch (error) {
        updateStepStatus("emailPrevAdvocates", "error", "Failed to fetch assigned advocates")
        console.log("Error fetching assigned advocates:", error)
      }

      // Update email to new advocate step to loading
      updateStepStatus("emailAdvocate", "loading")

      try {
        // Send email to the assigned advocate
        const issent = await postRequest("send-email-pp", {
          CaseID: identity,
          PPuserID: doc.AdvocateId,
        })

        if (issent) {
          updateStepStatus("emailAdvocate", "success")
        } else {
          updateStepStatus("emailAdvocate", "error", "Failed to send email to advocate")
        }
      } catch (error) {
        updateStepStatus("emailAdvocate", "error", "Error sending email to advocate")
        console.log("Error sending email to advocate:", error)
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
              console.log(`Error sending email to department ${dept.districtName} (${dept.policeStationName}):`, error)
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

      // Update email originating department step to loading
      updateStepStatus("emailOriginDept", "loading")

      try {
        // Send email to the originating department
        const originDeptEmailRes = await postRequest("send-email", {
          CaseID: identity,
          DistrictID: doc.CaseCreatedDistrictId,
          PSID: doc.CaseCreatedPoliceId,
        })

        if (originDeptEmailRes) {
          updateStepStatus("emailOriginDept", "success")
        } else {
          updateStepStatus("emailOriginDept", "error", "Failed to send email to originating department")
        }
      } catch (error) {
        updateStepStatus("emailOriginDept", "error", "Error sending email to originating department")
        console.log("Error sending email to the originating department:", error)
      }

      // Check if all steps were successful
      const allSuccessful = progressSteps.every((step) => step.status === "success")

      if (allSuccessful) {
        openAlert("success", "Advocate Assigned & All Notifications Sent Successfully!")
      } else {
        const completedSteps = progressSteps.filter((step) => step.status === "success").length
        const totalSteps = progressSteps.length
        openAlert(
          "info",
          `Advocate assigned with ${completedSteps}/${totalSteps} steps completed successfully. Check the progress details for more information.`,
        )
      }

      return response
    } catch (error) {
      console.log("Error:", error)
      return null
    } finally {
      setIsAssigning(false)
      setIsProcessComplete(true)
    }
  }

  const handleConfirm = () => {
    closeAlert()
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
        title="Assigning Advocate"
        isComplete={isProcessComplete}
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
                    <TableCell colSpan={2} className="text-center">
                      Loading...
                    </TableCell>
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
                    <TableCell colSpan={2} className="text-center">
                      No Advocates found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default UnassignedTable