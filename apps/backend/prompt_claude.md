# If each service is currently available, read it and evaluate before executing next step.

# Government Appointment System - Backend Development Prompts

## Phase 1: Project Setup & Core Infrastructure

### Task 1.1: Project Initialization
**Prompt:**
```
Create a new Node.js Express project for a Government Appointment Booking System with the following requirements:

SETUP REQUIREMENTS:
- Initialize package.json with project name "gov-appointment-system"
- Install dependencies: express, cors, helmet, morgan, dotenv, jsonwebtoken, bcryptjs, supabase-js, qrcode, socket.io, twilio
- Install dev dependencies: jest, supertest, nodemon
- Create folder structure:
  ```
  src/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
    config/
  tests/
  uploads/
  ```
- Setup basic Express server with CORS, helmet, and morgan middleware
- Create .env.example with required environment variables
- Setup nodemon script for development
- Create basic health check endpoint GET /api/health

DELIVERABLES:
- Complete package.json
- Basic server.js file
- Folder structure
- .env.example file
- README.md with setup instructions
```

### Task 1.2: Database Configuration
**Prompt:**
```
Setup Supabase database configuration for the Government Appointment System:

REQUIREMENTS:
- Create src/config/database.js to initialize Supabase client
- Setup environment variables for Supabase URL and API key
- Create database schema based on the ER diagram:
  - users (id, first_name, last_name, email, phone_number, password_hash, role, created_at, updated_at)
  - departments (id, name, description, contact_email, contact_phone, address, created_at, updated_at)
  - services (id, department_id, name, description, duration_minutes, requirements, created_at, updated_at)
  - officers (id, user_id, department_id, position, created_at, updated_at)
  - timeslots (id, service_id, slot_date, start_time, end_time, capacity, slots_available, created_at, updated_at)
  - appointments (id, user_id, service_id, officer_id, timeslot_id, booking_no, status, booking_reference, qr_code, created_at, updated_at)
  - documents (id, appointment_id, user_id, file_name, file_path, document_type, uploaded_at, status, comments)
  - notifications (id, user_id, appointment_id, type, message, sent_at, method, status)
  - feedbacks (id, appointment_id, user_id, rating, comment, created_at)

CONSTRAINTS:
- Add proper foreign key relationships
- Add enum constraints for status fields
- Add check constraints for business hours (9 AM - 4 PM)
- Setup RLS policies for data security

DELIVERABLES:
- database.js configuration file
- SQL schema creation scripts
- Database connection test function
```

## Phase 2: Authentication & User Management

### Task 2.1: Authentication Middleware
**Prompt:**
```
Create JWT-based authentication system for the Government Appointment System:

REQUIREMENTS:
- Create src/middleware/auth.js with JWT verification
- Create src/utils/jwt.js for token generation and verification
- Implement role-based authorization middleware (citizen, officer, superadmin)
- Create password hashing utilities using bcryptjs
- Setup token expiration (24 hours for access tokens)

FUNCTIONS TO IMPLEMENT:
- generateToken(userId, role)
- verifyToken(token)
- hashPassword(password)
- comparePassword(password, hash)
- authenticateToken middleware
- authorizeRole(['superadmin', 'officer']) middleware

DELIVERABLES:
- auth.js middleware file
- jwt.js utility file
- Password utilities
- Role-based authorization middleware
```

### Task 2.2: User Management APIs
**Prompt:**
```
Create user management REST APIs for the Government Appointment System:

ENDPOINTS TO IMPLEMENT:
- POST /api/auth/register (citizen registration)
- POST /api/auth/login (all user types)
- POST /api/auth/logout
- GET /api/auth/profile (get current user)
- PUT /api/auth/profile (update current user)
- POST /api/users (superadmin only - create officer/admin accounts)
- GET /api/users (superadmin only - list all users)
- PUT /api/users/:id (superadmin only - update any user)
- DELETE /api/users/:id (superadmin only - delete user)

VALIDATION REQUIREMENTS:
- Email format validation
- Phone number format validation
- Password strength validation (min 8 chars, 1 uppercase, 1 number)
- Role validation (citizen, officer, superadmin)

BUSINESS RULES:
- Citizens can self-register
- Officers and superadmins must be created by existing superadmin
- Email must be unique
- Phone number must be unique

DELIVERABLES:
- src/controllers/authController.js
- src/controllers/userController.js
- src/routes/auth.js
- src/routes/users.js
- Input validation middleware
```

