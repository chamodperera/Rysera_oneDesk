import {
  Department,
  Service,
  Timeslot,
  ScheduleTemplate,
  ScheduleException,
  Officer,
} from "./booking-types";

// Mock departments
export const departments: Department[] = [
  {
    id: "dept-1",
    name: "Civil Registration",
    description:
      "Birth certificates, marriage certificates, and other civil documents",
  },
  {
    id: "dept-2",
    name: "Immigration Services",
    description:
      "Passport applications, visa services, and immigration documents",
  },
  {
    id: "dept-3",
    name: "Motor Traffic",
    description: "Driving licenses, vehicle registration, and traffic permits",
  },
  {
    id: "dept-4",
    name: "Social Services",
    description: "Welfare benefits, disability services, and social support",
  },
  {
    id: "dept-5",
    name: "Tax & Revenue",
    description: "Tax registration, tax clearance, and revenue services",
  },
];

// Mock services
export const services: Service[] = [
  // Civil Registration
  {
    id: "service-1",
    departmentId: "dept-1",
    name: "Birth Certificate",
    description: "Apply for or renew birth certificate",
    durationMinutes: 30,
    requiredDocuments: [
      "NIC copy",
      "Hospital birth record",
      "Parent's marriage certificate",
    ],
    requirements: ["ID verification", "Hospital documentation"],
    active: true,
  },
  {
    id: "service-2",
    departmentId: "dept-1",
    name: "Marriage Certificate",
    description: "Register marriage and obtain certificate",
    durationMinutes: 45,
    requiredDocuments: [
      "Both parties' NIC copies",
      "Birth certificates",
      "Divorce decree (if applicable)",
    ],
    requirements: ["ID verification", "Legal documentation"],
    active: true,
  },
  {
    id: "service-3",
    departmentId: "dept-1",
    name: "Death Certificate",
    description: "Register death and obtain certificate",
    durationMinutes: 30,
    requiredDocuments: [
      "Deceased's NIC copy",
      "Medical certificate",
      "Next of kin NIC",
    ],
    requirements: ["Medical verification", "Next of kin verification"],
    active: true,
  },

  // Immigration Services
  {
    id: "service-4",
    departmentId: "dept-2",
    name: "Passport Application",
    description: "Apply for new passport or renewal",
    durationMinutes: 60,
    requiredDocuments: [
      "NIC copy",
      "Birth certificate",
      "2 passport photos",
      "Old passport (for renewal)",
    ],
    requirements: ["ID verification", "Photo requirements", "Biometric data"],
    active: true,
  },
  {
    id: "service-5",
    departmentId: "dept-2",
    name: "Visa Application",
    description: "Apply for travel visa",
    durationMinutes: 45,
    requiredDocuments: [
      "Passport copy",
      "Visa application form",
      "Bank statements",
      "Travel itinerary",
    ],
    requirements: ["Financial verification", "Travel documentation"],
    active: true,
  },

  // Motor Traffic
  {
    id: "service-6",
    departmentId: "dept-3",
    name: "Driving License",
    description: "Apply for new driving license or renewal",
    durationMinutes: 90,
    requiredDocuments: [
      "NIC copy",
      "Medical certificate",
      "Eye test report",
      "Driving school certificate",
    ],
    requirements: ["Medical clearance", "Driving test", "Theory test"],
    active: true,
  },
  {
    id: "service-7",
    departmentId: "dept-3",
    name: "Vehicle Registration",
    description: "Register new vehicle or transfer ownership",
    durationMinutes: 60,
    requiredDocuments: [
      "Vehicle invoice",
      "Insurance certificate",
      "Emission test certificate",
      "Owner's NIC",
    ],
    requirements: ["Vehicle inspection", "Insurance verification"],
    active: true,
  },

  // Social Services
  {
    id: "service-8",
    departmentId: "dept-4",
    name: "Disability Benefits",
    description: "Apply for disability support benefits",
    durationMinutes: 75,
    requiredDocuments: [
      "Medical reports",
      "NIC copy",
      "Income certificate",
      "Bank account details",
    ],
    requirements: ["Medical assessment", "Financial verification"],
    active: true,
  },
  {
    id: "service-9",
    departmentId: "dept-4",
    name: "Senior Citizen Benefits",
    description: "Apply for senior citizen support services",
    durationMinutes: 45,
    requiredDocuments: [
      "NIC copy",
      "Birth certificate",
      "Income certificate",
      "Bank account details",
    ],
    requirements: ["Age verification", "Financial assessment"],
    active: true,
  },

  // Tax & Revenue
  {
    id: "service-10",
    departmentId: "dept-5",
    name: "Tax Registration",
    description: "Register for income tax",
    durationMinutes: 60,
    requiredDocuments: [
      "NIC copy",
      "Business registration",
      "Bank account details",
      "Address proof",
    ],
    requirements: ["Business verification", "Address verification"],
    active: true,
  },
  {
    id: "service-11",
    departmentId: "dept-5",
    name: "Tax Clearance",
    description: "Obtain tax clearance certificate",
    durationMinutes: 30,
    requiredDocuments: [
      "Tax returns",
      "Payment receipts",
      "NIC copy",
      "Business documents",
    ],
    requirements: ["Tax compliance verification"],
    active: true,
  },
];

