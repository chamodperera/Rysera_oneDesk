"use client";

import { useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Plus,
  FileText,
  ArrowRight,
  User,
  CalendarDays,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { useAppointmentBookingStore } from "@/lib/appointment-booking-store";
import { StatusBadge } from "@/components/appointments/StatusBadge";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { myAppointments, loading, error, fetchMyAppointments } =
    useAppointmentBookingStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyAppointments();
    }
  }, [isAuthenticated, user, fetchMyAppointments]);

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const upcomingCount = myAppointments.filter((apt) => {
      const isFuture =
        apt.timeslot && new Date(apt.timeslot.slot_date) >= today;
      const isUpcomingStatus = ["pending", "confirmed", "in_progress"].includes(
        apt.status
      );
      return isFuture && isUpcomingStatus;
    }).length;

    const completedThisMonth = myAppointments.filter((apt) => {
      const isCompleted = apt.status === "completed";
      const isThisMonth =
        apt.timeslot && new Date(apt.timeslot.slot_date) >= startOfMonth;
      return isCompleted && isThisMonth;
    }).length;

    const totalBookings = myAppointments.length;

    return {
      upcoming: upcomingCount,
      completedThisMonth,
      total: totalBookings,
    };
  }, [myAppointments]);

  // Get recent appointments (last 5)
  const recentAppointments = useMemo(() => {
    return myAppointments
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [myAppointments]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back{user ? `, ${user.first_name}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Manage your government service appointments and bookings
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Book New Appointment
              </CardTitle>
              <CardDescription>
                Schedule a new appointment with any government department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/services">
                  Browse Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                My Appointments
              </CardTitle>
              <CardDescription>
                View and manage your scheduled appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/appointments">
                  View Appointments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile">
                  Manage Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : stats.upcoming}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upcoming Appointments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : stats.completedThisMonth}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed This Month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : stats.total}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Bookings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest appointments and bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading appointments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>Failed to load appointments</p>
                <Button
                  variant="outline"
                  onClick={() => fetchMyAppointments()}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {appointment.service?.name || "Unknown Service"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.timeslot
                            ? `${new Date(appointment.timeslot.slot_date).toLocaleDateString()} at ${appointment.timeslot.start_time}`
                            : "Date TBD"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ref: {appointment.booking_reference}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={appointment.status} />
                      <Button asChild variant="ghost" size="sm">
                        <Link href="/dashboard/appointments">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Button asChild variant="outline">
                    <Link href="/dashboard/appointments">
                      View All Appointments
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">
                  Book your first appointment to get started
                </p>
                <Button asChild className="mt-4">
                  <Link href="/services">
                    <Plus className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
