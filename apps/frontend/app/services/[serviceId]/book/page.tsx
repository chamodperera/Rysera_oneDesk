"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import {
  DocumentUpload,
  type DocumentFile,
} from "@/components/booking/DocumentUpload";
import { useIsAuthenticated, useUser } from "@/lib/auth-store";
import { useDepartmentServiceStore } from "@/lib/department-service-store";
import { useAppointmentBookingStore } from "@/lib/appointment-booking-store";
import { useToast } from "@/hooks/use-toast";

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

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const serviceId = parseInt(params.serviceId as string, 10);
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  // Stores
  const { services, fetchServices, allServicesFetched } =
    useDepartmentServiceStore();
  const {
    selectedStartDate,
    selectedEndDate,
    selectedTimeslot,
    formData,
    timeslots,
    loading,
    error,
    setSelectedStartDate,
    setSelectedEndDate,
    setSelectedTimeslot,
    updateFormData,
    searchTimeslots,
    bookAppointment,
    uploadDocuments,
    clearError,
  } = useAppointmentBookingStore();

  const [currentStep, setCurrentStep] = useState(1);
  const lastSearchParamsRef = useRef<string>("");
  const servicesInitializedRef = useRef(false);
  const formPrefilledRef = useRef(false);
  const mountedRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track component mount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Find the service from store - memoize to prevent unnecessary re-renders
  const service = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );
  const department = service?.department;

  useEffect(() => {
    // Fetch services if not already loaded and not currently loading
    if (
      mountedRef.current &&
      !allServicesFetched &&
      services.length === 0 &&
      !servicesInitializedRef.current
    ) {
      servicesInitializedRef.current = true;
      fetchServices();
    }
  }, [allServicesFetched, services.length, fetchServices]);

  useEffect(() => {
    if (!service && allServicesFetched && mountedRef.current) {
      toast({
        title: "Service not found",
        description: "The requested service could not be found.",
        variant: "destructive",
      });
      router.push("/services");
      return;
    }
  }, [service, allServicesFetched, router, toast]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && mountedRef.current) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
  }, [isAuthenticated, router]);

  // Create a stable version of form data update to prevent re-renders
  const updateFormDataStable = useCallback(
    (data: Partial<typeof formData>) => {
      updateFormData(data);
    },
    [updateFormData]
  );

  useEffect(() => {
    // Pre-fill form data with user information if authenticated
    if (
      mountedRef.current &&
      isAuthenticated &&
      user &&
      !formPrefilledRef.current
    ) {
      formPrefilledRef.current = true;
      updateFormDataStable({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone_number || "",
      });
    }
  }, [isAuthenticated, user, updateFormDataStable]);

  // Memoize the search function to prevent unnecessary re-renders with debounce
  const searchTimeslotsStable = useCallback(
    (params: { fromDate: string; toDate: string; serviceIds: number[] }) => {
      const searchParams = `${params.fromDate}-${params.toDate}-${params.serviceIds.join(",")}`;

      // Prevent duplicate requests
      if (lastSearchParamsRef.current === searchParams) {
        return;
      }

      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      lastSearchParamsRef.current = searchParams;

      // Add a small delay to prevent rapid successive calls
      searchTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          searchTimeslots({
            fromDate: params.fromDate,
            toDate: params.toDate,
            serviceIds: params.serviceIds,
            availableOnly: true,
          });
        }
      }, 100);
    },
    [searchTimeslots]
  );

  useEffect(() => {
    // Fetch available timeslots when both dates are selected
    if (selectedStartDate && selectedEndDate && service && mountedRef.current) {
      const fromDateStr = selectedStartDate.toISOString().split("T")[0];
      const toDateStr = selectedEndDate.toISOString().split("T")[0];

      // Ensure fromDate is not after toDate
      if (fromDateStr <= toDateStr) {
        searchTimeslotsStable({
          fromDate: fromDateStr,
          toDate: toDateStr,
          serviceIds: [service.id],
        });
      }
    }
  }, [selectedStartDate, selectedEndDate, service, searchTimeslotsStable]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
      // Clear any pending search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [clearError]);

  if (!service && allServicesFetched) {
    return null;
  }

  if (!service) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
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

  const handleSubmit = async () => {
    // Check if user is authenticated before allowing booking
    if (!isAuthenticated || !user) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    if (!selectedStartDate || !selectedEndDate || !selectedTimeslot) {
      toast({
        title: "Booking Error",
        description: "Please select a date range and timeslot.",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, create the appointment
      const appointment = await bookAppointment(
        service.id,
        selectedTimeslot.id,
        user.id
      );

      if (!appointment) {
        toast({
          title: "Booking Failed",
          description: error || "Failed to book appointment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // If there are documents to upload, upload them
      if (formData.documents.length > 0) {
        const documentsUploaded = await uploadDocuments(
          appointment.id,
          formData.documents
        );

        if (!documentsUploaded) {
          // Appointment was created but documents failed to upload
          toast({
            title: "Appointment Booked",
            description: `Your appointment has been booked (${appointment.booking_reference}), but some documents failed to upload. You can upload them later from your appointments page.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Booking Successful!",
            description: `Your appointment has been booked with all documents uploaded. Reference: ${appointment.booking_reference}`,
          });
        }
      } else {
        toast({
          title: "Booking Successful!",
          description: `Your appointment has been booked. Reference: ${appointment.booking_reference}`,
        });
      }

      router.push(`/dashboard/appointments`);
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
        return selectedStartDate && selectedEndDate;
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
                    updateFormData({ firstName: e.target.value })
                  }
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData({ lastName: e.target.value })}
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
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="Enter your email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData({ notes: e.target.value })}
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
                Select Date Range
              </h2>
              <p className="text-gray-600">
                Choose your preferred appointment date range by selecting start
                and end dates
              </p>
            </div>

            <div className="flex justify-center">
              <Calendar
                mode="range"
                selected={{
                  from: selectedStartDate || undefined,
                  to: selectedEndDate || undefined,
                }}
                onSelect={(range) => {
                  if (range?.from) {
                    setSelectedStartDate(range.from);
                  } else {
                    setSelectedStartDate(null);
                  }

                  if (range?.to) {
                    setSelectedEndDate(range.to);
                  } else {
                    setSelectedEndDate(null);
                  }
                }}
                disabled={(date) =>
                  date < new Date() ||
                  date.getDay() === 0 ||
                  date.getDay() === 6
                }
                numberOfMonths={2}
                className="rounded-md border"
              />
            </div>

            {selectedStartDate && selectedEndDate && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  Selected range: {selectedStartDate.toLocaleDateString()} to{" "}
                  {selectedEndDate.toLocaleDateString()}
                </p>
              </div>
            )}
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
                Choose your preferred time slot for the date range:{" "}
                {selectedStartDate?.toLocaleDateString()} to{" "}
                {selectedEndDate?.toLocaleDateString()}
              </p>
            </div>

            <TimeslotGrid
              timeslots={timeslots}
              selectedTimeslotId={selectedTimeslot?.id}
              onTimeslotSelect={setSelectedTimeslot}
              loading={loading}
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
                  Please upload any supporting documents for your appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm">
                      National Identity Card (NIC)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm">
                      Supporting documents related to the service
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="text-sm text-gray-500">
                      Any additional relevant documents (optional)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DocumentUpload
              documents={formData.documents}
              onDocumentsChange={(documents: DocumentFile[]) =>
                updateFormData({ documents })
              }
              maxFiles={5}
              acceptedTypes={[
                "application/pdf",
                "image/jpeg",
                "image/jpg",
                "image/png",
              ]}
            />
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
                    {department?.name}
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
                    {selectedStartDate?.toLocaleDateString()} to{" "}
                    {selectedEndDate?.toLocaleDateString()} at{" "}
                    {selectedTimeslot &&
                      formatTime(selectedTimeslot.start_time)}{" "}
                    -{" "}
                    {selectedTimeslot && formatTime(selectedTimeslot.end_time)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {humanServiceDuration(service.duration_minutes)}
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
            {department && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {department.name}
              </Badge>
            )}
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
