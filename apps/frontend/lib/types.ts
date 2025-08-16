// Database schema types for OneDesk appointment booking system

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password_hash: string;
  role: "citizen" | "officer";
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

export interface Service {
  id: string;
  department_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  requirements: string[];
  department?: Department; // Optional populated field
}

export interface TimeSlot {
  id: string;
  service_id: string;
  slot_date: string; // ISO date string
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  capacity: number;
  slots_available: number;
}

export interface Officer {
  id: string;
  user_id: string;
  department_id: string;
  position: string;
  user?: User; // Optional populated field
  department?: Department; // Optional populated field
}

export interface Appointment {
  id: string;
  user_id: string;
  service_id: string;
  officer_id: string;
  timeslot_id: string;
  booking_no: string;
  status: "booked" | "in-progress" | "completed" | "cancelled";
  booking_reference: string;
  qr_code: string;
  created_at: string;
  updated_at: string;
  // Optional populated fields
  user?: User;
  service?: Service;
  officer?: Officer;
  timeslot?: TimeSlot;
}

export interface Document {
  id: string;
  appointment_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  document_type: string;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  appointment_id?: string;
  type:
    | "booking_confirmed"
    | "reminder"
    | "cancellation"
    | "completion"
    | "feedback_request";
  message: string;
  sent_at: string;
  method: "email" | "sms" | "in_app";
  status: "sent" | "pending" | "failed";
}

export interface Feedback {
  id: string;
  appointment_id: string;
  user_id: string;
  rating: number; // 1-5 stars
  comment?: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface BookingForm {
  service_id: string;
  slot_date: string;
  timeslot_id: string;
  user_notes?: string;
}

export interface FeedbackForm {
  rating: number;
  comment?: string;
}

export interface DocumentUploadForm {
  appointment_id: string;
  files: File[];
  document_type: string;
  comments?: string;
}

// UI State types
export interface AppointmentFilters {
  status?: Appointment["status"];
  date_from?: string;
  date_to?: string;
  service_id?: string;
}

export interface ServiceWithSlots extends Service {
  available_slots: TimeSlot[];
}