## Phase 3: Core Business Logic

### Task 3.1: Department & Service Management
**Prompt:**
```
Create department and service management APIs for the Government Appointment System:

ENDPOINTS TO IMPLEMENT:
- GET /api/departments (public - list all departments)
- POST /api/departments (superadmin only)
- PUT /api/departments/:id (superadmin only)
- DELETE /api/departments/:id (superadmin only)
- GET /api/departments/:id/services (public - services by department)
- POST /api/services (superadmin only)
- PUT /api/services/:id (superadmin only)
- DELETE /api/services/:id (superadmin only)
- GET /api/services/:id (public - service details)

BUSINESS RULES:
- Department deletion only allowed if no active services
- Service deletion only allowed if no future appointments
- Services must have valid department_id
- Duration must be between 15-240 minutes

DELIVERABLES:
- src/controllers/departmentController.js
- src/controllers/serviceController.js
- src/routes/departments.js
- src/routes/services.js
- Validation middleware for department/service data
```

### Task 3.2: Officer Management
**Prompt:**
```
Create officer management system for the Government Appointment System:

ENDPOINTS TO IMPLEMENT:
- POST /api/officers (superadmin only - assign officer to department)
- GET /api/officers (superadmin only - list all officers)
- GET /api/departments/:id/officers (get officers by department)
- PUT /api/officers/:id (superadmin only - update officer)
- DELETE /api/officers/:id (superadmin only - remove officer)
- GET /api/officers/:id/schedule (officer's daily schedule)

BUSINESS RULES:
- Officer must be linked to existing user with 'officer' role
- Officer can only be assigned to one department
- Officer deletion should reassign their appointments

DELIVERABLES:
- src/controllers/officerController.js
- src/routes/officers.js
- Officer assignment validation
- Schedule management functions
```

## Phase 4: Appointment Booking System

### Task 4.1: Time Slot Management
**Prompt:**
```
Create time slot management system with business hours constraints:

ENDPOINTS TO IMPLEMENT:
- POST /api/timeslots (superadmin/officer - create time slots)
- GET /api/services/:id/timeslots (public - available slots for service)
- PUT /api/timeslots/:id (superadmin/officer - update slot)
- DELETE /api/timeslots/:id (superadmin/officer - delete slot)

BUSINESS RULES:
- Time slots only between 9 AM - 4 PM
- Minimum slot duration: 15 minutes
- No overlapping slots for same service
- Capacity must be positive integer
- Available slots calculated as (capacity - booked appointments)

FEATURES:
- Generate recurring time slots (daily, weekly)
- Check slot availability before booking
- Update available count when appointments are made/cancelled

DELIVERABLES:
- src/controllers/timeslotController.js
- src/routes/timeslots.js
- Time validation utilities
- Slot availability calculation functions
```

### Task 4.2: Appointment Booking Core
**Prompt:**
```
Create appointment booking system with QR code generation:

ENDPOINTS TO IMPLEMENT:
- POST /api/appointments (citizens - book appointment)
- GET /api/appointments (user's appointments)
- GET /api/appointments/:id (appointment details)
- PUT /api/appointments/:id/cancel (cancel appointment)
- PUT /api/appointments/:id/reschedule (reschedule appointment)
- PUT /api/appointments/:id/status (officer - update status)

BOOKING PROCESS:
1. Check time slot availability
2. Generate unique booking reference
3. Create QR code with appointment details
4. Assign available officer
5. Update slot capacity
6. Create appointment record

APPOINTMENT STATUSES:
- 'pending' (just booked)
- 'confirmed' (officer assigned)
- 'in_progress' (citizen checked in)
- 'completed' (service done)
- 'cancelled' (cancelled by citizen)
- 'no_show' (citizen didn't show up)

QR CODE CONTENT:
- Booking reference
- Appointment ID
- Date and time
- Service name
- Citizen name

DELIVERABLES:
- src/controllers/appointmentController.js
- src/routes/appointments.js
- src/services/qrService.js
- Booking reference generation utility
- Slot capacity management functions
```

