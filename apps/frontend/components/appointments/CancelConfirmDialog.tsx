"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface CancelConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  bookingRef: string;
}

export function CancelConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  bookingRef,
}: CancelConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md focus-visible:ring-2 focus-visible:ring-primary">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <DialogTitle>Cancel Appointment</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to cancel your appointment{" "}
            <strong>{bookingRef}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">
              Important Notice:
            </h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• This action cannot be undone</li>
              <li>• Your timeslot will be made available to other citizens</li>
              <li>
                • You will need to book a new appointment if you change your
                mind
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="focus-visible:ring-2 focus-visible:ring-primary"
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              className="focus-visible:ring-2 focus-visible:ring-primary"
            >
              Yes, Cancel Appointment
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
