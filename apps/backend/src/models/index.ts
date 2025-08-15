// Base model interfaces and types for the Government Appointment Booking System

export interface BaseModel {
  id: string;
  created_at: Date;
  updated_at: Date;
}

// User roles enum
export enum UserRole {
  CITIZEN = 'citizen',
  OFFICER = 'officer', 
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

// Appointment status enum
export enum AppointmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Models will be implemented in future phases:
// - User
// - Department
// - Service
// - Officer
// - Timeslot
// - Appointment
// - Document
// - Notification
// - Feedback
// - AuditLog

export interface User extends BaseModel {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
}

export interface Department extends BaseModel {
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Service extends BaseModel {
  name: string;
  description?: string;
  department_id: string;
  duration_minutes: number;
  is_active: boolean;
}

// Additional models will be defined in Phase 2
