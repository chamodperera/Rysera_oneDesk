"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layouts/AppLayout";
import { FiltersBar, FilterState } from "@/components/appointments/FiltersBar";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";
import { AppointmentDetailsDialog } from "@/components/appointments/AppointmentDetailsDialog";
import { QRCodeDrawer } from "@/components/appointments/QRCodeDrawer";
import { DocUploadDrawer } from "@/components/appointments/DocUploadDrawer";
import { CancelConfirmDialog } from "@/components/appointments/CancelConfirmDialog";
import { CalendarDays, Plus } from "lucide-react";
import { useAppointmentBookingStore } from "@/lib/appointment-booking-store";
import { useIsAuthenticated, useUser } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Appointment } from "@/lib/api";

export default function MyAppointmentsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    department: "",
  });
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Dialog states
  const [showDetails, setShowDetails] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  // Authentication and store
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const {
    myAppointments,
    loading,
    error,
    fetchMyAppointments,
    cancelAppointment,
  } = useAppointmentBookingStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push(
        "/login?returnUrl=" + encodeURIComponent("/dashboard/appointments")
      );
    }
  }, [isAuthenticated, isMounted, router]);

  // Fetch appointments when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyAppointments();
    }
  }, [isAuthenticated, user, fetchMyAppointments]);

  // Filter appointments by status and search/department filters
  const filteredAppointments = useMemo(() => {
    let filtered = myAppointments;

    // Filter by tab (status)
    if (activeTab !== "all") {
      if (activeTab === "upcoming") {
        filtered = filtered.filter((apt) => {
          // Include appointments that are in the future and not completed/cancelled
          const isFuture =
            apt.timeslot && new Date(apt.timeslot.slot_date) >= new Date();
          const isUpcomingStatus = [
            "pending",
            "confirmed",
            "in_progress",
          ].includes(apt.status);
          return isFuture && isUpcomingStatus;
        });
      } else {
        // Map frontend status names to backend status names
        const statusMap: Record<string, string> = {
          "in-progress": "in_progress",
          cancelled: "cancelled",
          completed: "completed",
        };
        const backendStatus = statusMap[activeTab] || activeTab;
        filtered = filtered.filter((apt) => apt.status === backendStatus);
      }
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((apt) => {
        return (
          apt.booking_reference.toLowerCase().includes(searchLower) ||
          apt.service?.name.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by department
    if (filters.department) {
      filtered = filtered.filter((apt) => {
        return apt.service?.department_id?.toString() === filters.department;
      });
    }

    return filtered;
  }, [myAppointments, activeTab, filters]);

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
  };

  const handleShowQR = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowQR(true);
  };

  const handleUploadDocs = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowUpload(true);
  };

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancel(true);
  };

  const confirmCancel = async () => {
    if (selectedAppointment) {
      try {
        await cancelAppointment(selectedAppointment.id);
        toast({
          title: "Appointment cancelled",
          description: `Booking reference ${selectedAppointment.booking_reference} has been cancelled`,
        });
        setShowCancel(false);
        setSelectedAppointment(null);
      } catch (err) {
        console.error("Failed to cancel appointment:", err);
        toast({
          title: "Error",
          description: "Failed to cancel appointment. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDocsUpdate = () => {
    // TODO: Implement document upload for real appointments
    if (selectedAppointment) {
      toast({
        title: "Feature coming soon",
        description: "Document upload will be available soon",
      });
    }
  };

  const clearFilters = () => {
    setFilters({ search: "", department: "" });
  };

  const appointmentCounts = useMemo(() => {
    if (!isMounted) {
      return {
        all: 0,
        upcoming: 0,
        "in-progress": 0,
        completed: 0,
        cancelled: 0,
      };
    }

    return {
      all: myAppointments.length,
      upcoming: myAppointments.filter((apt) => {
        // Include appointments that are in the future and not completed/cancelled
        const isFuture =
          apt.timeslot && new Date(apt.timeslot.slot_date) >= new Date();
        const isUpcomingStatus = [
          "pending",
          "confirmed",
          "in_progress",
        ].includes(apt.status);
        return isFuture && isUpcomingStatus;
      }).length,
      "in-progress": myAppointments.filter(
        (apt) => apt.status === "in_progress"
      ).length,
      completed: myAppointments.filter((apt) => apt.status === "completed")
        .length,
      cancelled: myAppointments.filter((apt) => apt.status === "cancelled")
        .length,
    };
  }, [myAppointments, isMounted]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Appointments
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your government service appointments
            </p>
          </div>
          <Button
            asChild
            className="mt-4 md:mt-0 bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Link href="/services">
              <Plus className="mr-2 h-4 w-4" />
              Book New Appointment
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">
              Loading appointments...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-6">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-destructive mb-2">
                  Failed to load appointments
                </p>
                <Button
                  variant="outline"
                  onClick={() => fetchMyAppointments()}
                  className="text-sm"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Tabs */}
        {!loading && !error && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
              <TabsTrigger
                value="all"
                className="focus-visible:ring-2 focus-visible:ring-primary"
              >
                All ({appointmentCounts.all})
              </TabsTrigger>
              <TabsTrigger
                value="upcoming"
                className="focus-visible:ring-2 focus-visible:ring-primary"
              >
                Upcoming ({appointmentCounts.upcoming})
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

            {/* Filters */}
            <div className="mt-6">
              <FiltersBar
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
              />
            </div>

            {/* Content for each tab */}
            <div className="mt-6">
              <TabsContent value={activeTab} className="mt-0">
                {filteredAppointments.length > 0 ? (
                  <AppointmentsTable
                    appointments={filteredAppointments}
                    onView={handleView}
                    onShowQR={handleShowQR}
                    onUploadDocs={handleUploadDocs}
                    onCancel={handleCancel}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                      <CardTitle className="text-xl mb-2">
                        No appointments found
                      </CardTitle>
                      <CardDescription className="text-center mb-6 max-w-sm">
                        {activeTab === "all"
                          ? "You haven't booked any appointments yet. Start by booking your first appointment."
                          : `No ${activeTab === "upcoming" ? "upcoming" : activeTab} appointments found. Try adjusting your filters.`}
                      </CardDescription>
                      <Button
                        asChild
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Link href="/services">
                          <Plus className="mr-2 h-4 w-4" />
                          Book New Appointment
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}

        {/* Dialogs */}
        {selectedAppointment && (
          <>
            <AppointmentDetailsDialog
              open={showDetails}
              onOpenChange={setShowDetails}
              appointment={selectedAppointment}
              onShowQR={() => {
                setShowDetails(false);
                setShowQR(true);
              }}
              onUploadDocs={() => {
                setShowDetails(false);
                setShowUpload(true);
              }}
              onCancel={() => {
                setShowDetails(false);
                setShowCancel(true);
              }}
              onFeedback={() => {
                setShowDetails(false);
              }}
            />

            <QRCodeDrawer
              open={showQR}
              onOpenChange={setShowQR}
              appointment={selectedAppointment}
            />

            <DocUploadDrawer
              open={showUpload}
              onOpenChange={setShowUpload}
              currentDocs={[]}
              onDocsUpdate={handleDocsUpdate}
            />

            <CancelConfirmDialog
              open={showCancel}
              onOpenChange={setShowCancel}
              onConfirm={confirmCancel}
              bookingRef={selectedAppointment.booking_reference}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
