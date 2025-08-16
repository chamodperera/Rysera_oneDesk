// Types for OneDesk appointment booking system

export type Role = "citizen" | "officer";
export type Status = "booked" | "in-progress" | "completed" | "cancelled";

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Service {
  id: string;
  departmentId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  requiredDocuments: string[];
  requirements: string[];
  active: boolean;
}

export interface Timeslot {
  id: string;
  serviceId: string;
  date: string;
  start: string;
  end: string;
  capacity: number;
  available: number;
}

export interface Appointment {
  id: string;
  bookingRef: string;
  userId?: string;
  serviceId: string;
  timeslotId: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  docs: { name: string; type: string; size: number }[];
  status: Status;
  createdAt: string;
}

export interface ScheduleTemplate {
  id: string;
  serviceId: string;
  daysOfWeek: number[]; // 0=Sun..6=Sat
  startTime: string; // "08:30"
  endTime: string; // "16:30"
  intervalMinutes: number; // default from service.durationMinutes
  capacityPerSlot: number; // default capacity for generated slots
  breaks?: { start: string; end: string }[]; // e.g. lunch 12:30-13:30
}

export interface ScheduleException {
  id: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  type: "closed" | "open" | "capacity-override";
  capacityOverride?: number; // for "capacity-override"
  openStart?: string;
  openEnd?: string; // for ad-hoc open window
  note?: string;
}

export interface Officer {
  id: string;
  userId: string;
  departmentId: string;
  position: string;
}

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
}

export interface Feedback {
  id: string;
  appointmentId: string;
  userId?: string;
  serviceId: string;
  rating: Rating;
  comment?: string;
  createdAt: string; // ISO
}

export interface BookingStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}
