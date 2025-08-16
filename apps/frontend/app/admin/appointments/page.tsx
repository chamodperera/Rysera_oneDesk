"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MoreHorizontal,
  Eye,
  UserCheck,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { useAppointments } from "@/lib/demo-store";
import { getTimeslotById } from "@/lib/demo-utils";
import { departments } from "@/lib/demo-data";
import { Appointment, Status } from "@/lib/booking-types";

const StatusBadge = ({ status }: { status: Status }) => {
  const variants = {
    booked: "bg-blue-100 text-blue-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <Badge className={`${variants[status]} border-0`}>
      {status.replace("-", " ")}
    </Badge>
  );
};

export default function AdminAppointmentsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [quickScanRef, setQuickScanRef] = useState("");

  const { appointments, setAppointmentStatus, getServices } = useAppointments();
  const { toast } = useToast();

  const services = getServices();

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Filter by tab (status)
    if (activeTab !== "all") {
      filtered = filtered.filter((apt) => apt.status === activeTab);
    }

    // Filter by search term (booking ref, name, email)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.bookingRef.toLowerCase().includes(search) ||
          apt.fullName.toLowerCase().includes(search) ||
          apt.email.toLowerCase().includes(search)
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [appointments, activeTab, searchTerm]);

  const appointmentCounts = {
    all: appointments.length,
    booked: appointments.filter((apt) => apt.status === "booked").length,
    "in-progress": appointments.filter((apt) => apt.status === "in-progress")
      .length,
    completed: appointments.filter((apt) => apt.status === "completed").length,
    cancelled: appointments.filter((apt) => apt.status === "cancelled").length,
  };

  const handleQuickScan = () => {
    if (!quickScanRef.trim()) return;

    const appointment = appointments.find(
      (apt) => apt.bookingRef.toLowerCase() === quickScanRef.toLowerCase()
    );

    if (appointment) {
      if (appointment.status === "booked") {
        setAppointmentStatus(appointment.id, "in-progress");
        toast({
          title: "Checked-in (demo)",
          description: `${appointment.fullName} has been checked in`,
        });
      } else {
        toast({
          title: "Appointment found",
          description: `Status: ${appointment.status}`,
        });
      }
      setQuickScanRef("");
    } else {
      toast({
        title: "Appointment not found",
        description: "Please check the booking reference",
      });
    }
  };

  const handleStatusChange = (appointmentId: string, status: Status) => {
    const appointment = appointments.find((apt) => apt.id === appointmentId);
    if (!appointment) return;

    setAppointmentStatus(appointmentId, status);

    const statusMessages = {
      "in-progress": "Checked-in (demo)",
      completed: "Completed (demo)",
      cancelled: "Cancelled (demo)",
      booked: "Status updated (demo)",
    };

    toast({
      title: statusMessages[status],
      description: `${appointment.fullName}&apos;s appointment updated`,
    });
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    return service?.name || "Unknown Service";
  };

  const getDepartmentName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    const department = departments.find((d) => d.id === service?.departmentId);
    return department?.name || "Unknown Department";
  };

  const formatDateTime = (timeslotId: string) => {
    const timeslot = getTimeslotById(timeslotId);
    if (!timeslot) return "Unknown time";

    const date = new Date(timeslot.date).toLocaleDateString();
    return `${date} ${timeslot.start}-${timeslot.end}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Appointments Management
          </h1>
          <p className="text-lg text-muted-foreground">
            View, update, and manage all appointment bookings
          </p>
        </div>
      </div>

      {/* Quick Scan Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <span>Quick Check-in</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter booking reference (e.g., APT-001)"
              value={quickScanRef}
              onChange={(e) => setQuickScanRef(e.target.value)}
              className="flex-1 focus-visible:ring-2 focus-visible:ring-primary"
              onKeyPress={(e) => e.key === "Enter" && handleQuickScan()}
            />
            <Button
              onClick={handleQuickScan}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Check-in
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by booking ref, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger
            value="all"
            className="focus-visible:ring-2 focus-visible:ring-primary"
          >
            All ({appointmentCounts.all})
          </TabsTrigger>
          <TabsTrigger
            value="booked"
            className="focus-visible:ring-2 focus-visible:ring-primary"
          >
            Booked ({appointmentCounts.booked})
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="focus-visible:ring-2 focus-visible:ring-primary"
          >
            In Progress ({appointmentCounts["in-progress"]})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="focus-visible:ring-2 focus-visible:ring-primary"
          >
            Completed ({appointmentCounts.completed})
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancelled ({appointmentCounts.cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.bookingRef}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {appointment.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {getServiceName(appointment.serviceId)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getDepartmentName(appointment.serviceId)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(appointment.timeslotId)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={appointment.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(appointment)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {appointment.status === "booked" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(
                                      appointment.id,
                                      "in-progress"
                                    )
                                  }
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Check-in
                                </DropdownMenuItem>
                              )}
                              {appointment.status === "in-progress" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(
                                      appointment.id,
                                      "completed"
                                    )
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Complete
                                </DropdownMenuItem>
                              )}
                              {appointment.status !== "cancelled" &&
                                appointment.status !== "completed" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(
                                        appointment.id,
                                        "cancelled"
                                      )
                                    }
                                    className="text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Calendar className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No appointments found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Appointment Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppointment?.bookingRef}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">
                      {selectedAppointment.fullName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedAppointment.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedAppointment.phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      <StatusBadge status={selectedAppointment.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Service Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Service:</span>
                    <p className="font-medium">
                      {getServiceName(selectedAppointment.serviceId)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">
                      {getDepartmentName(selectedAppointment.serviceId)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date & Time:</span>
                    <p className="font-medium">
                      {formatDateTime(selectedAppointment.timeslotId)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Booked:</span>
                    <p className="font-medium">
                      {new Date(
                        selectedAppointment.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div>
                  <h3 className="font-medium mb-3 flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Notes
                  </h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              {/* Documents */}
              {selectedAppointment.docs &&
                selectedAppointment.docs.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Uploaded Documents
                    </h3>
                    <div className="space-y-2">
                      {selectedAppointment.docs.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm bg-gray-50 p-2 rounded"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{doc.name}</span>
                          <span className="text-muted-foreground">
                            ({(doc.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
