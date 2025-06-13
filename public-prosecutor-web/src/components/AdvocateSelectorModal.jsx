"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, CheckCircle2, EyeOff, Eye } from "lucide-react"
import { postRequest } from "@/app/commonAPI"
import { useToast } from "@/hooks/use-toast"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { ProgressModal } from "./progress-modal"
import { useSelector } from "react-redux"
import { decrypt } from "@/utils/crypto"
import { Label } from "./ui/label"

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

export default function AdvocateSelectorModal({ open, onClose, caseId }) {
    const encryptedUser = useSelector((state) => state.auth.user)
    const [user, setUser] = useState(null)

    useEffect(() => {
        if (encryptedUser) {
            try {
                const decoded = JSON.parse(decrypt(encryptedUser))
                setUser(decoded)
            } catch (err) {
                console.error("Failed to decode user:", err)
            }
        }
    }, [encryptedUser])
    const [allAdvocates, setAllAdvocates] = useState([])
    const [assignedAdvocateIds, setAssignedAdvocateIds] = useState([])
    const [selectedIds, setSelectedIds] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const { toast } = useToast()
    const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog();

    const [progressSteps, setProgressSteps] = useState([])
    const [progressModalOpen, setProgressModalOpen] = useState(false)
    const [isAssigning, setIsAssigning] = useState(false)
    const [isProcessComplete, setIsProcessComplete] = useState(false)
    const [showBackToTop, setShowBackToTop] = useState(false)

    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        FullName: "",
        ContractNo: "",
        Username: "",
        UserPassword: "",
        Email: "",
        LicenseNumber: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.FullName) errors.FullName = "Full name is required";
        if (!formData.ContractNo || formData.ContractNo.length !== 10)
            errors.ContractNo = "Valid 10-digit number is required";
        if (!formData.Username) errors.Username = "Username is required";
        if (!formData.UserPassword) errors.UserPassword = "Password is required";
        if (!formData.Email || !formData.Email.includes("@"))
            errors.Email = "Valid email is required";
        if (!formData.LicenseNumber) errors.LicenseNumber = "License number is required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsAdding(true);
        try {
            const res = await postRequest("addPPUser", {
                ...formData,
                EntryUserId: user.AuthorityUserID,
                UserTypeID: 2, // assuming 2 = Advocate
            });

            if (res?.status === 0) {
                openAlert("success", "Advocate added successfully!");
                setShowAddModal(false);
                // Optional: Refresh advocate list
            } else {
                openAlert("error", res.message || "Failed to add advocate");
            }
        } catch (err) {
            console.error(err);
            openAlert("error", "Unexpected error occurred while adding advocate");
        } finally {
            setIsAdding(false);
        }
    };

    const updateStepStatus = (stepId, status, message) => {
        setProgressSteps(prev =>
            prev.map(s => s.id === stepId ? { ...s, status, message } : s)
        )
    }

    useEffect(() => {
        const container = document.getElementById("advocateList")
        if (!container) return

        const handleScroll = () => {
            setShowBackToTop(container.scrollTop > 300)
        }

        container.addEventListener("scroll", handleScroll)
        return () => container.removeEventListener("scroll", handleScroll)
    }, [allAdvocates])

    useEffect(() => {
        if (!open) return

        const fetchData = async () => {
            let assignedRes = { data: [] }
            let unassignedRes = { data: [] }

            try {
                assignedRes = await postRequest("assigned-advocates", { caseId })
            } catch (err) {
                console.warn("No assigned advocates yet.")
            }

            try {
                unassignedRes = await postRequest("unassigned-advocates", { caseId })
            } catch (err) {
                console.error("Failed to load unassigned advocates:", err)
            }

            const assigned = (assignedRes?.data || []).map(a => ({
                id: a.advocateId,
                name: a.advocateName,
                contact: a.advocateContactNumber,
                assignId: a.assignId,
                isAssigned: true,
            }))

            const unassigned = (unassignedRes?.data || []).map(a => ({
                id: a.AdvocateId,
                name: a.AdvocateName,
                contact: a.AdvocateContactNumber || "",
                isAssigned: false,
            }))

            const combined = [...assigned, ...unassigned]

            setAllAdvocates(combined)
            setSelectedIds(assigned.map(a => a.id))
            setAssignedAdvocateIds(assigned.map(a => a.id))
        }

        fetchData()
    }, [open, caseId])

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const handleUpdate = async () => {
        setProgressSteps([
            { id: "unassign", label: "Unassigning removed advocates", status: "pending" },
            { id: "assign", label: "Assigning advocates", status: "loading" },
            { id: "emailAdvocates", label: "Notifying assigned advocates", status: "pending" },
            { id: "emailDepts", label: "Notifying assigned departments", status: "pending" },
        ])
        setProgressModalOpen(true)
        setIsAssigning(true)

        try {
            const toAssign = selectedIds.filter(id => !assignedAdvocateIds.includes(id))
            const toUnassign = assignedAdvocateIds.filter(id => !selectedIds.includes(id))

            // 1. Unassign first
            updateStepStatus("unassign", "loading")
            for (const id of toUnassign) {
                const adv = allAdvocates.find(a => a.id === id)
                await postRequest("assigncase", {
                    assignId: adv.assignId,
                    ppUserId: adv.id,
                    caseId,
                    districtId: "0",
                    psId: "0",
                    EntryUserId: user.AuthorityUserID,
                })
            }
            updateStepStatus("unassign", "success")

            // 2. Assign next
            updateStepStatus("assign", "loading")
            const assignRes = await postRequest("assign-case-to-advocates", {
                caseId,
                EntryUserId: user.AuthorityUserID,
                ppUserIds: toAssign,
            })
            if (!assignRes?.success || !Array.isArray(assignRes.assignedPPUserIDs)) {
                updateStepStatus("assign", "error", "Assignment failed.")
                return
            }
            updateStepStatus("assign", "success")

            // 3. Email Advocates
            updateStepStatus("emailAdvocates", "loading")
            try {
                await postRequest("send-email-pp-v2", {
                    CaseID: caseId,
                    PPuserID_array: assignRes.assignedPPUserIDs,
                })
                updateStepStatus("emailAdvocates", "success")
            } catch {
                updateStepStatus("emailAdvocates", "error", "Failed to notify advocates.")
            }

            // 4. Email Departments
            updateStepStatus("emailDepts", "loading")
            try {
                const deptRes = await postRequest("assigned-dept", { caseId })
                const uniqueDepts = Array.from(
                    new Set(
                        deptRes?.data?.map(d => `${d.districtId}-${d.policeStationId}`)
                    )
                ).map(key => {
                    const [DistrictID, PSID] = key.split("-")
                    return { DistrictID, PSID }
                })

                const emailRes = await postRequest("send-email", {
                    CaseID: caseId,
                    Departments: uniqueDepts,
                })

                // updateStepStatus("emailDepts", emailRes?.success ? "success" : "error")
                updateStepStatus("emailDepts", emailRes?.status === 0 ? "success" : "error")
            } catch {
                updateStepStatus("emailDepts", "error", "Failed to notify departments.")
            }

            openAlert("success", "Update successful!")
        } catch (err) {
            updateStepStatus("assign", "error", "Unexpected error.")
            openAlert("error", "An unexpected error occurred.")
        } finally {
            setIsAssigning(false)
            setIsProcessComplete(true)

            setTimeout(() => {
                setProgressModalOpen(false)
                setIsProcessComplete(false)
                onClose()
                window.location.reload()
            }, 1000)
        }
    }

    // const filtered = allAdvocates.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const filtered = allAdvocates
        .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aSelected = selectedIds.includes(a.id);
            const bSelected = selectedIds.includes(b.id);
            return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
        });

    const handleConfirm = () => {
        // (Keep existing logic with delay for advocate add)
        // const shouldReloadAfterAdd = alertType === 'success' && alertMessage === 'Advocate added successfully!';
        // const shouldReloadAfterAssign = alertType === 'success' || alertType === 'info'; // Reload on assignment success/info

        closeAlert();

        // if (shouldReloadAfterAdd) {
        //     setTimeout(() => { window.location.reload(); }, 1000); // 1 sec delay
        // } else if (shouldReloadAfterAssign) {
        //     window.location.reload(); // Immediate reload for assignment
        // }
        // No reload for other alert types (e.g., errors) unless explicitly needed
    };

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
                onClose={() => {
                    setProgressModalOpen(false)
                    setIsProcessComplete(false)
                }}
                steps={progressSteps}
                title="Updating Advocates"
                isComplete={isProcessComplete}
            />
            <AddAdvocateModal
                isOpen={showAddModal}
                onOpenChange={setShowAddModal}
                formData={formData}
                formErrors={formErrors}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                isLoading={isAdding}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Assign / Unassign Advocates</DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="text-green-600 w-4 h-4" />
                                <span>Assigned</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-4 h-4 border rounded-full" />
                                <span>Unassigned</span>
                            </div>
                        </div>
                        <Input
                            placeholder="Search advocate..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div id="advocateList" className="max-h-64 overflow-y-auto border rounded-md p-2">
                        {filtered.map((adv) => {
                            const isSelected = selectedIds.includes(adv.id)
                            return (
                                <div
                                    key={adv.id}
                                    className="flex justify-between items-center border-b py-2 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleSelect(adv.id)}
                                >
                                    <span>{adv.name} {adv.contact && `(${adv.contact})`}</span>
                                    {isSelected ? (
                                        <CheckCircle2 className="text-green-600" />
                                    ) : (
                                        <div className="w-4 h-4 border rounded-full" />
                                    )}
                                </div>
                            )
                        })}
                        {!filtered.length && (
                            <div className="text-center text-sm text-gray-500 py-4">
                                No advocate found.
                                <Button
                                    variant="link"
                                    className="text-blue-600 underline ml-2"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    Add New Advocate?
                                </Button>
                            </div>
                        )}
                    </div>

                    {showBackToTop && (
                        <button
                            className="fixed bottom-20 right-12 bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 z-50"
                            onClick={() => {
                                const container = document.getElementById("advocateList");
                                if (container) container.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        >
                            ↑ Top
                        </button>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleUpdate}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}