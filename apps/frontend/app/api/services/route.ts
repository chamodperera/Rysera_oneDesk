import { NextRequest, NextResponse } from "next/server";
import { Service, Department } from "@/lib/types";

// Mock data for development
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department_id = searchParams.get("department_id");

    // TODO: Replace with actual database query
    let services = mockServices;

    if (department_id) {
      services = mockServices.filter(
        (service) => service.department_id === department_id
      );
    }

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch services",
      },
      { status: 500 }
    );
  }
}
