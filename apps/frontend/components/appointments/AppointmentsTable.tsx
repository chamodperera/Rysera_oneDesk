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
  Calendar,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Appointment } from "@/lib/api";

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

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = a.timeslot?.slot_date || "";
      const dateB = b.timeslot?.slot_date || "";
      const comparison = dateA.localeCompare(dateB);
      return sortOrder === "asc" ? comparison : -comparison;
    } else {
      const serviceA = a.service?.name || "";
      const serviceB = b.service?.name || "";
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
    const canCancel =
      appointment.status === "confirmed" &&
      appointment.timeslot &&
      new Date(appointment.timeslot.slot_date) > new Date();

    return (
      <div className="flex items-center gap-2">
        {/* Actions dropdown */}
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
            const service = appointment.service;
            const timeslot = appointment.timeslot;

            if (!service || !timeslot) return null;

            const formatDate = (dateStr: string) => {
              return new Date(dateStr).toLocaleDateString();
            };

            return (
              <TableRow key={appointment.id}>
                <TableCell className="font-mono text-sm">
                  {appointment.booking_reference}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{service.name}</p>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-primary/10 text-primary"
                    >
                      Department {service.department_id}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{formatDate(timeslot.slot_date)}</TableCell>
                <TableCell>
                  {timeslot.start_time} - {timeslot.end_time}
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
    </div>
  );
}
