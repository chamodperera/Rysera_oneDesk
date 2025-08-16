"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Clock,
  Calendar,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useDepartments, useServices } from "@/lib/department-service-store";
import { useIsAuthenticated } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const isAuthenticated = useIsAuthenticated();
  const { error: showError } = useToast();
  const initialLoadRef = useRef(false);

  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
    fetchDepartments,
  } = useDepartments();

  const {
    services,
    loading: servicesLoading,
    error: servicesError,
    fetchServices,
    fetchServicesByDepartment,
    searchServices,
  } = useServices();

  // Load initial data only once on mount
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;

      const loadInitialData = async () => {
        try {
          await Promise.all([fetchDepartments(), fetchServices()]);
        } catch {
          showError({
            title: "Error",
            description: "Failed to load data. Please refresh the page.",
          });
        }
      };

      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run only once

  // Handle department filter and search with debouncing
  useEffect(() => {
    if (!initialLoadRef.current) return; // Don't filter until initial load is done

    const delayedAction = setTimeout(() => {
      if (selectedDepartment === "all") {
        if (searchQuery.trim()) {
          searchServices(searchQuery);
        } else {
          // Refetch all services when "All" is selected and no search query
          fetchServices();
        }
      } else {
        const departmentId = parseInt(selectedDepartment);
        if (!isNaN(departmentId)) {
          fetchServicesByDepartment(departmentId);
        }
      }
    }, 300);

    return () => clearTimeout(delayedAction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartment, searchQuery]); // Only depend on the state values that should trigger re-filtering

  const getDepartmentName = (departmentId: number) => {
    return (
      departments.find((dept) => dept.id === departmentId)?.name ||
      "Unknown Department"
    );
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
  };

  const loading = departmentsLoading || servicesLoading;
  const error = departmentsError || servicesError;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Government Services
          </h1>
          <p className="text-lg text-gray-600">
            Book appointments for government services quickly and easily
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 focus-visible:ring-2 focus-visible:ring-primary"
              disabled={loading}
            />
          </div>
        </div>

        {/* Department Filter */}
        {departments.length > 0 && (
          <Tabs
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
            className="mb-8"
          >
            <TabsList className="flex w-full max-w-4xl mx-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              {departments.slice(0, 5).map((department) => (
                <TabsTrigger
                  key={department.id}
                  value={department.id.toString()}
                  className="text-xs"
                >
                  {department.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading services...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-lg text-red-600 mb-2">
                Error loading services
              </p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="hover:shadow-lg transition-shadow border-blue-200/50"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {getDepartmentName(service.department_id)}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(service.duration_minutes)}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    {service.description && (
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Required Documents */}
                    <div>
                      <div className="flex items-center mb-2">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Required Documents
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          Valid ID (NIC/Passport)
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          Application form
                        </div>
                        <div className="text-sm text-gray-500">
                          +2 more documents
                        </div>
                      </div>
                    </div>

                    {/* Book Button */}
                    <Button
                      asChild
                      className="w-full bg-primary text-primary-foreground hover:opacity-90"
                    >
                      <Link href={`/services/${service.id}`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {isAuthenticated ? "Book Appointment" : "View Details"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {services.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No services found</p>
                  <p className="text-sm">
                    Try adjusting your search or department filter
                  </p>
                </div>
              </div>
            )}

            {/* Results Count */}
            {services.length > 0 && (
              <div className="text-center mt-8 text-sm text-gray-500">
                Showing {services.length} services
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