## Phase 5: Document Management

### Task 5.1: Document Upload System
**Prompt:**
```
Create document upload system using Supabase Storage:

ENDPOINTS TO IMPLEMENT:
- POST /api/appointments/:id/documents (upload document)
- GET /api/appointments/:id/documents (list appointment documents)
- GET /api/documents/:id (download document)
- DELETE /api/documents/:id (delete document)
- PUT /api/documents/:id/status (officer - update document status)

REQUIREMENTS:
- Only PDF files allowed
- Maximum file size: 5MB
- Files stored in Supabase Storage
- Generate unique file names to prevent conflicts
- Document status: 'uploaded', 'verified', 'rejected'

SECURITY:
- Users can only upload documents for their own appointments
- Officers can view documents for their assigned appointments
- Superadmins can access all documents

DELIVERABLES:
- src/controllers/documentController.js
- src/routes/documents.js
- src/services/fileUploadService.js
- File validation middleware
- Document status management
```

## Phase 6: Notification System

### Task 6.1: Notification Service
**Prompt:**
```
Create scalable notification system with Twilio integration:

NOTIFICATION TYPES:
- Appointment confirmation
- 24-hour reminder
- Appointment cancellation
- Status updates
- Feedback requests

ENDPOINTS TO IMPLEMENT:
- POST /api/notifications/send (internal - trigger notification)
- GET /api/notifications (user's notifications)
- PUT /api/notifications/:id/read (mark as read)

FEATURES:
- Email notifications via Twilio SendGrid
- SMS notifications via Twilio (optional)
- Notification templates for different types
- Retry mechanism for failed notifications
- Notification history tracking

INTEGRATION POINTS:
- Trigger on appointment booking
- Schedule 24h reminder notifications
- Send on appointment status changes

DELIVERABLES:
- src/services/notificationService.js
- src/controllers/notificationController.js
- src/routes/notifications.js
- Email templates
- Notification scheduling system
```

## Phase 7: Check-in & Feedback

### Task 7.1: QR Code Verification & Check-in
**Prompt:**
```
Create QR code verification system for appointment check-in:

ENDPOINTS TO IMPLEMENT:
- POST /api/checkin/verify (officer - scan QR code)
- PUT /api/appointments/:id/checkin (update to in_progress)
- PUT /api/appointments/:id/complete (mark appointment complete)

QR VERIFICATION PROCESS:
1. Decode QR code data
2. Verify appointment exists and is valid
3. Check appointment date/time validity
4. Update appointment status
5. Return appointment details to officer

BUSINESS RULES:
- QR codes only valid on appointment date
- QR codes only valid 30 minutes before appointment
- Prevent duplicate check-ins
- Only assigned officer can check-in appointment

DELIVERABLES:
- src/controllers/checkinController.js
- src/routes/checkin.js
- QR code verification utilities
- Check-in validation logic
```

### Task 7.2: Feedback System
**Prompt:**
```
Create appointment feedback system:

ENDPOINTS TO IMPLEMENT:
- POST /api/appointments/:id/feedback (submit feedback)
- GET /api/feedback (superadmin - all feedback)
- GET /api/services/:id/feedback (service feedback summary)
- GET /api/officers/:id/feedback (officer feedback summary)

FEEDBACK FEATURES:
- Rating scale 1-5 stars
- Optional text comments
- Anonymous feedback option
- Feedback statistics and analytics
- Only allow feedback for completed appointments

ANALYTICS:
- Average rating per service
- Average rating per officer
- Feedback trends over time
- Common feedback themes

DELIVERABLES:
- src/controllers/feedbackController.js
- src/routes/feedback.js
- Feedback analytics utilities
- Rating calculation functions
```

## Phase 8: Real-time Features & Admin Dashboard

