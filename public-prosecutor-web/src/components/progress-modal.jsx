"use client"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function ProgressModal({ isOpen, onClose, steps, title, isComplete }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && isComplete && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 py-1">
                {step.status === "pending" && <div className="h-5 w-5 text-muted-foreground">○</div>}
                {step.status === "loading" && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                {step.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {step.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      step.status === "loading" && "text-blue-500",
                      step.status === "success" && "text-green-500",
                      step.status === "error" && "text-red-500",
                    )}
                  >
                    {step.label}
                  </span>
                  {step.status === "error" && step.errorMessage && (
                    <span className="text-xs text-red-500">{step.errorMessage}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isComplete && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}