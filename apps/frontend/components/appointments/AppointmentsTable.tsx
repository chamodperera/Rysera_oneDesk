"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Eye,
  QrCode,
  Upload,
  XCircle,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { useAppointments } from "@/lib/demo-store";
import {
  getServiceById,
  getTimeslotById,
  formatDateShort,
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

interface AppointmentsTableProps {
  appointments: Appointment[];
  onView: (appointment: Appointment) => void;
  onShowQR: (appointment: Appointment) => void;
  onUploadDocs: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
}

export function AppointmentsTable({
  appointments,
  onView,
  onShowQR,
  onUploadDocs,
  onCancel,
}: AppointmentsTableProps) {
  const [sortBy, setSortBy] = useState<"date" | "service">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [feedbackAppointment, setFeedbackAppointment] =
    useState<Appointment | null>(null);

  const { getFeedbackByAppointment } = useAppointments();

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = getTimeslotById(a.timeslotId)?.date || "";
      const dateB = getTimeslotById(b.timeslotId)?.date || "";
      const comparison = dateA.localeCompare(dateB);
      return sortOrder === "asc" ? comparison : -comparison;
    } else {
      const serviceA = getServiceById(a.serviceId)?.name || "";
      const serviceB = getServiceById(b.serviceId)?.name || "";
      const comparison = serviceA.localeCompare(serviceB);
      return sortOrder === "asc" ? comparison : -comparison;
    }
  });

  const handleSort = (column: "date" | "service") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getActionButtons = (appointment: Appointment) => {
    const timeslot = getTimeslotById(appointment.timeslotId);
    const canCancel =
      appointment.status === "booked" &&
      timeslot &&
      new Date(timeslot.date) > new Date();
    const canFeedback = appointment.status === "completed";
    const existingFeedback = getFeedbackByAppointment(appointment.id);

    return (
      <div className="flex items-center gap-2">
        {/* For completed appointments, show only feedback button */}
        {canFeedback ? (
          <Button
            variant={existingFeedback ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFeedbackAppointment(appointment)}
            className={
              existingFeedback
                ? "bg-green-50 border-green-200 text-green-800 hover:bg-green-100 hover:border-green-300"
                : "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100 hover:border-yellow-300"
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {existingFeedback ? "View Feedback" : "Leave Feedback"}
          </Button>
        ) : (
          /* For non-completed appointments, show dropdown with all actions */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(appointment)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShowQR(appointment)}>
                <QrCode className="mr-2 h-4 w-4" />
                Show QR Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUploadDocs(appointment)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </DropdownMenuItem>
              {canCancel && (
                <DropdownMenuItem
                  onClick={() => onCancel(appointment)}
                  className="text-red-600 focus:text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Appointment
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No appointments found</p>
          <p className="text-sm">
            Try adjusting your filters or book a new appointment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Booking Ref</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("service")}
                className="h-auto p-0 font-medium hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
              >
                Service{" "}
                {sortBy === "service" && (sortOrder === "asc" ? "↑" : "↓")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("date")}
                className="h-auto p-0 font-medium hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
              >
                Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
              </Button>
            </TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAppointments.map((appointment) => {
            const service = getServiceById(appointment.serviceId);
            const timeslot = getTimeslotById(appointment.timeslotId);
            const department = service
              ? departments.find((d) => d.id === service.departmentId)
              : null;

            if (!service || !timeslot || !department) return null;

            return (
              <TableRow key={appointment.id}>
                <TableCell className="font-mono text-sm">
                  {appointment.bookingRef}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{service.name}</p>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-primary/10 text-primary"
                    >
                      {department.name}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{formatDateShort(timeslot.date)}</TableCell>
                <TableCell>
                  {formatTime(timeslot.start)} - {formatTime(timeslot.end)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={appointment.status} />
                </TableCell>
                <TableCell>{getActionButtons(appointment)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Feedback Dialog */}
      {feedbackAppointment && (
        <FeedbackDialog
          appointment={feedbackAppointment}
          service={getServiceById(feedbackAppointment.serviceId)!}
          timeslot={getTimeslotById(feedbackAppointment.timeslotId)!}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setFeedbackAppointment(null);
            }
          }}
        />
      )}
    </div>
  );
}
