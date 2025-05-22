"use client"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { decrypt } from "@/utils/crypto"
import { CustomAlertDialog } from "@/components/custom-alert-dialog"
import { useAlertDialog } from "@/hooks/useAlertDialog"
import { postRequest } from "@/app/commonAPI"

export default function ChangePassword() {
    const router = useRouter()
    const [current, setCurrent] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [message, setMessage] = useState('');
    const encryptedUser = useSelector((state) => state.auth.user)
    const [user, setUser] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [oldPassword, setOldPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [passwordMatchError, setPasswordMatchError] = useState(false)
    const { isOpen, alertType, alertMessage, openAlert, closeAlert } = useAlertDialog()

    useEffect(() => {
        if (encryptedUser) {
            try {
                const decryptedUser = JSON.parse(decrypt(encryptedUser))
                setUser(decryptedUser)
            } catch (error) {
                console.error('Error decrypting user data:', error)
            }
        }
    }, [encryptedUser])

    useEffect(() => {
        setPasswordMatchError(confirmPassword !== '' && newPassword !== confirmPassword)
    }, [confirmPassword, newPassword])

    const handleChangePassword = async () => {
        if (passwordMatchError || !oldPassword || !newPassword) return
        if (!user?.AuthorityUserID) return

        try {
            const payload = {
                UserID: user.AuthorityUserID,
                OldPassWord: oldPassword,
                NewPassword: confirmPassword,
                EntryUserID: user.AuthorityUserID,
            }
            const response = await postRequest("update-password", payload)
            if (response && response.status === 0) {
                openAlert("success", "Password updated successfully.")
                setShowModal(false)
                setOldPassword('')
                setNewPassword('')
                setConfirmPassword('')
                setTimeout(() => {
                    router.push('/logout');
                }, 500);
            } else if (response?.status === 1 && response?.message === "Password Not Updated.") {
                openAlert("error", "Old password is incorrect. Failed to update password.")
            } else {
                openAlert("error", response?.message || "Failed to update password.")
            }
        } catch (error) {
            console.error("Password update error:", error)

            try {
                const err = await error.json?.()
                openAlert("error", err?.message || "Unexpected error occurred.")
            } catch {
                openAlert("error", "An unexpected error occurred. Please try again.")
            }
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Password</h2>
                    <div className="space-y-2">
                        <div className="relative">
                            <input
                                type={showOldPassword ? "text" : "password"}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Old Password"
                                className="w-full px-4 py-2 pr-10 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-500"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                            >
                                {showOldPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            className={`w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 ${passwordMatchError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'}`}
                        />
                        {passwordMatchError && (
                            <p className="text-sm text-red-600">Passwords do not match.</p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleChangePassword}
                            className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            disabled={!oldPassword || !newPassword || passwordMatchError}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

            {/* 🔔 Alert Modal */}
            <CustomAlertDialog
                isOpen={isOpen}
                alertType={alertType}
                alertMessage={alertMessage}
                onClose={closeAlert}
            />
        </>
    )
}
