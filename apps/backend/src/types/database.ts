// Database types matching the Supabase schema from database.md

// Enums matching the database
export enum UserRole {
  CITIZEN = 'citizen',
  OFFICER = 'officer', 
  ADMIN = 'admin'
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum NotificationType {
  GENERIC = 'generic',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_CANCELLATION = 'appointment_cancellation',
  DOCUMENT_STATUS = 'document_status'
}

export enum NotificationMethod {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms'
}

export enum NotificationStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  FAILED = 'failed'
}

// Database table interfaces
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password_hash?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  department_id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  requirements?: string;
  created_at: string;
  updated_at: string;
}

export interface Officer {
  id: number;
  user_id: number;
  department_id: number;
  position?: string;
  created_at: string;
  updated_at: string;
}

export interface Timeslot {
  id: number;
  service_id: number;
  slot_date: string; // DATE format
  start_time: string; // TIME format
  end_time: string; // TIME format
  capacity: number;
  slots_available: number;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  user_id: number;
  service_id: number;
  officer_id?: number;
  timeslot_id: number;
  booking_no: number;
  status: AppointmentStatus;
  booking_reference?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  appointment_id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  document_type?: string;
  uploaded_at: string;
  status: DocumentStatus;
  comments?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  appointment_id?: number;
  type: NotificationType;
  message: string;
  sent_at?: string;
  method: NotificationMethod;
  status: NotificationStatus;
}

export interface Feedback {
  id: number;
  appointment_id: number;
  user_id: number;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}

// Database operation interfaces for type safety
export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password_hash?: string;
  role: UserRole;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  role?: UserRole;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
}

export interface CreateServiceData {
  department_id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  requirements?: string;
}

export interface CreateTimeslotData {
  service_id: number;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  slots_available: number;
}

export interface CreateAppointmentData {
  user_id: number;
  service_id: number;
  timeslot_id: number;
  officer_id?: number;
  booking_reference?: string;
  qr_code?: string;
}

// Join interfaces for complex queries
export interface AppointmentWithDetails extends Appointment {
  user?: Pick<User, 'first_name' | 'last_name' | 'email' | 'phone_number'>;
  service?: Pick<Service, 'name' | 'description' | 'duration_minutes'>;
  officer?: {
    user: Pick<User, 'first_name' | 'last_name' | 'email'>;
    position?: string;
  };
  timeslot?: Pick<Timeslot, 'slot_date' | 'start_time' | 'end_time'>;
  department?: Pick<Department, 'name'>;
}

export interface ServiceWithDepartment extends Service {
  department?: Pick<Department, 'name' | 'description'>;
}

export interface OfficerWithDetails extends Officer {
  user?: Pick<User, 'first_name' | 'last_name' | 'email' | 'phone_number'>;
  department?: Pick<Department, 'name' | 'description'>;
}
