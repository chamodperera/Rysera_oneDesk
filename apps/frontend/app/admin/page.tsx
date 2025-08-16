"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/admin/KPICard";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Settings,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { useAppointments } from "@/lib/demo-store";
import { getTimeslotById } from "@/lib/demo-utils";
import { Timeslot } from "@/lib/booking-types";

type TimeslotWithBookings = Timeslot & {
  booked: number;
  available: number;
};

export default function AdminDashboardPage() {
  const { appointments, getTimeslots } = useAppointments();

  const today = new Date().toISOString().split("T")[0];

  const kpis = useMemo(() => {
    const todaysAppointments = appointments.filter((apt) => {
      const timeslot = getTimeslotById(apt.timeslotId);
      return timeslot?.date === today;
    });

    const pendingCheckins = todaysAppointments.filter(
      (apt) => apt.status === "booked"
    );
    const inProgress = appointments.filter(
      (apt) => apt.status === "in-progress"
    );
    const completed = todaysAppointments.filter(
      (apt) => apt.status === "completed"
    );
    const cancellations = todaysAppointments.filter(
      (apt) => apt.status === "cancelled"
    );

    return {
      todaysAppointments: todaysAppointments.length,
      pendingCheckins: pendingCheckins.length,
      inProgress: inProgress.length,
      completed: completed.length,
      cancellations: cancellations.length,
    };
  }, [appointments, today]);

  const todaysSlots = useMemo(() => {
    const timeslots = getTimeslots();
    return timeslots
      .filter((slot: Timeslot) => slot.date === today)
      .map((slot: Timeslot): TimeslotWithBookings => {
        const appointmentCount = appointments.filter(
          (apt) => apt.timeslotId === slot.id && apt.status !== "cancelled"
        ).length;

        return {
          ...slot,
          booked: appointmentCount,
          available: slot.capacity - appointmentCount,
        };
      })
      .sort((a: TimeslotWithBookings, b: TimeslotWithBookings) =>
        a.start.localeCompare(b.start)
      );
  }, [getTimeslots, appointments, today]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Overview of today&apos;s operations and system metrics
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-sm text-gray-600">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <KPICard
          title="Today's Appointments"
          value={kpis.todaysAppointments}
          description="Total scheduled for today"
          icon={Calendar}
        />
        <KPICard
          title="Pending Check-ins"
          value={kpis.pendingCheckins}
          description="Awaiting check-in"
          icon={Clock}
        />
        <KPICard
          title="In Progress"
          value={kpis.inProgress}
          description="Currently being served"
          icon={Users}
        />
        <KPICard
          title="Completed"
          value={kpis.completed}
          description="Finished today"
          icon={CheckCircle}
        />
        <KPICard
          title="Cancellations"
          value={kpis.cancellations}
          description="Cancelled today"
          icon={XCircle}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Manage Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View, update, and manage all appointment bookings
            </p>
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/admin/appointments">
                Open Appointments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Manage Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create templates, set exceptions, and generate time slots
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Link href="/admin/schedule">
                Open Schedule
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Manage Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Configure services, requirements, and availability
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Link href="/admin/services">
                Open Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span>Today&apos;s Schedule Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysSlots.length > 0 ? (
            <div className="space-y-3">
              {todaysSlots.slice(0, 8).map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium">
                      {slot.start} - {slot.end}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Service ID: {slot.serviceId}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="font-medium">{slot.booked}</span>
                      <span className="text-muted-foreground">
                        /{slot.capacity} booked
                      </span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        slot.available === 0
                          ? "bg-red-100 text-red-800"
                          : slot.available <= 1
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {slot.available} available
                    </div>
                  </div>
                </div>
              ))}
              {todaysSlots.length > 8 && (
                <div className="text-center pt-4">
                  <Button asChild variant="outline">
                    <Link href="/admin/schedule">
                      View all {todaysSlots.length} slots
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No slots for today
              </h3>
              <p className="text-muted-foreground mb-4">
                Generate time slots using schedule templates
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/admin/schedule">Manage Schedule</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
