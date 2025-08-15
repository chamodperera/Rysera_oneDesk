You are tasked with building the backend for a Government Appointment Booking System. read the whole document before start working

Tech stack & architecture:
- Node.js + Express (monolithic)
- Supabase (PostgreSQL + Supabase Auth + Supabase Storage)
- REST API
- JWT-based authentication
- Role-based access control (Citizen, Officer, Admin, Superadmin)
- Timezone: Sri Lanka
- Email notifications via Twilio SendGrid (synchronous)
- Migrations automatically generated + database dump
- Hard deletes (no soft deletes)
- Password hashing: bcrypt
- Max document upload size: 5MB (PDF, PNG, JPG)
- Reminders sent 24h before appointments via cron jobs
- Pagination, filtering, and sorting for list endpoints
- JSON API responses
- Auto-generated Swagger/OpenAPI documentation
- Jest for unit & integration tests
- Audit logging for critical actions

General rules:
1. If a file, function, or endpoint already exists, **evaluate it for correctness and completeness before making changes**. Modify only if necessary, preserving working functionality.
2. Maintain consistency in code style, naming conventions, and folder structure.
3. Use environment variables for all secrets, keys, and configuration values.
4. Write modular, reusable, and documented code.
5. Validate all user inputs and handle errors gracefully.
6. Always ensure role-based access restrictions are enforced.
7. Use indexes for performance optimization where needed.

Development phases & deliverables:
PHASE 1 — Project Setup
- Create project with required dependencies: express, cors, helmet, morgan, jsonwebtoken, bcrypt, @supabase/supabase-js, nodemailer, dayjs, swagger-ui-express, yamljs, node-cron, jest.
- Folder structure: src/server.ts, src/routes/, src/controllers/, src/models/, src/middlewares/.

PHASE 2 — Database & Migrations
- Implement ER diagram tables: USERS, DEPARTMENTS, SERVICES, OFFICERS, DOCUMENTS, NOTIFICATIONS, FEEDBACKS, TIMESLOTS, APPOINTMENTS.
- Add FK constraints, indexing, cascading deletes where applicable.
- Auto-generate migrations and create database dump after.

PHASE 3 — Authentication & User Management
- JWT auth, role-based middleware.
- Register, login, password reset flows.
- Superadmin CRUD for all users.

PHASE 4 — CRUD Modules (in this order):
1. Departments (public GET, admin CRUD)
2. Services (linked to departments, public GET, admin CRUD)
3. Officers (linked to users & departments, admin CRUD)
4. Timeslots (linked to services, real-time availability lock)
5. Appointments (booking, timeslot lock, officer assignment, QR code, email confirmation)
6. Documents (Supabase storage upload, validation)
7. Notifications (log + send email)
8. Feedback (citizen submit, aggregated rating per service)

PHASE 5 — Scheduling & Reminders
- Cron job to send reminder emails to Citizen & Officer 24h before appointment.

PHASE 6 — API Documentation
- Generate Swagger/OpenAPI docs with request/response schemas and auth requirements.

PHASE 7 — Testing
- Jest unit & integration tests for all major flows.

PHASE 8 — Audit Logging
- Record critical actions in `audit_logs` table with timestamp, user_id, action, and metadata JSON.

Execution:
- Complete each phase in sequence.
- After completing a phase, verify endpoints and database integration before moving to the next.
- On each change, test existing functionality to ensure no regressions.

Deliverables:
- Fully working backend meeting all requirements above.
- SQL migration files + database dump.
- Swagger/OpenAPI documentation.
- Jest test suite.
- Audit logs implementation.


## **Backend Development Task Breakdown for Coding Agent**

**Stack:** Node.js + Express + Supabase (PostgreSQL + Supabase Auth + Supabase Storage)
**Architecture:** Monolithic REST API
**Auth:** JWT + Role-Based Access Control (Citizen, Officer, Admin, Superadmin)
**Timezone:** Sri Lanka
**Notifications:** Email via Twilio SendGrid (sync)

---

### **PHASE 1 — Project Setup**

**Prompt 1:**

> Create a Node.js + Express backend project with ES modules and TypeScript support.
>
> * Add `dotenv` for environment variables.
> * Add `express`, `cors`, `morgan` (logging), and `helmet` (security).
> * Add `jsonwebtoken` for JWT handling.
> * Add `bcrypt` for password hashing.
> * Add `@supabase/supabase-js` for DB + storage operations.
> * Add `nodemailer` for email (SendGrid).
> * Add `dayjs` for date handling in Sri Lanka timezone.
> * Add `swagger-ui-express` & `yamljs` for API documentation.
>   Configure the project with `src/` folder containing `server.ts`, `routes/`, `controllers/`, `models/`, and `middlewares/`.

---

### **PHASE 2 — Database & Migrations**

