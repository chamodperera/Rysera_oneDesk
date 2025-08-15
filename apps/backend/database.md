-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.appointments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  service_id bigint NOT NULL,
  officer_id bigint,
  timeslot_id bigint NOT NULL,
  booking_no bigint NOT NULL DEFAULT nextval('appointments_booking_no_seq'::regclass) UNIQUE,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::appointment_status,
  booking_reference character varying UNIQUE,
  qr_code text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT appointments_timeslot_id_fkey FOREIGN KEY (timeslot_id) REFERENCES public.timeslots(id),
  CONSTRAINT appointments_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id),
  CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.departments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL UNIQUE,
  description text,
  contact_email character varying,
  contact_phone character varying,
  address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.documents (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  appointment_id bigint NOT NULL,
  user_id bigint NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  document_type character varying,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'pending'::document_status,
  comments text,
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT documents_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
);
CREATE TABLE public.feedbacks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  appointment_id bigint NOT NULL,
  user_id bigint NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedbacks_pkey PRIMARY KEY (id),
  CONSTRAINT feedbacks_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  appointment_id bigint,
  type USER-DEFINED NOT NULL DEFAULT 'generic'::notification_type,
  message text NOT NULL,
  sent_at timestamp with time zone,
  method USER-DEFINED NOT NULL DEFAULT 'in_app'::notification_method,
  status USER-DEFINED NOT NULL DEFAULT 'queued'::notification_status,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.officers (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL UNIQUE,
  department_id bigint NOT NULL,
  position character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT officers_pkey PRIMARY KEY (id),
  CONSTRAINT officers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT officers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.services (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  department_id bigint NOT NULL,
  name character varying NOT NULL,
  description text,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  requirements text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.timeslots (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  service_id bigint NOT NULL,
  slot_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  slots_available integer NOT NULL CHECK (slots_available >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT timeslots_pkey PRIMARY KEY (id),
  CONSTRAINT timeslots_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone_number character varying UNIQUE,
  password_hash text,
  role USER-DEFINED NOT NULL DEFAULT 'citizen'::user_role,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);