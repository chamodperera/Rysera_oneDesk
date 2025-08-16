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
  QrCode,
  Upload,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "@/lib/api";

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
  const service = appointment.service;
  const timeslot = appointment.timeslot;
  const user = appointment.user;

  const copyBookingRef = () => {
    navigator.clipboard.writeText(appointment.booking_reference);
    toast({
      title: "Copied",
      description: "Booking reference copied to clipboard",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const canCancel =
    appointment.status === "confirmed" &&
    timeslot &&
    new Date(timeslot.slot_date) > new Date();
  const canFeedback = appointment.status === "completed" && onFeedback;

  if (!service || !timeslot) {
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
                {appointment.booking_reference}
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
                  Department {service.department_id}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Duration: {service.duration_minutes} minutes
              </p>
            </div>
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="space-y-3">
            <h3 className="font-semibold">Date & Time</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(timeslot.slot_date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>
                  {timeslot.start_time} - {timeslot.end_time}
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
                {user ? `${user.first_name} ${user.last_name}` : "N/A"}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {user?.email || "N/A"}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {user?.phone_number || "N/A"}
              </p>
            </div>
          </div>

          {/* Officer Information */}
          {appointment.officer && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Assigned Officer</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Officer:</span>{" "}
                    {appointment.officer.user
                      ? `${appointment.officer.user.first_name} ${appointment.officer.user.last_name}`
                      : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Position:</span>{" "}
                    {appointment.officer.position}
                  </p>
                  {appointment.officer.user?.email && (
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {appointment.officer.user.email}
                    </p>
                  )}
                </div>
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