### Task 8.1: WebSocket Integration
**Prompt:**
```
Implement real-time features using Socket.IO:

REAL-TIME EVENTS:
- Appointment status updates
- New appointment notifications for officers
- Capacity updates for time slots
- Document upload notifications

SOCKET EVENTS:
- 'appointment_booked' - notify officer of new appointment
- 'appointment_cancelled' - notify officer of cancellation
- 'status_updated' - notify citizen of status change
- 'document_uploaded' - notify officer of new document

ROOM MANAGEMENT:
- Citizens join room for their appointments
- Officers join room for their department
- Superadmins join global room for all events

DELIVERABLES:
- src/services/socketService.js
- WebSocket event handlers
- Room management utilities
- Real-time notification integration
```

### Task 8.2: Admin Dashboard APIs
**Prompt:**
```
Create comprehensive admin dashboard APIs:

DASHBOARD ENDPOINTS:
- GET /api/admin/stats (system statistics)
- GET /api/admin/appointments/today (today's appointments)
- GET /api/admin/appointments/upcoming (next 7 days)
- GET /api/admin/reports/monthly (monthly booking reports)
- GET /api/admin/analytics/services (service popularity)
- GET /api/admin/analytics/officers (officer performance)

STATISTICS TO INCLUDE:
- Total appointments (today, this month, total)
- Total users by role
- Most popular services
- Average appointment completion time
- Feedback ratings summary
- Document upload statistics

ACCESS CONTROL:
- Superadmin: All statistics
- Officer: Department-specific stats only
- Citizen: Personal stats only

DELIVERABLES:
- src/controllers/adminController.js
- src/routes/admin.js
- Statistics calculation utilities
- Report generation functions
```

## Phase 9: Testing & Error Handling

### Task 9.1: Error Handling Middleware
**Prompt:**
```
Create comprehensive error handling system:

ERROR HANDLING FEATURES:
- Global error handler middleware
- Custom error classes for different error types
- Structured error responses
- Error logging system
- Input validation errors
- Database constraint errors

ERROR TYPES:
- ValidationError (400)
- AuthenticationError (401)
- AuthorizationError (403)
- NotFoundError (404)
- ConflictError (409)
- InternalServerError (500)

ERROR RESPONSE FORMAT:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": ["Email is required", "Phone number invalid"]
  }
}
```

DELIVERABLES:
- src/middleware/errorHandler.js
- src/utils/customErrors.js
- Error logging utilities
- Input validation error formatting
```

### Task 9.2: Unit Testing Suite
**Prompt:**
```
Create comprehensive Jest test suite for the appointment system:

TEST CATEGORIES:
- Authentication tests
- User management tests
- Appointment booking tests
- Document upload tests
- Notification tests
- QR code verification tests

TESTING APPROACH:
- Unit tests for individual functions
- Integration tests for API endpoints
- Mock external services (Supabase, Twilio)
- Test database cleanup between tests

KEY TEST SCENARIOS:
- Successful appointment booking flow
- Slot capacity management
- QR code generation and verification
- Role-based access control
- Error handling scenarios
- Edge cases (invalid data, missing resources)

DELIVERABLES:
- Complete test suite in tests/ directory
- Test setup and teardown utilities
- Mock services and data
- Test coverage report configuration
```

## Phase 10: Security & Performance

### Task 10.1: Security Implementation
**Prompt:**
```
Implement security best practices for the appointment system:

SECURITY FEATURES:
- Rate limiting for API endpoints
- Input sanitization and validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Helmet.js security headers
- Password complexity requirements
- JWT token security

RATE LIMITING:
- Authentication endpoints: 5 requests/minute
- Booking endpoints: 10 requests/minute
- General endpoints: 100 requests/minute

INPUT VALIDATION:
- Sanitize all user inputs
- Validate file uploads
- Prevent malicious file uploads
- Validate appointment data

DELIVERABLES:
- Rate limiting middleware
- Input validation utilities
- Security configuration
- File upload security
```

This comprehensive breakdown provides atomic, focused tasks that can be given to a coding agent one at a time. Each prompt includes specific requirements, business rules, and clear deliverables. Would you like me to modify any of these prompts or add additional details for specific tasks?