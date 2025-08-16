"use client";

import { useState } from "react";
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
import { Search, Clock, FileText, Calendar } from "lucide-react";
import { departments, services } from "@/lib/demo-data";
import { humanServiceDuration } from "@/lib/demo-utils";
import { useIsAuthenticated } from "@/lib/auth-store";

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const isAuthenticated = useIsAuthenticated();

  // Filter services based on search and department
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" ||
      service.departmentId === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentName = (departmentId: string) => {
    return departments.find((dept) => dept.id === departmentId)?.name || "";
  };

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
            />
          </div>
        </div>

        {/* Department Filter */}
        <Tabs
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-6 max-w-4xl mx-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {departments.map((department) => (
              <TabsTrigger
                key={department.id}
                value={department.id}
                className="text-xs"
              >
                {department.name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
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
                    {getDepartmentName(service.departmentId)}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {humanServiceDuration(service.durationMinutes)}
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
                    {service.requiredDocuments.slice(0, 2).map((doc, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-600 flex items-center"
                      >
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {doc}
                      </div>
                    ))}
                    {service.requiredDocuments.length > 2 && (
                      <div className="text-sm text-gray-500">
                        +{service.requiredDocuments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Button */}
                {isAuthenticated ? (
                  <Button
                    asChild
                    className="w-full bg-primary text-primary-foreground hover:opacity-90"
                  >
                    <Link href={`/services/${service.id}/book`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full bg-primary text-primary-foreground hover:opacity-90"
                  >
                    <Link
                      href={`/login?returnUrl=${encodeURIComponent(`/services/${service.id}/book`)}`}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Sign In to Book
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredServices.length === 0 && (
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
        {filteredServices.length > 0 && (
          <div className="text-center mt-8 text-sm text-gray-500">
            Showing {filteredServices.length} of {services.length} services
          </div>
        )}
      </div>
    </AppLayout>
  );
}
