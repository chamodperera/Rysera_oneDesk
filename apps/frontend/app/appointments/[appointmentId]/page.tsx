"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useAppointmentBookingStore } from "@/lib/appointment-booking-store";
import { useIsAuthenticated } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from "@/lib/api";

// Helper function to format time from HH:MM to readable format
const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Helper function to get human readable duration
const humanServiceDuration = (minutes: number) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} min`;
  }
  return `${minutes} minutes`;
};

export default function AppointmentConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const appointmentId = parseInt(params.appointmentId as string, 10);
  const isAuthenticated = useIsAuthenticated();

  const { fetchAppointmentById, loading } = useAppointmentBookingStore();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadAppointment = async () => {
      const appointmentData = await fetchAppointmentById(appointmentId);
      if (appointmentData) {
        setAppointment(appointmentData);
      } else {
        toast({
          title: "Appointment not found",
          description: "The requested appointment could not be found.",
          variant: "destructive",
        });
        router.push("/dashboard/appointments");
      }
    };

    loadAppointment();
  }, [appointmentId, fetchAppointmentById, isAuthenticated, router, toast]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!appointment) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Appointment Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The appointment you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push("/services")}>
              Back to Services
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Appointment Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your appointment has been successfully scheduled.
          </p>
        </div>

        {/* Appointment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Appointment Details
            </CardTitle>
            <CardDescription>
              Please save these details for your records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reference Number */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-1">
                Reference Number
              </div>
              <div className="text-xl font-bold text-blue-900">
                {appointment.booking_reference}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Keep this reference number for your records
              </div>
            </div>

            {/* Service Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Service Information
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Service:</span>{" "}
                  {appointment.service?.name || "N/A"}
                </div>
                {appointment.service && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      Duration:{" "}
                      {humanServiceDuration(
                        appointment.service.duration_minutes
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Date & Time</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {appointment.timeslot
                      ? new Date(appointment.timeslot.date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {appointment.timeslot
                      ? `${formatTime(appointment.timeslot.start_time)} - ${formatTime(appointment.timeslot.end_time)}`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Personal Details
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {appointment.user
                    ? `${appointment.user.first_name} ${appointment.user.last_name}`
                    : "N/A"}
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{appointment.user?.email || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{appointment.user?.phone_number || "N/A"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">
                {appointment.service?.name
                  ? `${appointment.service.name} Department`
                  : "Government Department"}
              </div>
              <div className="text-gray-600">
                123 Government Street
                <br />
                Capital City, Province A1B 2C3
                <br />
                Canada
              </div>
              <div className="text-sm text-gray-500 mt-3">
                Please arrive 15 minutes early for your appointment
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700">
            <ul className="space-y-1 text-sm">
              <li>• Please bring a valid government-issued photo ID</li>
              <li>• Arrive 15 minutes before your scheduled time</li>
              <li>
                • Bring all required documents mentioned in your service
                requirements
              </li>
              <li>
                • If you need to reschedule, please call at least 24 hours in
                advance
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/services")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
          <Button onClick={() => window.print()} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Print Confirmation
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
