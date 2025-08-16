"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layouts/AppLayout";
import { BookingStepper } from "@/components/booking/BookingStepper";
import { TimeslotGrid } from "@/components/booking/TimeslotGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, ArrowRight, FileText, CheckCircle } from "lucide-react";
import { services, departments, generateTimeslots } from "@/lib/demo-data";
import { humanServiceDuration } from "@/lib/demo-utils";
import { appointmentStore } from "@/lib/demo-store";
import type { Timeslot } from "@/lib/booking-types";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeslot, setSelectedTimeslot] = useState<Timeslot>();
  const [availableTimeslots, setAvailableTimeslots] = useState<Timeslot[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
    documents: [] as File[],
  });

  // Find the service
  const service = services.find((s) => s.id === serviceId);
  const department = service
    ? departments.find((d) => d.id === service.departmentId)
    : null;

  useEffect(() => {
    if (!service) {
      router.push("/services");
      return;
    }
  }, [service, router]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const filteredTimeslots = generateTimeslots().filter(
        (slot) => slot.date === dateStr
      );
      setAvailableTimeslots(filteredTimeslots);
    }
  }, [selectedDate]);

  if (!service || !department) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTimeslot) return;

    const bookingRef = appointmentStore.createAppointment({
      serviceId: service.id,
      timeslotId: selectedTimeslot.id,
      fullName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      docs: formData.documents.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })),
      status: "booked",
      userId: undefined,
    });

    // Find the appointment by booking reference to get the ID
    const appointment = appointmentStore
      .getAppointments()
      .find((a) => a.bookingRef === bookingRef);

    if (appointment) {
      router.push(`/appointments/${appointment.id}`);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.phone
        );
      case 2:
        return selectedDate;
      case 3:
        return selectedTimeslot;
      case 4:
        return true; // Documents are optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Personal Details
              </h2>
              <p className="text-gray-600">
                Please provide your contact information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional information you'd like to share"
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Select Date
              </h2>
              <p className="text-gray-600">
                Choose your preferred appointment date
              </p>
            </div>

            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) =>
                  date < new Date() ||
                  date.getDay() === 0 ||
                  date.getDay() === 6
                }
                className="rounded-md border"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Select Time
              </h2>
              <p className="text-gray-600">
                Choose your preferred time slot for{" "}
                {selectedDate?.toLocaleDateString()}
              </p>
            </div>

            <TimeslotGrid
              timeslots={availableTimeslots}
              selectedTimeslotId={selectedTimeslot?.id}
              onTimeslotSelect={setSelectedTimeslot}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Documents
              </h2>
              <p className="text-gray-600">
                Please upload the required documents
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Documents</CardTitle>
                <CardDescription>
                  Please ensure all documents are clear and legible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm">{doc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, JPG, PNG files up to 10MB
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="mt-4"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormData({ ...formData, documents: files });
                }}
              />
            </div>

            {formData.documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Files:</h4>
                {formData.documents.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Review & Confirm
              </h2>
              <p className="text-gray-600">
                Please review your appointment details
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Service</h4>
                  <p className="text-gray-600">{service.name}</p>
                  <Badge variant="secondary" className="mt-1">
                    {department.name}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">
                    Personal Details
                  </h4>
                  <p className="text-gray-600">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-gray-600">{formData.email}</p>
                  <p className="text-gray-600">{formData.phone}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Date & Time</h4>
                  <p className="text-gray-600">
                    {selectedDate?.toLocaleDateString()} at{" "}
                    {selectedTimeslot?.start} - {selectedTimeslot?.end}
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {humanServiceDuration(service.durationMinutes)}
                  </p>
                </div>

                {formData.documents.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900">Documents</h4>
                    <p className="text-gray-600">
                      {formData.documents.length} file(s) uploaded
                    </p>
                  </div>
                )}

                {formData.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900">Notes</h4>
                    <p className="text-gray-600">{formData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/services")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Book Appointment
            </h1>
            <p className="text-lg text-gray-600 mb-4">{service.name}</p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {department.name}
            </Badge>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <BookingStepper currentStep={currentStep} />
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
