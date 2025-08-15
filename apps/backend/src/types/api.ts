// Common API response types for the Government Appointment Booking System

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any;
  timestamp: string;
}

// Request query parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
  filter?: Record<string, any>;
}

// JWT payload interface
export interface JWTPayload {
  id: string;
  email: string;
  role: 'citizen' | 'officer' | 'admin' | 'superadmin';
  iat?: number;
  exp?: number;
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  uploadedAt: Date;
}

// Email types
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Audit log types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
