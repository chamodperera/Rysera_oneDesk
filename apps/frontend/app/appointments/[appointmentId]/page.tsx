"use client";

import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  ArrowLeft,
  Download,
} from "lucide-react";
import { appointmentStore } from "@/lib/demo-store";
import { services, departments, timeslots } from "@/lib/demo-data";
import { humanServiceDuration } from "@/lib/demo-utils";
import type { Appointment } from "@/lib/booking-types";

export default function AppointmentConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const appointment = appointmentStore
    .getAppointments()
    .find((a: Appointment) => a.id === appointmentId);
  const service = appointment
    ? services.find((s) => s.id === appointment.serviceId)
    : null;
  const department = service
    ? departments.find((d) => d.id === service.departmentId)
    : null;
  const timeslot = appointment
    ? timeslots.find((t) => t.id === appointment.timeslotId)
    : null;

  if (!appointment || !service || !department || !timeslot) {
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
                {appointment.id.toUpperCase()}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Keep this number for your records
              </div>
            </div>

            {/* Service Information */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Service Information
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Service:</span> {service.name}
                </div>
                <div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {department.name}
                  </Badge>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    Duration: {humanServiceDuration(service.durationMinutes)}
                  </span>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Date & Time</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{new Date(timeslot.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {timeslot.start} - {timeslot.end}
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
                  {appointment.fullName}
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{appointment.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{appointment.phone}</span>
                </div>
              </div>
            </div>

            {/* Documents */}
            {appointment.docs && appointment.docs.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Uploaded Documents
                </h3>
                <div className="space-y-2">
                  {appointment.docs.map(
                    (
                      doc: { name: string; type: string; size: number },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Additional Notes
                </h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">
                  {appointment.notes}
                </p>
              </div>
            )}
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
              <div className="font-medium">{department.name}</div>
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