// Generate timeslots for the next 14 days
export const generateTimeslots = (): Timeslot[] => {
  const timeslots: Timeslot[] = [];
  const today = new Date();

  // Business hours: 08:30-16:30, skip 12:30-13:30 (lunch)
  const timeSlots = [
    { start: "08:30", end: "09:00" },
    { start: "09:00", end: "09:30" },
    { start: "09:30", end: "10:00" },
    { start: "10:00", end: "10:30" },
    { start: "10:30", end: "11:00" },
    { start: "11:00", end: "11:30" },
    { start: "11:30", end: "12:00" },
    { start: "12:00", end: "12:30" },
    // Lunch break 12:30-13:30
    { start: "13:30", end: "14:00" },
    { start: "14:00", end: "14:30" },
    { start: "14:30", end: "15:00" },
    { start: "15:00", end: "15:30" },
    { start: "15:30", end: "16:00" },
    { start: "16:00", end: "16:30" },
  ];

  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    const dateStr = date.toISOString().split("T")[0];

    services.forEach((service) => {
      timeSlots.forEach((slot, index) => {
        const capacity = Math.floor(Math.random() * 4) + 2; // 2-5 capacity
        const booked = Math.floor(Math.random() * (capacity + 1)); // 0 to capacity bookings
        const available = capacity - booked;

        timeslots.push({
          id: `slot-${service.id}-${dateStr}-${index}`,
          serviceId: service.id,
          date: dateStr,
          start: slot.start,
          end: slot.end,
          capacity,
          available,
        });
      });
    });
  }

  return timeslots;
};

export const timeslots = generateTimeslots();

// Mock admin/officer data
export const officers: Officer[] = [
  {
    id: "officer-1",
    userId: "admin-user-1",
    departmentId: "dept-1",
    position: "Civil Registration Officer",
  },
  {
    id: "officer-2",
    userId: "admin-user-2",
    departmentId: "dept-2",
    position: "Immigration Services Officer",
  },
  {
    id: "officer-3",
    userId: "admin-user-3",
    departmentId: "dept-3",
    position: "Motor Traffic Officer",
  },
];

// Mock schedule templates
export const scheduleTemplates: ScheduleTemplate[] = [
  {
    id: "template-1",
    serviceId: "service-1",
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    startTime: "08:30",
    endTime: "16:30",
    intervalMinutes: 30,
    capacityPerSlot: 3,
    breaks: [{ start: "12:30", end: "13:30" }],
  },
  {
    id: "template-2",
    serviceId: "service-4",
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "16:00",
    intervalMinutes: 60,
    capacityPerSlot: 2,
    breaks: [{ start: "12:00", end: "13:00" }],
  },
];

// Mock schedule exceptions
export const scheduleExceptions: ScheduleException[] = [
  {
    id: "exception-1",
    serviceId: "service-1",
    date: "2025-08-25", // Public holiday
    type: "closed",
    note: "National Holiday",
  },
  {
    id: "exception-2",
    serviceId: "service-4",
    date: "2025-08-20",
    type: "capacity-override",
    capacityOverride: 5,
    note: "Extra capacity for high demand",
  },
];
