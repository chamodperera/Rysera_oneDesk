"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, FileText, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { Service, Department } from "@/lib/types";

// Mock data - same as API
const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Department of Motor Vehicles",
    description: "Vehicle registration, licensing, and driving permits",
    contact_email: "dmv@onedesk.gov",
    contact_phone: "+1-555-0101",
    address: "123 Government Plaza, City Center",
  },
  {
    id: "2",
    name: "Health Department",
    description: "Health services, permits, and public health records",
    contact_email: "health@onedesk.gov",
    contact_phone: "+1-555-0102",
    address: "456 Health Blvd, Medical District",
  },
  {
    id: "3",
    name: "Building & Planning",
    description: "Construction permits, zoning, and building inspections",
    contact_email: "planning@onedesk.gov",
    contact_phone: "+1-555-0103",
    address: "789 Planning St, Downtown",
  },
  {
    id: "4",
    name: "Social Services",
    description: "Benefits, assistance programs, and social support",
    contact_email: "social@onedesk.gov",
    contact_phone: "+1-555-0104",
    address: "321 Community Ave, Civic Center",
  },
];

const mockServices: Service[] = [
  // DMV Services
  {
    id: "1",
    department_id: "1",
    name: "Driver License Renewal",
    description: "Renew your driver's license or get a replacement",
    duration_minutes: 30,
    requirements: [
      "Current driver license",
      "Proof of residence",
      "Payment method",
    ],
    department: mockDepartments[0],
  },
  {
    id: "2",
    department_id: "1",
    name: "Vehicle Registration",
    description: "Register a new vehicle or renew existing registration",
    duration_minutes: 45,
    requirements: [
      "Vehicle title",
      "Insurance proof",
      "Emissions certificate",
      "Payment method",
    ],
    department: mockDepartments[0],
  },
  {
    id: "3",
    department_id: "1",
    name: "Driving Test",
    description: "Schedule your road test for new driver license",
    duration_minutes: 60,
    requirements: [
      "Learner permit",
      "Driving instructor certificate",
      "Vehicle for test",
    ],
    department: mockDepartments[0],
  },
  // Health Department Services
  {
    id: "4",
    department_id: "2",
    name: "Birth Certificate",
    description: "Request certified copy of birth certificate",
    duration_minutes: 20,
    requirements: ["Valid ID", "Proof of relationship", "Payment method"],
    department: mockDepartments[1],
  },
  {
    id: "5",
    department_id: "2",
    name: "Food Handler Permit",
    description: "Get certified food handler permit for restaurant work",
    duration_minutes: 90,
    requirements: ["Valid ID", "Completed application", "Training certificate"],
    department: mockDepartments[1],
  },
  // Building & Planning Services
  {
    id: "6",
    department_id: "3",
    name: "Building Permit",
    description: "Apply for residential or commercial building permit",
    duration_minutes: 60,
    requirements: [
      "Construction plans",
      "Property deed",
      "Contractor license",
      "Payment method",
    ],
    department: mockDepartments[2],
  },
  {
    id: "7",
    department_id: "3",
    name: "Business License",
    description: "Apply for new business operation license",
    duration_minutes: 45,
    requirements: [
      "Business registration",
      "Zoning approval",
      "Tax clearance",
      "Payment method",
    ],
    department: mockDepartments[2],
  },
  // Social Services
  {
    id: "8",
    department_id: "4",
    name: "Benefits Application",
    description: "Apply for social assistance benefits",
    duration_minutes: 75,
    requirements: [
      "Social Security card",
      "Income statements",
      "Proof of residence",
      "Bank statements",
    ],
    department: mockDepartments[3],
  },
];

// Mock user data
const mockUser = {
  name: "John Doe",
  email: "john.doe@email.com",
  role: "citizen" as const,
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [filteredServices, setFilteredServices] =
    useState<Service[]>(mockServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState(false);

  // Filter services based on search and department
  useEffect(() => {
    let filtered = services;

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (service) => service.department_id === selectedDepartment
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.department?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, selectedDepartment]);

  const ServiceCard = ({ service }: { service: Service }) => (
    <Card className="hover:shadow-lg transition-shadow border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-lg">{service.name}</CardTitle>
            <Badge variant="secondary" className="w-fit">
              {service.department?.name}
            </Badge>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">{service.duration_minutes}m</span>
          </div>
        </div>
        <CardDescription className="text-base">
          {service.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Requirements:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {service.requirements.map((req, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {service.department?.address}
        </div>

        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link href={`/services/${service.id}/book`}>
            <Calendar className="h-4 w-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={mockUser} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Government Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Book appointments for various government services. Select a service
            below to view requirements and schedule your appointment.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="all">All Services</TabsTrigger>
              {mockDepartments.map((dept) => (
                <TabsTrigger
                  key={dept.id}
                  value={dept.id}
                  className="text-xs lg:text-sm"
                >
                  {dept.name.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            Showing {filteredServices.length} of {services.length} services
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No services found</p>
                <p>Try adjusting your search or filter criteria</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDepartment("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