**Prompt 2:**
If database.md file available, consider the database is manually created and check whether you can retrieve data from there and write data to the database according to the schema mentioned in the database.md.

> Using Supabase (PostgreSQL), create SQL migrations for the ER diagram provided: USERS, DEPARTMENTS, SERVICES, OFFICERS, DOCUMENTS, NOTIFICATIONS, FEEDBACKS, TIMESLOTS, APPOINTMENTS.
>
> * Use hard deletes (no soft delete columns).
> * Include indexing on `appointments.booking_no`, `timeslots.slot_date`, `services.department_id`, `appointments.timeslot_id`.
> * Include all FK constraints and cascade deletes where logical.
> * Create database dump after migration.
> * Ensure `created_at` and `updated_at` columns default to `NOW()` and auto-update.


---

### **PHASE 3 — Authentication & User Management**

**Prompt 3:**

> Implement authentication using Supabase and JWT:
>
> * **Register:** Citizen, Officer, Admin, Superadmin — role assigned at creation (Superadmin only via DB initially).
> * **Login:** Verify bcrypt password, return signed JWT with role.
> * **Password Reset:** Generate a one-time token (valid for 24 hours) and email via SendGrid. Endpoint to set a new password using this token.
> * **Role-Based Middleware:** Protect routes so that only the correct role can access. Superadmin has full CRUD on all entities including user creation/deletion.

---

### **PHASE 4 — CRUD Endpoints by Module**

We’ll handle them in dependency order:

#### **Prompt 4.1 — Departments Module**

> Create CRUD endpoints for `departments`.
>
> * Pagination, filtering by name, sorting.
> * Only Admin & Superadmin can create/update/delete.
> * Public can GET.

#### **Prompt 4.2 — Services Module**

> Create CRUD endpoints for `services`.
>
> * Linked to departments via `department_id`.
> * Pagination, filtering by name, sorting.
> * Only officer, Admin & Superadmin can modify. Public can GET.

#### **Prompt 4.3 — Officers Module**

> CRUD endpoints for `officers`.
>
> * Link officers to users and departments.
> * Only Admin & Superadmin can modify.
> * GET for internal system only (authenticated).

#### **Prompt 4.4 — Timeslots Module**

> CRUD endpoints for `timeslots`.
>
> * Linked to services via `service_id`.
> * Real-time availability lock on booking.
> * Admin & Superadmin manage; public read-only.

#### **Prompt 4.5 — Appointments Module**

> Implement appointment booking:
>
> * Citizen can book available timeslot.
> * Lock timeslot capacity immediately upon booking.
> * Assign officer automatically (round-robin or first available).
> * Generate booking reference + QR code.
> * Email booking confirmation via SendGrid.
> * Status flow: `Pending` → `In Progress` → `Completed` → (optional) `Cancelled`.
> * Pagination & filtering by date/status for officer/admin views.

#### **Prompt 4.6 — Documents Module**

> CRUD for documents linked to appointments.
>
> * Upload to Supabase storage.
> * Max size 5MB; restrict file types (PDF, PNG, JPG).
> * Citizens can upload only for their appointments.

#### **Prompt 4.7 — Notifications Module**

> Create table + API to log and send notifications.
>
> * Email via SendGrid.
> * Send synchronously.
> * Store message, method, status.

#### **Prompt 4.8 — Feedback Module**

> Citizens can submit feedback linked to appointment.
>
> * Ratings 1–5, optional comment.
> * Public read of aggregated rating per service.

---

### **PHASE 5 — Reminders & Scheduling**

**Prompt 5:**

> Implement a cron job to send reminder emails 24 hours before appointment.
>
> * Use `node-cron`.
> * Pull appointments scheduled exactly 24 hours from now and send to Citizen & Officer.

---

### **PHASE 6 — API Documentation**

**Prompt 6:**

> Auto-generate Swagger/OpenAPI docs for all endpoints.
>
> * Include request/response schemas.
> * Include authentication requirements per endpoint.

---

### **PHASE 7 — Testing**

**Prompt 7:**

> Implement Jest-based unit tests + integration tests for:
>
> * Authentication flows.
> * CRUD endpoints for each module.
> * Appointment booking and timeslot locking.
> * Document upload validation.
> * Email sending.

---

### **PHASE 8 — Audit Logging**

**Prompt 8:**

> Implement audit logging for critical actions (user creation, appointment booking/cancellation, document upload).
>
> * Store in a separate `audit_logs` table with timestamp, user\_id, action, and metadata JSON.

---

If you want, I can now **write all these prompts in exact, copy-paste-ready form for the coding agent**, with explicit command-like instructions and example payloads.
That would make the process plug-and-play for your dev workflow.

Do you want me to go ahead and prepare **those final ready-to-use prompts**?
