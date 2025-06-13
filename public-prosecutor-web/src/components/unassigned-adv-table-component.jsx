"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { ArrowUpCircle, PlusCircle } from "lucide-react"
import { Button } from "./ui/button"
import { useToast } from "@/hooks/use-toast"
import { postRequest } from "@/app/commonAPI"
import { ProgressModal } from "./progress-modal"
import { useSelector } from "react-redux"
import { decrypt } from "@/utils/crypto"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { addPPUser } from '@/app/api'
import { isValidIndianPhoneNumber, isValidEmail } from '@/utils/validation'
import { Eye, EyeOff } from 'lucide-react';

const AddAdvocateModal = ({
  isOpen,
  onOpenChange,
  formData,
  formErrors,
  handleChange,
  handleSubmit,
  isLoading,
  showPassword,
  setShowPassword
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[600px] bg-white">
      <DialogHeader>
        <DialogTitle>Add New Advocate</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4 py-4">
        {/* Row 1: Full Name & Contact Number */}
        <div className="flex space-x-4">
          <div className="flex-1 space-y-1">
            <Label className="font-bold text-sm" htmlFor="modalFullName">Full Name</Label>
            <Input
              id="modalFullName"
              name="FullName"
              placeholder="Enter full name"
              value={formData.FullName}
              onChange={handleChange}
              required
              maxLength={30}
              className="text-sm"
            />
            {formErrors.FullName && <p className="text-xs text-red-500">{formErrors.FullName}</p>}
          </div>
          <div className="flex-1 space-y-1">
            <Label className="font-bold text-sm" htmlFor="modalContractNo">Contact Number</Label>
            <Input
              id="modalContractNo"
              name="ContractNo"
              type="tel"
              placeholder="Enter contact number"
              value={formData.ContractNo}
              onChange={handleChange}
              required
              maxLength={10}
              className={`text-sm ${formErrors.ContractNo ? 'border-red-500' : ''}`}
            />
            {formErrors.ContractNo && <p className="text-xs text-red-500">{formErrors.ContractNo}</p>}
          </div>
        </div>

        {/* Row 2: Username & Password */}
        <div className="flex space-x-4">
          <div className="flex-1 space-y-1">
            <Label className="font-bold text-sm" htmlFor="modalUsername">Username</Label>
            <Input
              id="modalUsername"
              name="Username"
              placeholder="Enter username"
              value={formData.Username}
              onChange={handleChange}
              required
              className="text-sm"
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="font-bold text-sm" htmlFor="modalUserPassword">Password</Label>
            <div className="relative">
              <Input
                id="modalUserPassword"
                name="UserPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formData.UserPassword}
                onChange={handleChange}
                required
                className="text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent"
                // Use onMouseDown/Up/Leave to toggle showPassword via the passed setter
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Row 3: Email & License Number */}
        <div className="flex space-x-4">
          <div className="flex-1 space-y-1">
            <Label className="font-bold text-sm" htmlFor="modalEmail">Email</Label>
            <Input
              id="modalEmail"
              name="Email"
              type="email"
              placeholder="Enter e-mail address"
              value={formData.Email}
              onChange={handleChange}
              required
              className={`text-sm ${formErrors.Email ? 'border-red-500' : ''}`}
            />
            {formErrors.Email && <p className="text-xs text-red-500">{formErrors.Email}</p>}
          </div>
          <div className="flex-1 space-y-1">
            <Label className="font-bold text-sm" htmlFor="modalLicenseNumber">License Number</Label>
            <Input
              id="modalLicenseNumber"
              name="LicenseNumber"
              placeholder="Enter license number"
              value={formData.LicenseNumber}
              onChange={handleChange}
              required // Assuming license is required, adjust if not
              className="text-sm"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
        </DialogClose>
        <Button onClick={handleSubmit} disabled={isLoading || Object.values(formErrors).some(error => error !== '')}>
          {isLoading ? 'Adding...' : 'Add Advocate'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const UnassignedTable = ({ documents, isLoadingDocumentTable, identity }) => {

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const shouldShow = scrollTop > window.innerHeight / 2;
      setShowScrollTop(shouldShow);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [user, setUser] = useState(null);
  const encryptedUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog();
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressSteps, setProgressSteps] = useState([]);
  const [isProcessComplete, setIsProcessComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedAdvocates, setSelectedAdvocates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // State specifically for the Add Advocate Modal
  const [isAddAdvocateModalOpen, setIsAddAdvocateModalOpen] = useState(false);
  const [isAddingAdvocate, setIsAddingAdvocate] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Keep password visibility state here
  const [newAdvocateFormData, setNewAdvocateFormData] = useState({
    Username: '', UserPassword: '', EntryUserID: '',
    FullName: '', ContractNo: '', Email: '', LicenseNumber: ''
  });
  const [newAdvocateFormErrors, setNewAdvocateFormErrors] = useState({
    FullName: '', ContractNo: '', Email: '',
  });

  const toggleSelection = (doc) => {
    const isAlreadySelected = selectedAdvocates.some((a) => a.AdvocateId === doc.AdvocateId);
    if (isAlreadySelected) {
      setSelectedAdvocates((prev) => prev?.filter((a) => a.AdvocateId !== doc.AdvocateId));
    } else {
      setSelectedAdvocates((prev) => [doc, ...prev]);
    }
  };

  const handleBatchAssign = async () => {
    setIsAssigning(true);
    setProgressModalOpen(true);
    setProgressSteps([
      { id: "assign", label: "Assigning advocates", status: "loading" },
      { id: "emailAdvocates", label: "Notifying assigned advocates", status: "pending" },
      { id: "emailDepts", label: "Notifying assigned departments", status: "pending" },
    ]);

    try {
      const ppUserIds = selectedAdvocates.map((a) => a.AdvocateId);

      // Step 1: Assign
      const response = await postRequest("assign-case-to-advocates", {
        caseId: identity,
        EntryUserId: formData.EntryUserID,
        ppUserIds,
      });

      if (!response?.success || !Array.isArray(response.assignedPPUserIDs)) {
        updateStepStatus("assign", "error", "Assignment failed.");
        openAlert("error", "Assignment failed.");
        return;
      }

      updateStepStatus("assign", "success");

      // Step 2: Notify Advocates
      updateStepStatus("emailAdvocates", "loading");

      try {
        await postRequest("send-email-pp-v2", {
          CaseID: identity,
          PPuserID_array: response.assignedPPUserIDs,
        });

        updateStepStatus("emailAdvocates", "success");
      } catch (err) {
        updateStepStatus("emailAdvocates", "error", "Failed to send emails to advocates.");
        console.error("Email error:", err);
      }

      // Step 3: Notify Departments
      updateStepStatus("emailDepts", "loading");

      const deptRes = await postRequest("assigned-dept", { caseId: identity });
      const deptList = deptRes?.data || [];

      const deptPayload = deptList.map((dept) => ({
        DistrictID: dept.districtId,
        PSID: dept.policeStationId,
      }));

      // Optionally remove duplicates:
      const seen = new Set();
      const uniqueDepts = deptPayload?.filter(({ DistrictID, PSID }) => {
        const key = `${DistrictID}-${PSID}`;
        return seen.has(key) ? false : seen.add(key);
      });

      try {
        const emailRes = await postRequest("send-email", {
          CaseID: identity,
          Departments: uniqueDepts,
        });

        if (emailRes?.status === 0) {
          updateStepStatus("emailDepts", "success");
        } else {
          updateStepStatus("emailDepts", "error", "Some departments failed to receive email.");
        }
      } catch (err) {
        updateStepStatus("emailDepts", "error", "Failed to notify departments.");
        console.error("Dept bulk email error:", err);
      }

      // try {
      //   const deptRes = await postRequest("assigned-dept", { caseId: identity });
      //   const deptList = deptRes?.data || [];

      //   let allSuccess = true;

      //   for (const dept of deptList) {
      //     try {
      //       const res = await postRequest("send-email", {
      //         CaseID: identity,
      //         DistrictID: dept.districtId,
      //         PSID: dept.policeStationId,
      //       });

      //       if (!res?.success) {
      //         allSuccess = false;
      //         console.warn(`Failed to notify department: ${dept.districtName} / ${dept.policeStationName}`);
      //       }
      //     } catch (err) {
      //       allSuccess = false;
      //       console.error("Dept email error:", err);
      //     }
      //   }

      //   if (allSuccess) {
      //     updateStepStatus("emailDepts", "success");
      //   } else {
      //     updateStepStatus("emailDepts", "error", "Some departments failed to receive email.");
      //   }

      // } catch (err) {
      //   updateStepStatus("emailDepts", "error", "Failed to fetch assigned departments.");
      //   console.error("Dept fetch error:", err);
      // }

      openAlert("success", `${response.assignedPPUserIDs.length} advocates assigned successfully.`);

    } catch (err) {
      updateStepStatus("assign", "error", "Unexpected error.");
      openAlert("error", "An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsAssigning(false);
      setIsProcessComplete(true);
      setModalOpen(false);
    }
  };

  // State for assigning cases (original functionality)
  const [formData, setFormData] = useState({ EntryUserID: "" });

  useEffect(() => {
    if (encryptedUser) {
      try {
        const decoded_user = JSON.parse(decrypt(encryptedUser));
        setUser(decoded_user);
        // Set EntryUserID for BOTH forms
        setFormData((prevState) => ({ ...prevState, EntryUserID: decoded_user.AuthorityUserID }));
        setNewAdvocateFormData(prevState => ({ ...prevState, EntryUserID: decoded_user.AuthorityUserID }));
      } catch (error) {
        console.error("Failed to decode user:", error);
      }
    }
  }, [encryptedUser]);

  const handleNewAdvocateChange = (e) => {
    const { name, value } = e.target;
    setNewAdvocateFormData(prevState => ({ ...prevState, [name]: value }));
    if (newAdvocateFormErrors[name]) {
      setNewAdvocateFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateNewAdvocateForm = () => {
    const errors = { FullName: '', ContractNo: '', Email: '' };
    let isValid = true;

    if (!newAdvocateFormData.FullName.trim()) {
      errors.FullName = 'Full Name is required';
      isValid = false;
    }
    if (!newAdvocateFormData.Username.trim()) {
      errors.Username = 'Username is required';
      isValid = false;
    }
    if (!newAdvocateFormData.UserPassword.trim()) {
      errors.Password = 'Password is required';
      isValid = false;
    }
    if (!newAdvocateFormData.ContractNo.trim()) {
      errors.ContractNo = 'Contact Number is required';
      isValid = false;
    } else if (!isValidIndianPhoneNumber(newAdvocateFormData.ContractNo)) {
      errors.ContractNo = 'Invalid Indian phone number';
      isValid = false;
    }
    if (!newAdvocateFormData.Email.trim()) {
      errors.Email = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(newAdvocateFormData.Email)) {
      errors.Email = 'Invalid email address';
      isValid = false;
    }
    // Add check for LicenseNumber if required
    // if (!newAdvocateFormData.LicenseNumber.trim()) {
    //     errors.LicenseNumber = 'License Number is required';
    //     isValid = false;
    // }

    setNewAdvocateFormErrors(errors);
    return isValid;
  };

  const handleAddAdvocateSubmit = async () => {
    if (!validateNewAdvocateForm()) {
      return;
    }
    setIsAddingAdvocate(true);
    try {
      // Ensure EntryUserID is set correctly before API call
      const payload = { ...newAdvocateFormData, EntryUserID: user.AuthorityUserID };
      const result = await addPPUser(payload);
      setIsAddingAdvocate(false);
      setIsAddAdvocateModalOpen(false);
      setNewAdvocateFormData({ // Reset form
        Username: '', UserPassword: '', EntryUserID: user.AuthorityUserID,
        FullName: '', ContractNo: '', Email: '', LicenseNumber: ''
      });
      setNewAdvocateFormErrors({ FullName: '', ContractNo: '', Email: '' });
      openAlert('success', 'Advocate added successfully!');
    } catch (err) {
      setIsAddingAdvocate(false);
      console.error("Error adding advocate:", err);
      openAlert('error', err?.message || err || "Failed to add advocate. Please try again.");
    }
  };

  const updateStepStatus = (stepId, status, errorMessage) => {
    setProgressSteps((currentSteps) =>
      currentSteps.map((step) =>
        step.id === stepId ? { ...step, status, ...(errorMessage ? { errorMessage } : {}) } : step,
      ),
    )
  }

  const filteredDocuments = documents?.filter((doc) =>
    doc.AdvocateName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const pinned = selectedAdvocates;

  // Always filter from full list (documents) not filteredDocuments
  const unselectedDocuments = documents?.filter(
    (doc) => !selectedAdvocates.some((sel) => sel.AdvocateId === doc.AdvocateId)
  );

  // Then apply search only to the unselected
  const others = unselectedDocuments?.filter((doc) =>
    doc.AdvocateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          for (const adv of assignedAdvResponse.data?.filter(a => a.advocateId !== doc.AdvocateId)) {
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
        const completedSteps = progressSteps?.filter((step) => step.status === "success").length
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
    // (Keep existing logic with delay for advocate add)
    const shouldReloadAfterAdd = alertType === 'success' && alertMessage === 'Advocate added successfully!';
    const shouldReloadAfterAssign = alertType === 'success' || alertType === 'info'; // Reload on assignment success/info

    closeAlert();

    if (shouldReloadAfterAdd) {
      setTimeout(() => { window.location.reload(); }, 1000); // 1 sec delay
    } else if (shouldReloadAfterAssign) {
      window.location.reload(); // Immediate reload for assignment
    }
    // No reload for other alert types (e.g., errors) unless explicitly needed
  };

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
      <AddAdvocateModal
        isOpen={isAddAdvocateModalOpen}
        onOpenChange={setIsAddAdvocateModalOpen}
        formData={newAdvocateFormData}
        formErrors={newAdvocateFormErrors}
        handleChange={handleNewAdvocateChange}
        handleSubmit={handleAddAdvocateSubmit}
        isLoading={isAddingAdvocate}
        showPassword={showPassword}        // Pass showPassword state
        setShowPassword={setShowPassword}  // Pass its setter
      />
      <Card className="m-5">
        <CardHeader className="items-end">
          {selectedAdvocates.length > 0 && (
            <Button onClick={() => setModalOpen(true)} className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 max-w-min">
              Assign Selected
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="flex justify-between items-center px-4 pt-4 pb-4 gap-4">
              <Button
                variant="outline"
                className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                onClick={() => setIsAddAdvocateModalOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Advocate
              </Button>
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search advocate..."
                className="border border-gray-300 rounded px-3 py-1 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                ) : filteredDocuments.length > 0 ? (
                  [...pinned, ...others].map((doc, index) => {
                    const isSelected = selectedAdvocates.some((a) => a.AdvocateId === doc.AdvocateId);
                    return (
                      <TableRow key={`row-${doc.AdvocateId}-${index}`}>
                        <TableCell>{doc.AdvocateName}</TableCell>
                        <TableCell>
                          <Button
                            // variant={isSelected ? "secondary" : "default"}
                            onClick={() => toggleSelection(doc)}
                            // className="text-sm"
                            className={`text-sm ${isSelected
                              ? "text-gray-900 bg-gradient-to-r from-yellow-300 via-red-400 to-red-300 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                              : "bg-black text-white hover:bg-gray-800"
                              }`}
                          >
                            {isSelected ? (
                              <>
                                <span className="mr-1">✕</span>To be assigned
                              </>
                            ) : (
                              <>
                                <PlusCircle className="mr-2 h-4 w-4" /> Assign
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : searchTerm && !isLoadingDocumentTable ? (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left text-muted-foreground hover:text-foreground"
                        onClick={() => setIsAddAdvocateModalOpen(true)}
                      >
                        Other...
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No Advocates found
                    </TableCell>
                  </TableRow>
                )}
                {/* {!isLoadingDocumentTable && (documents?.length > 0 || !searchTerm) && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left text-muted-foreground hover:text-foreground"
                        onClick={() => setIsAddAdvocateModalOpen(true)} // Trigger modal
                      >
                        Other...
                      </Button>
                    </TableCell>
                  </TableRow>
                )} */}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Assignment</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <p className="text-sm">You are about to assign the following advocates:</p>
              <ul className="list-disc pl-6 text-sm">
                {selectedAdvocates.map((a) => (
                  <li key={`selected-${a.AdvocateId}`}>{a.AdvocateName}</li>
                ))}
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleBatchAssign} disabled={isAssigning}>
                {isAssigning ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition"
          aria-label="Scroll to top"
        >
          <ArrowUpCircle className="w-6 h-6" />
        </button>
      )}
    </>
  )
}

export default UnassignedTable