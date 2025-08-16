"use client";

import { useEffect, useState } from "react";
import { useOfficerPortalStore } from "@/lib/officer-portal-store";
import { Appointment } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OfficerAppointments() {
  const { toast } = useToast();
  const {
    appointments,
    appointmentsLoading,
    loading,
    fetchAppointments,
    updateAppointmentStatus,
    assignSelfToAppointment,
  } = useOfficerPortalStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, dateFilter, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAppointments = () => {
    const params: Record<string, string | number> = { limit: 50 };

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      params.date_from = today;
      params.date_to = today;
    } else if (dateFilter === "week") {
      const today = new Date();
      const weekStart = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const weekEnd = new Date(
        today.setDate(today.getDate() - today.getDay() + 6)
      );
      params.date_from = weekStart.toISOString().split("T")[0];
      params.date_to = weekEnd.toISOString().split("T")[0];
    }

    if (searchTerm) {
      params.search = searchTerm;
    }

    fetchAppointments(params);
  };

  const handleSearch = () => {
    loadAppointments();
  };

  const handleStatusUpdate = async (
    appointmentId: number,
    newStatus: Appointment["status"]
  ) => {
    const success = await updateAppointmentStatus(appointmentId, newStatus);
    if (success) {
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const handleSelfAssign = async (appointmentId: number) => {
    const success = await assignSelfToAppointment(appointmentId);
    if (success) {
      toast({
        title: "Success",
        description: "You have been assigned to this appointment",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to assign appointment",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredAppointments = appointments.filter(
    (appointment) =>
      searchTerm === "" ||
      appointment.service?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.user?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.user?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Appointments
          </h1>
          <p className="text-gray-600">
            Manage appointments in your department
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {filteredAppointments.length} appointments
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointments
          </CardTitle>
          <CardDescription>All appointments in your department</CardDescription>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading appointments...</span>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-full ${getStatusColor(appointment.status)}`}
                          >
                            {getStatusIcon(appointment.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {appointment.service?.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Appointment #{appointment.id}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Citizen:</span>
                            <span>
                              {appointment.user?.first_name}{" "}
                              {appointment.user?.last_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{appointment.user?.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{appointment.user?.phone_number}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Date:</span>
                            <span>
                              {appointment.timeslot?.slot_date &&
                                new Date(
                                  appointment.timeslot.slot_date
                                ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">Time:</span>
                            <span>
                              {appointment.timeslot?.start_time} -{" "}
                              {appointment.timeslot?.end_time}
                            </span>
                          </div>
                          {appointment.officer_id && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                Assigned Officer:
                              </span>
                              <Badge variant="outline">
                                Officer #{appointment.officer_id}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex flex-col gap-2">
                      {appointment.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(appointment.id, "confirmed")
                            }
                            disabled={loading}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusUpdate(appointment.id, "cancelled")
                            }
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {appointment.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "completed")
                          }
                          disabled={loading}
                        >
                          Mark Complete
                        </Button>
                      )}

                      {!appointment.officer_id &&
                        appointment.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelfAssign(appointment.id)}
                            disabled={loading}
                          >
                            Assign to Me
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
