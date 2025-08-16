# Government Appointment Booking System - Backend API

A comprehensive REST API backend for the Government Appointment Booking System built with Node.js, Express, TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** (preferred) or npm
- **Supabase Account** with a project setup
- **Git**

### Development Environment Setup

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd oneDesk/apps/backend
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   
   # Email Configuration (Twilio SendGrid)
   SENDGRID_API_KEY=your_sendgrid_api_key
   FROM_EMAIL=noreply@yourgovernment.lk
   
   # Database
   DATABASE_URL=your_supabase_database_connection_string
   ```

4. **Database Setup**
   
   Ensure your Supabase database has the required tables. The system uses:
   - `users` - User accounts and authentication
   - `departments` - Government departments
   - `services` - Services offered by departments
   - `officers` - Government officers
   - `timeslots` - Available appointment slots
   - `appointments` - Citizen appointments
   - `feedbacks` - Service feedback and ratings

5. **Start Development Server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

   The server will start on `http://localhost:3001`

## 📖 API Documentation

### Interactive Documentation
Access the complete API documentation with interactive testing capabilities:

**🌐 Swagger UI: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)**

### Raw API Specification
For programmatic access to the OpenAPI specification:

**📄 JSON Endpoint: [http://localhost:3001/api-docs.json](http://localhost:3001/api-docs.json)**

### API Overview
The API provides 58 comprehensive endpoints across 9 categories:

- 🔐 **Authentication** (8 endpoints) - User registration, login, password management
- 👥 **User Management** (6 endpoints) - Admin user CRUD operations
- 🏛️ **Departments** (5 endpoints) - Government department management
- 🛠️ **Services** (7 endpoints) - Service catalog management
- 👮 **Officers** (7 endpoints) - Officer management and assignments
- ⏰ **Timeslots** (11 endpoints) - Appointment scheduling management
- 📅 **Appointments** (10 endpoints) - Booking and appointment management
- 💬 **Feedback** (3 endpoints) - Service rating and feedback system
- ❤️ **Health** (1 endpoint) - System health monitoring

## 🔧 Development Commands

```bash
# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── docs/            # API documentation
├── middlewares/     # Express middlewares
├── models/          # Data access layer
├── routes/          # API route definitions
├── services/        # Business logic layer
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── __tests__/       # Test files
├── index.ts         # Application entry point
└── server.ts        # Express server setup
```

## 🔐 Authentication & Authorization

The API uses **JWT-based authentication** with **role-based access control**:

- **Citizens** - Can book appointments, submit feedback
- **Officers** - Can manage timeslots, view appointments
- **Admins** - Can manage departments, services, officers
- **Superadmins** - Full system access

### Getting Started with Authentication

1. **Register a new user:**
   ```bash
   POST /api/auth/register
   ```

2. **Login to get JWT token:**
   ```bash
   POST /api/auth/login
   ```

3. **Use token in requests:**
   ```bash
   Authorization: Bearer <your_jwt_token>
   ```

## 🌍 API Base URL

**Development:** `http://localhost:3001/api`

All API endpoints are prefixed with `/api`. For example:
- Health check: `GET /api/health`
- User login: `POST /api/auth/login`
- Get departments: `GET /api/departments`

## 🚦 Health Check

Verify the server is running:
```bash
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "service": "Government Appointment Booking System"
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test src/__tests__/auth.test.ts
```

### Test Categories
- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **Authentication Tests** - JWT and role-based access

## 🐛 Debugging

### Common Issues

1. **Port Already in Use**
   ```bash
   Error: listen EADDRINUSE: address already in use :::3001
   ```
   Solution: Change PORT in `.env` or kill existing process

2. **Supabase Connection Issues**
   ```bash
   Error: Invalid Supabase URL or Key
   ```
   Solution: Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`

3. **JWT Token Errors**
   ```bash
   Error: Invalid token
   ```
   Solution: Check `JWT_SECRET` configuration and token format

### Debug Mode
Set environment variable for detailed logging:
```bash
NODE_ENV=development DEBUG=* pnpm dev
```

## 📋 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | ✅ | `3001` |
| `NODE_ENV` | Environment | ✅ | `development` |
| `SUPABASE_URL` | Supabase project URL | ✅ | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | ✅ | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `JWT_SECRET` | JWT signing secret | ✅ | `your-secret-key` |
| `SENDGRID_API_KEY` | Email service key | ✅ | `SG.xxx` |
| `FROM_EMAIL` | System email address | ✅ | `system@gov.lk` |

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make changes and test thoroughly**
4. **Update API documentation if needed**
5. **Commit changes:** `git commit -m 'Add amazing feature'`
6. **Push to branch:** `git push origin feature/amazing-feature`
7. **Create Pull Request**

## 📚 Additional Resources

- **API Documentation:** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Express.js Docs:** [https://expressjs.com](https://expressjs.com)
- **TypeScript Docs:** [https://www.typescriptlang.org](https://www.typescriptlang.org)

## 📞 Support

For questions or issues:
1. Check the **API Documentation** first
2. Search existing **GitHub Issues**
3. Create a new issue with detailed information
4. Contact the development team

---

**Happy Coding! 🚀**

*Government Appointment Booking System - Making public services accessible and efficient.*
