# OneDesk - Government Appointment Booking System

A comprehensive digital appointment booking platform designed for government departments and citizens. Built with modern technologies including Next.js, Express.js, TypeScript, and Supabase, this system streamlines the appointment booking process for government services.

## 🚀 Features

### For Citizens

- **Service Discovery**: Browse available government services by department
- **Appointment Booking**: Schedule appointments with real-time availability
- **Document Upload**: Submit required documents securely
- **QR Code Generation**: Receive unique QR codes for appointment verification
- **Status Tracking**: Monitor appointment status and receive updates
- **Feedback System**: Provide feedback after service completion

### For Officers

- **Department Dashboard**: Manage appointments within assigned departments
- **Appointment Management**: Update status, assign officers, and handle walk-ins
- **Analytics Dashboard**: View comprehensive service statistics and performance metrics
- **Document Review**: Review and approve submitted documents
- **Time Management**: Manage availability and appointment slots

### For Administrators

- **System Management**: Oversee all departments, services, and users
- **Officer Management**: Assign officers to departments and manage permissions
- **Service Configuration**: Create and manage government services
- **Analytics & Reporting**: System-wide analytics and performance insights
- **User Management**: Handle user registrations and access control

## 🏗️ System Architecture

### Frontend (Next.js 15)

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for client-side state
- **Authentication**: JWT-based authentication
- **Charts**: Recharts for analytics visualization

### Backend (Express.js)

- **Framework**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens with role-based access
- **API Documentation**: Swagger/OpenAPI
- **File Upload**: Secure document handling
- **Notifications**: Email and SMS capabilities

### Database Schema

- **Users**: Citizens, officers, and administrators
- **Departments**: Government departments and their services
- **Services**: Available government services
- **Appointments**: Booking records with status tracking
- **Timeslots**: Available appointment times
- **Documents**: Uploaded files and verification status
- **Feedback**: Service quality ratings and comments

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT, bcrypt
- **Build System**: Turborepo
- **Package Manager**: pnpm
- **Testing**: Jest
- **Linting**: ESLint, Prettier
- **Deployment**: Docker containers

## 📋 Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose (for containerized deployment)
- Supabase account and project

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd oneDesk
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Configuration**

   Create `.env` files in both frontend and backend directories:

   **Backend (.env)**

   ```env
   NODE_ENV=development
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   CORS_ORIGIN=http://localhost:3000
   ```

   **Frontend (.env.local)**

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Start development servers**

   ```bash
   pnpm dev
   ```

   This starts:
   - Frontend on `http://localhost:3000`
   - Backend on `http://localhost:3001`

### Docker Deployment

1. **Build and run with Docker Compose**

   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`
   - API Documentation: `http://localhost:3001/api-docs`

## 📁 Project Structure

```
oneDesk/
├── apps/
│   ├── frontend/           # Next.js application
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/          # Utilities and stores
│   │   └── hooks/        # Custom React hooks
│   └── backend/           # Express.js API
│       ├── src/
│       │   ├── controllers/  # API controllers
│       │   ├── routes/      # API routes
│       │   ├── models/      # Database models
│       │   ├── services/    # Business logic
│       │   ├── middlewares/ # Express middlewares
│       │   └── utils/       # Utilities
│       └── __tests__/       # Test files
├── packages/
│   ├── config-eslint/     # ESLint configurations
│   ├── config-typescript/ # TypeScript configurations
│   ├── ui/               # Shared UI components
│   └── logger/           # Logging utilities
├── docker-compose.yml    # Docker services configuration
└── README.md            # This file
```

## 🔐 Authentication & Authorization

The system implements role-based access control:

- **Citizens**: Can book appointments, upload documents, provide feedback
- **Officers**: Can manage appointments within their department
- **Administrators**: Full system access and management capabilities

## 📊 API Documentation

Interactive API documentation is available at `http://localhost:3001/api-docs` when running the backend server.

## 🧪 Testing

Run tests across all packages:

```bash
pnpm test
```

Run tests for specific packages:

```bash
pnpm test:backend
pnpm test:frontend
```

## 🔨 Building

Build all applications for production:

```bash
pnpm build
```

Build specific applications:

```bash
pnpm build:frontend
pnpm build:backend
```

## 📝 Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all applications
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm clean` - Clean build artifacts
- `pnpm type-check` - Run TypeScript type checking

## 🚢 Deployment

### Docker Deployment

Use the provided `docker-compose.yml` for containerized deployment.

### Manual Deployment

1. Build the applications: `pnpm build`
2. Set up environment variables
3. Deploy backend to your server
4. Deploy frontend to your hosting platform
5. Configure database and external services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 3001 are available
2. **Environment variables**: Double-check all required environment variables are set
3. **Database connection**: Verify Supabase credentials and connection
4. **CORS issues**: Ensure frontend URL is added to backend CORS configuration

### Support

For support and questions, please open an issue in the repository or contact the development team.
