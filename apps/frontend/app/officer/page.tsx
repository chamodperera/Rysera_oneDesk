"use client";

import { useEffect } from "react";
import { useOfficerPortalStore } from "@/lib/officer-portal-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Building2,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OfficerDashboard() {
  const router = useRouter();
  const {
    officerProfile,
    department,
    appointments,
    stats,
    statsLoading,
    appointmentsLoading,
    fetchAppointments,
    fetchStats,
  } = useOfficerPortalStore();

  useEffect(() => {
    // Fetch initial data
    fetchStats();
    fetchAppointments({ limit: 5 }); // Get first 5 appointments
  }, [fetchStats, fetchAppointments]);

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {officerProfile?.user?.first_name}!
        </h1>
        <p className="text-blue-100">
          Here&apos;s what&apos;s happening in your department today.
        </p>
      </div>

      {/* Department Info */}
      {department && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Department Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{department.name}</h3>
                <p className="text-gray-600 mt-1">{department.description}</p>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Contact Information:
                  </span>
                  <p className="text-sm">{department.contact_info}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All time in your department
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statsLoading ? "..." : stats?.pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? "..." : stats?.confirmed || 0}
            </div>
            <p className="text-xs text-muted-foreground">Ready to proceed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? "..." : stats?.completed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>
                Latest appointments in your department
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/officer/appointments")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments found in your department.
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${getStatusColor(appointment.status)}`}
                    >
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div>
                      <p className="font-medium">{appointment.service?.name}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.user?.first_name}{" "}
                        {appointment.user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.timeslot?.slot_date &&
                          new Date(
                            appointment.timeslot.slot_date
                          ).toLocaleDateString()}{" "}
                        at {appointment.timeslot?.start_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                    {appointment.officer_id && (
                      <Badge variant="outline">Assigned</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              className="h-20 flex flex-col items-center gap-2"
              variant="outline"
              onClick={() => router.push("/officer/appointments")}
            >
              <Calendar className="h-6 w-6" />
              <span>Manage Appointments</span>
            </Button>

            <Button
              className="h-20 flex flex-col items-center gap-2"
              variant="outline"
              onClick={() => router.push("/officer/analytics")}
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>

            <Button
              className="h-20 flex flex-col items-center gap-2"
              variant="outline"
              onClick={() => router.push("/officer/schedule")}
            >
              <Clock className="h-6 w-6" />
              <span>View Schedule</span>
            </Button>

            <Button
              className="h-20 flex flex-col items-center gap-2"
              variant="outline"
              onClick={() => router.push("/officer/reports")}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Generate Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
