import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle, AlertTriangle, CheckCircle2Icon, CircleCheckIcon, Info } from 'lucide-react'

export function CustomAlertDialog({ isOpen, alertType, alertMessage, onClose, onConfirm }) {
  const getAlertConfig = (type) => {
    switch (type) {
      case 'success':
        return { title: 'Success', icon: CircleCheckIcon, color: 'text-green-500' }
      case 'info':
        return { title: 'Information', icon: Info, color: 'text-blue-500' }
      case 'warning':
        return { title: 'Warning', icon: AlertTriangle, color: 'text-yellow-500' }
      case 'error':
        return { title: 'Error', icon: AlertCircle, color: 'text-red-500' }
    }
  }

  const { title, icon: Icon, color } = getAlertConfig(alertType)

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className={`h-6 w-6 ${color}`} />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {alertMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
        {alertType != 'success' && <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>}
          {alertType == 'success' && <AlertDialogAction className="bg-slate-500 hover:bg-slate-600" onClick={onConfirm}>Close</AlertDialogAction>}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

