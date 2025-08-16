"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Calendar,
  Clock,
  FileText,
  QrCode,
  Upload,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  getServiceById,
  getTimeslotById,
  formatDate,
  formatTime,
} from "@/lib/demo-utils";
import { departments } from "@/lib/demo-data";

type Status = "booked" | "in-progress" | "completed" | "cancelled";

interface Appointment {
  id: string;
  bookingRef: string;
  serviceId: string;
  timeslotId: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  docs: { name: string; type: string; size: number }[];
  status: Status;
  createdAt: string;
}

interface AppointmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  onShowQR: () => void;
  onUploadDocs: () => void;
  onCancel: () => void;
  onFeedback?: () => void;
}

export function AppointmentDetailsDialog({
  open,
  onOpenChange,
  appointment,
  onShowQR,
  onUploadDocs,
  onCancel,
  onFeedback,
}: AppointmentDetailsDialogProps) {
  const { toast } = useToast();
  const service = getServiceById(appointment.serviceId);
  const timeslot = getTimeslotById(appointment.timeslotId);
  const department = service
    ? departments.find((d) => d.id === service.departmentId)
    : null;

  const copyBookingRef = () => {
    navigator.clipboard.writeText(appointment.bookingRef);
    toast({
      title: "Copied",
      description: "Booking reference copied to clipboard",
    });
  };

  const canCancel =
    appointment.status === "booked" &&
    timeslot &&
    new Date(timeslot.date) > new Date();
  const canFeedback = appointment.status === "completed" && onFeedback;

  if (!service || !timeslot || !department) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg focus-visible:ring-2 focus-visible:ring-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Appointment Details</span>
            <StatusBadge status={appointment.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Reference */}
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Booking Reference</p>
              <p className="font-mono font-bold text-lg">
                {appointment.bookingRef}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyBookingRef}
              className="focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Service Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Service Information</h3>
            <div className="space-y-2">
              <div>
                <p className="font-medium">{service.name}</p>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  {department.name}
                </Badge>
              </div>
              {service.description && (
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="space-y-3">
            <h3 className="font-semibold">Date & Time</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(timeslot.date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {formatTime(timeslot.start)} - {formatTime(timeslot.end)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Details */}
          <div className="space-y-3">
            <h3 className="font-semibold">Personal Details</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {appointment.fullName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {appointment.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {appointment.phone}
              </p>
            </div>
          </div>

          {/* Documents */}
          {appointment.docs.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Uploaded Documents</h3>
                <div className="space-y-2">
                  {appointment.docs.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Additional Notes</h3>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  {appointment.notes}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex flex-wrap gap-2 justify-end w-full">
            <Button
              variant="outline"
              onClick={onShowQR}
              className="focus-visible:ring-2 focus-visible:ring-primary"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Show QR
            </Button>

            <Button
              variant="outline"
              onClick={onUploadDocs}
              className="focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Docs
            </Button>

            {canFeedback && (
              <Button
                variant="outline"
                onClick={onFeedback}
                className="focus-visible:ring-2 focus-visible:ring-primary"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Feedback
              </Button>
            )}

            {canCancel && (
              <Button
                variant="destructive"
                onClick={onCancel}
                className="focus-visible:ring-2 focus-visible:ring-primary"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}

            <Button
              onClick={() => onOpenChange(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
