"use client";

import { useState, useEffect, useRef } from "react";
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
import { ArrowLeft, Clock, AlertCircle, Loader2 } from "lucide-react";
import { serviceApi, Service } from "@/lib/api";
import { useDepartments } from "@/lib/department-service-store";
import { useIsAuthenticated } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = parseInt(params.serviceId as string);
  const isAuthenticated = useIsAuthenticated();
  const { error: showError } = useToast();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const { departments, fetchDepartments } = useDepartments();

  // Create stable references to prevent useEffect re-runs
  const fetchDepartmentsRef = useRef(fetchDepartments);
  const showErrorRef = useRef(showError);

  // Update refs when functions change
  useEffect(() => {
    fetchDepartmentsRef.current = fetchDepartments;
    showErrorRef.current = showError;
  }, [fetchDepartments, showError]);

  // Reset fetchedRef when serviceId changes
  useEffect(() => {
    fetchedRef.current = false;
  }, [serviceId]);

  // Fetch service details
  useEffect(() => {
    const loadServiceDetails = async () => {
      // Only run if we haven't fetched this specific service yet
      if (isNaN(serviceId) || fetchedRef.current || service?.id === serviceId) {
        if (isNaN(serviceId)) {
          setError("Invalid service ID");
          setLoading(false);
        }
        return;
      }

      fetchedRef.current = true;

      try {
        setLoading(true);
        setError(null);

        // Fetch departments if not already loaded (cached in store)
        await fetchDepartmentsRef.current();

        const response = await serviceApi.getById(serviceId);
        if (response.success && response.data) {
          setService(response.data.service);
        } else {
          setError(response.message || "Service not found");
          fetchedRef.current = false; // Allow retry on error
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load service details";
        setError(errorMessage);
        showErrorRef.current({
          title: "Error",
          description: errorMessage,
        });
        fetchedRef.current = false; // Allow retry on error
      } finally {
        setLoading(false);
      }
    };

    loadServiceDetails();
  }, [serviceId, service?.id]); // Only essential dependencies to prevent infinite re-renders

  const getDepartmentName = (departmentId: number) => {
    return (
      departments.find((dept) => dept.id === departmentId)?.name ||
      "Unknown Department"
    );
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      router.push(
        `/login?returnUrl=${encodeURIComponent(`/services/${serviceId}/book`)}`
      );
      return;
    }

    // Navigate to booking flow (this will be implemented in Task 3)
    router.push(`/services/${serviceId}/book`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">
              Loading service details...
            </span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !service) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Service Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The requested service could not be found."}
            </p>
            <Button onClick={() => router.push("/services")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/services")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Service Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {service.name}
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {getDepartmentName(service.department_id)}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(service.duration_minutes)}
              </div>
            </div>
            {service.description && (
              <p className="text-lg text-gray-600">{service.description}</p>
            )}
          </div>

          {/* Service Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
                    <p className="text-gray-600">
                      This service typically takes{" "}
                      {formatDuration(service.duration_minutes)} to complete.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Department
                    </h4>
                    <p className="text-gray-600">
                      {getDepartmentName(service.department_id)}
                    </p>
                  </div>

                  {service.department && service.department.contact_info && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Contact Information
                      </h4>
                      <p className="text-gray-600">
                        {service.department.contact_info}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Information */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Prepare</CardTitle>
                  <CardDescription>
                    Please ensure you have all required information ready before
                    booking your appointment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        What to Expect
                      </h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Arrive 15 minutes before your scheduled appointment
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Bring a valid ID and any required documents that may
                          need to be submitted physically
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Service duration:{" "}
                          {formatDuration(service.duration_minutes)}
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Book This Service</CardTitle>
                  <CardDescription>
                    Schedule your appointment online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {formatDuration(service.duration_minutes)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Appointment Duration
                    </div>
                  </div>

                  <Button
                    onClick={handleBookAppointment}
                    className="w-full"
                    size="lg"
                  >
                    {isAuthenticated ? "Book Appointment" : "Sign In to Book"}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    Free cancellation up to 24 hours before your appointment
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
