/**
 * Swagger/OpenAPI Document Data
 * 
 * This file contains the complete OpenAPI 3.0 specification for the
 * Government Appointment Booking System API. It includes all endpoint
 * definitions, schemas, and configuration data.
 * 
 * Separated from the configuration logic for better maintainability.
 */

export const swaggerDocument = {
  "openapi": "3.0.0",
  "info": {
    "title": "Government Appointment Booking System API",
    "description": "Complete REST API for Government Appointment Booking System with role-based access control",
    "version": "1.0.0",
    "contact": {
      "name": "API Support",
      "email": "support@government.lk"
    }
  },
  "servers": [
    {
      "url": "http://localhost:3001/api",
      "description": "Development server"
    }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT token obtained from /auth/login endpoint"
      }
    },
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "email": { "type": "string", "format": "email", "example": "user@example.com" },
          "first_name": { "type": "string", "example": "John" },
          "last_name": { "type": "string", "example": "Doe" },
          "phone_number": { "type": "string", "example": "+94771234567" },
          "role": { "type": "string", "enum": ["citizen", "officer", "admin"], "example": "citizen" },
          "created_at": { "type": "string", "format": "date-time", "example": "2025-08-16T10:30:00Z" }
        }
      },
      "Department": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "name": { "type": "string", "example": "Department of Immigration and Emigration" },
          "description": { "type": "string", "example": "Handles passport and visa services" },
          "contact_info": { "type": "string", "example": "Tel: +94112345678" },
          "created_at": { "type": "string", "format": "date-time" },
          "updated_at": { "type": "string", "format": "date-time" }
        }
      },
      "Service": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "name": { "type": "string", "example": "Passport Application" },
          "description": { "type": "string", "example": "New passport application service" },
          "department_id": { "type": "integer", "example": 1 },
          "duration_minutes": { "type": "integer", "example": 60 },
          "created_at": { "type": "string", "format": "date-time" },
          "updated_at": { "type": "string", "format": "date-time" }
        }
      },
      "Officer": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "user_id": { "type": "integer", "example": 5 },
          "department_id": { "type": "integer", "example": 1 },
          "position": { "type": "string", "example": "Senior Officer" },
          "created_at": { "type": "string", "format": "date-time" },
          "updated_at": { "type": "string", "format": "date-time" }
        }
      },
      "Timeslot": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "service_id": { "type": "integer", "example": 1 },
          "officer_id": { "type": "integer", "example": 1 },
          "date": { "type": "string", "format": "date", "example": "2025-08-20" },
          "start_time": { "type": "string", "format": "time", "example": "09:00" },
          "end_time": { "type": "string", "format": "time", "example": "10:00" },
          "max_appointments": { "type": "integer", "example": 5 },
          "current_appointments": { "type": "integer", "example": 2 },
          "is_available": { "type": "boolean", "example": true },
          "created_at": { "type": "string", "format": "date-time" }
        }
      },
      "Appointment": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "user_id": { "type": "integer", "example": 1 },
          "service_id": { "type": "integer", "example": 1 },
          "timeslot_id": { "type": "integer", "example": 1 },
          "officer_id": { "type": "integer", "example": 1, "nullable": true },
          "booking_no": { "type": "integer", "example": 1001 },
          "booking_reference": { "type": "string", "example": "GV250816ABC1" },
          "status": { "type": "string", "enum": ["pending", "confirmed", "in_progress", "completed", "cancelled"], "example": "pending" },
          "qr_code": { "type": "string", "example": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." },
          "created_at": { "type": "string", "format": "date-time" }
        }
      },
      "Feedback": {
        "type": "object",
        "properties": {
          "id": { "type": "integer", "example": 1 },
          "appointment_id": { "type": "integer", "example": 1 },
          "user_id": { "type": "integer", "example": 1 },
          "rating": { "type": "integer", "minimum": 1, "maximum": 5, "example": 4 },
          "comment": { "type": "string", "example": "Good service, quick processing" },
          "created_at": { "type": "string", "format": "date-time" }
        }
      },
      "ApiResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean", "example": true },
          "message": { "type": "string", "example": "Operation completed successfully" },
          "data": { "type": "object" }
        }
      },
      "ErrorResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean", "example": false },
          "message": { "type": "string", "example": "An error occurred" },
          "error": { "type": "string", "example": "Detailed error message" }
        }
      }
    },
    "responses": {
      "UnauthorizedError": {
        "description": "Authentication information is missing or invalid",
        "content": {
          "application/json": {
            "schema": { "$ref": "#/components/schemas/ErrorResponse" },
            "example": { "success": false, "message": "Access denied. No token provided." }
          }
        }
      },
      "ForbiddenError": {
        "description": "Access forbidden - insufficient permissions",
        "content": {
          "application/json": {
            "schema": { "$ref": "#/components/schemas/ErrorResponse" },
            "example": { "success": false, "message": "Access denied. Insufficient permissions." }
          }
        }
      },
      "NotFoundError": {
        "description": "Resource not found",
        "content": {
          "application/json": {
            "schema": { "$ref": "#/components/schemas/ErrorResponse" },
            "example": { "success": false, "message": "Resource not found" }
          }
        }
      },
      "ValidationError": {
        "description": "Validation error",
        "content": {
          "application/json": {
            "schema": { "$ref": "#/components/schemas/ErrorResponse" },
            "example": { "success": false, "message": "Validation failed" }
          }
        }
      }
    }
  },
  "tags": [
    { "name": "Health", "description": "System health check" },
    { "name": "Authentication", "description": "User authentication and authorization" },
    { "name": "User Management", "description": "User CRUD operations (Admin only)" },
    { "name": "Departments", "description": "Government department management" },
    { "name": "Services", "description": "Government service management" },
    { "name": "Officers", "description": "Officer management and assignments" },
    { "name": "Timeslots", "description": "Appointment timeslot management" },
    { "name": "Appointments", "description": "Appointment booking and management" },
    { "name": "Feedback", "description": "Feedback and rating system" }
  ],
  "paths": {
    "/health": {
      "get": {
        "tags": ["Health"],
        "summary": "Health check endpoint",
        "description": "Check if the API is running",
        "responses": {
          "200": {
            "description": "API is healthy",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": { "type": "string", "example": "ok" },
                    "service": { "type": "string", "example": "Government Appointment Booking System" }
                  }
                }
              }
            }
          }
        }
      }
    },
    
    // Authentication Endpoints
    "/auth/register": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Register a new user",
        "description": "Register a new citizen user",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "password", "first_name", "last_name", "phone_number"],
                "properties": {
                  "email": { "type": "string", "format": "email", "example": "john.doe@example.com" },
                  "password": { "type": "string", "minLength": 6, "example": "password123" },
                  "first_name": { "type": "string", "example": "John" },
                  "last_name": { "type": "string", "example": "Doe" },
                  "phone_number": { "type": "string", "example": "+94771234567" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User registered successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "User registered successfully" },
                    "data": {
                      "type": "object",
                      "properties": {
                        "token": { "type": "string", "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                        "user": { "$ref": "#/components/schemas/User" }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "409": {
            "description": "User already exists",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "success": false, "message": "User with this email already exists" }
              }
            }
          }
        }
      }
    },
    "/auth/login": {
      "post": {
        "tags": ["Authentication"],
        "summary": "User login",
        "description": "Authenticate user and receive JWT token",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "password"],
                "properties": {
                  "email": { "type": "string", "format": "email", "example": "admin@onedesk.gov.lk" },
                  "password": { "type": "string", "example": "admin123" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login successful",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Login successful" },
                    "data": {
                      "type": "object",
                      "properties": {
                        "token": { "type": "string", "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                        "user": { "$ref": "#/components/schemas/User" }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": {
            "description": "Invalid credentials",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "success": false, "message": "Invalid email or password" }
              }
            }
          }
        }
      }
    },
    "/auth/profile": {
      "get": {
        "tags": ["Authentication"],
        "summary": "Get user profile",
        "description": "Get current authenticated user's profile",
        "security": [{"bearerAuth": []}],
        "responses": {
          "200": {
            "description": "Profile retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Profile retrieved successfully" },
                    "data": { "user": { "$ref": "#/components/schemas/User" } }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" }
        }
      },
      "put": {
        "tags": ["Authentication"],
        "summary": "Update user profile",
        "description": "Update current authenticated user's profile",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "first_name": { "type": "string", "example": "John" },
                  "last_name": { "type": "string", "example": "Doe" },
                  "phone_number": { "type": "string", "example": "+94771234567" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Profile updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Profile updated successfully" },
                    "data": { "user": { "$ref": "#/components/schemas/User" } }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" }
        }
      }
    },

    // Password Reset Flow
    "/auth/forgot-password": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Request password reset",
        "description": "Send password reset email with one-time token (valid for 24 hours)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email"],
                "properties": {
                  "email": { "type": "string", "format": "email", "example": "user@example.com" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Password reset email sent successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Password reset email sent successfully" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "404": {
            "description": "User not found",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "success": false, "message": "User with this email not found" }
              }
            }
          }
        }
      }
    },
    "/auth/reset-password": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Reset password",
        "description": "Reset password using one-time token from email",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["token", "new_password"],
                "properties": {
                  "token": { "type": "string", "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                  "new_password": { "type": "string", "minLength": 6, "example": "newpassword123" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Password reset successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Password reset successfully" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": {
            "description": "Invalid or expired token",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "success": false, "message": "Invalid or expired reset token" }
              }
            }
          }
        }
      }
    },

    "/auth/change-password": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Change password",
        "description": "Change current authenticated user's password",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["current_password", "new_password"],
                "properties": {
                  "current_password": { "type": "string", "example": "oldpassword123" },
                  "new_password": { "type": "string", "minLength": 6, "example": "newpassword123" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Password changed successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Password changed successfully" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" }
        }
      }
    },

    // Admin User Creation
    "/auth/admin/register": {
      "post": {
        "tags": ["Authentication"],
        "summary": "Admin user creation",
        "description": "Create new user with specific role (Admin only)",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "password", "first_name", "last_name", "phone_number", "role"],
                "properties": {
                  "email": { "type": "string", "format": "email", "example": "officer@gov.lk" },
                  "password": { "type": "string", "minLength": 6, "example": "password123" },
                  "first_name": { "type": "string", "example": "Officer" },
                  "last_name": { "type": "string", "example": "Smith" },
                  "phone_number": { "type": "string", "example": "+94771234567" },
                  "role": { "type": "string", "enum": ["citizen", "officer", "admin"], "example": "officer" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "User created successfully" },
                    "data": { "user": { "$ref": "#/components/schemas/User" } }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "409": {
            "description": "User already exists",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "success": false, "message": "User with this email already exists" }
              }
            }
          }
        }
      }
    },

    // User Management (Admin Only)
    "/users": {
      "get": {
        "tags": ["User Management"],
        "summary": "Get all users",
        "description": "Retrieve all users (Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "description": "Page number for pagination",
            "schema": { "type": "integer", "minimum": 1, "default": 1 }
          },
          {
            "name": "limit",
            "in": "query",
            "description": "Number of users per page",
            "schema": { "type": "integer", "minimum": 1, "maximum": 100, "default": 10 }
          },
          {
            "name": "role",
            "in": "query",
            "description": "Filter by user role",
            "schema": { "type": "string", "enum": ["citizen", "officer", "admin"] }
          }
        ],
        "responses": {
          "200": {
            "description": "Users retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Users retrieved successfully" },
                    "data": {
                      "type": "object",
                      "properties": {
                        "users": {
                          "type": "array",
                          "items": { "$ref": "#/components/schemas/User" }
                        },
                        "pagination": {
                          "type": "object",
                          "properties": {
                            "page": { "type": "integer", "example": 1 },
                            "limit": { "type": "integer", "example": 10 },
                            "total": { "type": "integer", "example": 50 },
                            "pages": { "type": "integer", "example": 5 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      },
      "post": {
        "tags": ["User Management"],
        "summary": "Create user",
        "description": "Create a new user (Admin only)",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "password", "first_name", "last_name", "phone_number", "role"],
                "properties": {
                  "email": { "type": "string", "format": "email", "example": "newuser@example.com" },
                  "password": { "type": "string", "minLength": 6, "example": "password123" },
                  "first_name": { "type": "string", "example": "New" },
                  "last_name": { "type": "string", "example": "User" },
                  "phone_number": { "type": "string", "example": "+94771234567" },
                  "role": { "type": "string", "enum": ["citizen", "officer", "admin"], "example": "citizen" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "User created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "User created successfully" },
                    "data": { "user": { "$ref": "#/components/schemas/User" } }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "409": {
            "description": "User already exists",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "success": false, "message": "User with this email already exists" }
              }
            }
          }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "tags": ["User Management"],
        "summary": "Get user by ID",
        "description": "Retrieve a specific user by ID (Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "User retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "User retrieved successfully" },
                    "data": { "user": { "$ref": "#/components/schemas/User" } }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "put": {
        "tags": ["User Management"],
        "summary": "Update user",
        "description": "Update a user by ID (Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "email": { "type": "string", "format": "email", "example": "updated@example.com" },
                  "first_name": { "type": "string", "example": "Updated" },
                  "last_name": { "type": "string", "example": "User" },
                  "phone_number": { "type": "string", "example": "+94771234567" },
                  "role": { "type": "string", "enum": ["citizen", "officer", "admin"], "example": "officer" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "User updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "User updated successfully" },
                    "data": { "user": { "$ref": "#/components/schemas/User" } }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "delete": {
        "tags": ["User Management"],
        "summary": "Delete user",
        "description": "Delete a user by ID (Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "User deleted successfully",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ApiResponse" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },
    "/users/role/{role}": {
      "get": {
        "tags": ["User Management"],
        "summary": "Get users by role",
        "description": "Retrieve all users with a specific role (Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "role",
            "in": "path",
            "required": true,
            "schema": { "type": "string", "enum": ["citizen", "officer", "admin"] },
            "example": "officer"
          }
        ],
        "responses": {
          "200": {
            "description": "Users retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Users retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/User" }
                    }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      }
    },

    // Department Endpoints
    "/departments": {
      "get": {
        "tags": ["Departments"],
        "summary": "Get all departments",
        "description": "Retrieve all government departments (public access)",
        "responses": {
          "200": {
            "description": "Departments retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Departments retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Department" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Departments"],
        "summary": "Create a new department",
        "description": "Create a new government department (Admin only)",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "description"],
                "properties": {
                  "name": { "type": "string", "example": "Department of Immigration" },
                  "description": { "type": "string", "example": "Handles immigration and passport services" },
                  "contact_info": { "type": "string", "example": "Tel: +94112345678" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Department created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Department created successfully" },
                    "data": { "$ref": "#/components/schemas/Department" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      }
    },
    "/departments/{id}": {
      "get": {
        "tags": ["Departments"],
        "summary": "Get department by ID",
        "description": "Retrieve a specific department by ID (public access)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Department retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Department retrieved successfully" },
                    "data": { "$ref": "#/components/schemas/Department" }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "put": {
        "tags": ["Departments"],
        "summary": "Update department",
        "description": "Update a department (Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string", "example": "Department of Immigration" },
                  "description": { "type": "string", "example": "Handles immigration and passport services" },
                  "contact_info": { "type": "string", "example": "Tel: +94112345678" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Department updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Department updated successfully" },
                    "data": { "$ref": "#/components/schemas/Department" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "delete": {
        "tags": ["Departments"],
        "summary": "Delete department",
        "description": "Delete a department (Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Department deleted successfully",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ApiResponse" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },

    // Service Endpoints
    "/services": {
      "get": {
        "tags": ["Services"],
        "summary": "Get all services",
        "description": "Retrieve all government services (public access)",
        "responses": {
          "200": {
            "description": "Services retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Services retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Service" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Services"],
        "summary": "Create a new service",
        "description": "Create a new government service (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "description", "department_id", "duration_minutes"],
                "properties": {
                  "name": { "type": "string", "example": "Passport Renewal" },
                  "description": { "type": "string", "example": "Passport renewal service" },
                  "department_id": { "type": "integer", "example": 1 },
                  "duration_minutes": { "type": "integer", "example": 30 }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Service created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Service created successfully" },
                    "data": { "$ref": "#/components/schemas/Service" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      }
    },
    "/services/search": {
      "get": {
        "tags": ["Services"],
        "summary": "Search services",
        "description": "Search for services by name or description",
        "parameters": [
          {
            "name": "q",
            "in": "query",
            "description": "Search query",
            "schema": { "type": "string" },
            "example": "passport"
          }
        ],
        "responses": {
          "200": {
            "description": "Search results retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Search completed successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Service" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/services/department/{departmentId}": {
      "get": {
        "tags": ["Services"],
        "summary": "Get services by department",
        "description": "Retrieve all services for a specific department",
        "parameters": [
          {
            "name": "departmentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Services retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Services retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Service" }
                    }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },
    "/services/{id}": {
      "get": {
        "tags": ["Services"],
        "summary": "Get service by ID",
        "description": "Retrieve a specific service by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Service retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Service retrieved successfully" },
                    "data": { "$ref": "#/components/schemas/Service" }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "put": {
        "tags": ["Services"],
        "summary": "Update service",
        "description": "Update a service (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string", "example": "Passport Renewal" },
                  "description": { "type": "string", "example": "Passport renewal service" },
                  "department_id": { "type": "integer", "example": 1 },
                  "duration_minutes": { "type": "integer", "example": 30 }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Service updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Service updated successfully" },
                    "data": { "$ref": "#/components/schemas/Service" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "delete": {
        "tags": ["Services"],
        "summary": "Delete service",
        "description": "Delete a service (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Service deleted successfully",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ApiResponse" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },

    // Officer Endpoints
    "/officers": {
      "get": {
        "tags": ["Officers"],
        "summary": "Get all officers",
        "description": "Retrieve all officers (authenticated users only)",
        "security": [{"bearerAuth": []}],
        "responses": {
          "200": {
            "description": "Officers retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Officers retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Officer" }
                    }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" }
        }
      },
      "post": {
        "tags": ["Officers"],
        "summary": "Create a new officer",
        "description": "Create a new officer (Admin only)",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["user_id", "department_id", "position"],
                "properties": {
                  "user_id": { "type": "integer", "example": 5 },
                  "department_id": { "type": "integer", "example": 1 },
                  "position": { "type": "string", "example": "Senior Officer" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Officer created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Officer created successfully" },
                    "data": { "$ref": "#/components/schemas/Officer" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      }
    },
    "/officers/search": {
      "get": {
        "tags": ["Officers"],
        "summary": "Search officers",
        "description": "Search for officers by name or position",
        "parameters": [
          {
            "name": "q",
            "in": "query",
            "description": "Search query",
            "schema": { "type": "string" },
            "example": "senior"
          }
        ],
        "responses": {
          "200": {
            "description": "Search results retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Search completed successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Officer" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/officers/service/{serviceId}/available": {
      "get": {
        "tags": ["Officers"],
        "summary": "Get available officers for service",
        "description": "Get officers available for a specific service",
        "parameters": [
          {
            "name": "serviceId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Available officers retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Available officers retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Officer" }
                    }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },
    "/officers/department/{departmentId}": {
      "get": {
        "tags": ["Officers"],
        "summary": "Get officers by department",
        "description": "Retrieve all officers for a specific department",
        "parameters": [
          {
            "name": "departmentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Officers retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Officers retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Officer" }
                    }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },
    "/officers/{id}": {
      "get": {
        "tags": ["Officers"],
        "summary": "Get officer by ID",
        "description": "Retrieve a specific officer by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Officer retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Officer retrieved successfully" },
                    "data": { "$ref": "#/components/schemas/Officer" }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "put": {
        "tags": ["Officers"],
        "summary": "Update officer",
        "description": "Update an officer (Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "user_id": { "type": "integer", "example": 5 },
                  "department_id": { "type": "integer", "example": 1 },
                  "position": { "type": "string", "example": "Senior Officer" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Officer updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Officer updated successfully" },
                    "data": { "$ref": "#/components/schemas/Officer" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "delete": {
        "tags": ["Officers"],
        "summary": "Delete officer",
        "description": "Delete an officer (Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Officer deleted successfully",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ApiResponse" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },
    "/officers/profile/me": {
      "get": {
        "tags": ["Officers"],
        "summary": "Get own officer profile",
        "description": "Get current authenticated officer's profile (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "responses": {
          "200": {
            "description": "Officer profile retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Officer profile retrieved successfully" },
                    "data": { "$ref": "#/components/schemas/Officer" }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      }
    },

    // Timeslot Endpoints
    "/timeslots": {
      "get": {
        "tags": ["Timeslots"],
        "summary": "Get all timeslots",
        "description": "Retrieve all timeslots (public access)",
        "responses": {
          "200": {
            "description": "Timeslots retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Timeslots retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Timeslot" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Timeslots"],
        "summary": "Create a new timeslot",
        "description": "Create a new timeslot (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["service_id", "officer_id", "date", "start_time", "end_time", "max_appointments"],
                "properties": {
                  "service_id": { "type": "integer", "example": 1 },
                  "officer_id": { "type": "integer", "example": 1 },
                  "date": { "type": "string", "format": "date", "example": "2025-08-20" },
                  "start_time": { "type": "string", "format": "time", "example": "09:00" },
                  "end_time": { "type": "string", "format": "time", "example": "10:00" },
                  "max_appointments": { "type": "integer", "example": 5 }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Timeslot created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Timeslot created successfully" },
                    "data": { "$ref": "#/components/schemas/Timeslot" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      }
    },
    "/timeslots/search": {
      "get": {
        "tags": ["Timeslots"],
        "summary": "Search timeslots",
        "description": "Search for timeslots by date or service",
        "parameters": [
          {
            "name": "date",
            "in": "query",
            "description": "Filter by date",
            "schema": { "type": "string", "format": "date" },
            "example": "2025-08-20"
          },
          {
            "name": "service_id",
            "in": "query",
            "description": "Filter by service ID",
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Search results retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Search completed successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Timeslot" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/timeslots/service/{serviceId}": {
      "get": {
        "tags": ["Timeslots"],
        "summary": "Get timeslots by service",
        "description": "Retrieve all timeslots for a specific service",
        "parameters": [
          {
            "name": "serviceId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Timeslots retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Timeslots retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Timeslot" }
                    }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },
    "/timeslots/service/{serviceId}/available": {
      "get": {
        "tags": ["Timeslots"],
        "summary": "Get available timeslots",
        "description": "Get available timeslots for a specific service",
        "parameters": [
          {
            "name": "serviceId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Available timeslots retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Available timeslots retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Timeslot" }
                    }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },
    "/timeslots/{id}": {
      "get": {
        "tags": ["Timeslots"],
        "summary": "Get timeslot by ID",
        "description": "Retrieve a specific timeslot by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Timeslot retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Timeslot retrieved successfully" },
                    "data": { "$ref": "#/components/schemas/Timeslot" }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "put": {
        "tags": ["Timeslots"],
        "summary": "Update timeslot",
        "description": "Update a timeslot (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "service_id": { "type": "integer", "example": 1 },
                  "officer_id": { "type": "integer", "example": 1 },
                  "date": { "type": "string", "format": "date", "example": "2025-08-20" },
                  "start_time": { "type": "string", "format": "time", "example": "09:00" },
                  "end_time": { "type": "string", "format": "time", "example": "10:00" },
                  "max_appointments": { "type": "integer", "example": 5 }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Timeslot updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Timeslot updated successfully" },
                    "data": { "$ref": "#/components/schemas/Timeslot" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "delete": {
        "tags": ["Timeslots"],
        "summary": "Delete timeslot",
        "description": "Delete a timeslot (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Timeslot deleted successfully",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ApiResponse" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },
    "/timeslots/bulk": {
      "post": {
        "tags": ["Timeslots"],
        "summary": "Create bulk timeslots",
        "description": "Create multiple timeslots at once (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["timeslots"],
                "properties": {
                  "timeslots": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": ["service_id", "officer_id", "date", "start_time", "end_time", "max_appointments"],
                      "properties": {
                        "service_id": { "type": "integer", "example": 1 },
                        "officer_id": { "type": "integer", "example": 1 },
                        "date": { "type": "string", "format": "date", "example": "2025-08-20" },
                        "start_time": { "type": "string", "format": "time", "example": "09:00" },
                        "end_time": { "type": "string", "format": "time", "example": "10:00" },
                        "max_appointments": { "type": "integer", "example": 5 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Bulk timeslots created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Bulk timeslots created successfully" },
                    "data": {
                      "type": "object",
                      "properties": {
                        "created_count": { "type": "integer", "example": 5 },
                        "timeslots": {
                          "type": "array",
                          "items": { "$ref": "#/components/schemas/Timeslot" }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      }
    },
    "/timeslots/{id}/book": {
      "put": {
        "tags": ["Timeslots"],
        "summary": "Book timeslot",
        "description": "Book a timeslot (public endpoint for appointment creation)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["user_id"],
                "properties": {
                  "user_id": { "type": "integer", "example": 1 }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Timeslot booked successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Timeslot booked successfully" },
                    "data": { "$ref": "#/components/schemas/Timeslot" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "409": {
            "description": "Timeslot not available",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "success": false, "message": "Timeslot is not available" }
              }
            }
          }
        }
      }
    },
    "/timeslots/{id}/release": {
      "put": {
        "tags": ["Timeslots"],
        "summary": "Release timeslot",
        "description": "Release a booked timeslot (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Timeslot released successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Timeslot released successfully" },
                    "data": { "$ref": "#/components/schemas/Timeslot" }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },

    // Additional Appointment Endpoints
    "/appointments/my": {
      "get": {
        "tags": ["Appointments"],
        "summary": "Get my appointments",
        "description": "Get current user's appointments (Citizens only)",
        "security": [{"bearerAuth": []}],
        "responses": {
          "200": {
            "description": "My appointments retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Appointments retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Appointment" }
                    }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      }
    },
    "/appointments/stats": {
      "get": {
        "tags": ["Appointments"],
        "summary": "Get appointment statistics",
        "description": "Get appointment statistics (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "responses": {
          "200": {
            "description": "Statistics retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Statistics retrieved successfully" },
                    "data": {
                      "type": "object",
                      "properties": {
                        "total_appointments": { "type": "integer", "example": 150 },
                        "pending_appointments": { "type": "integer", "example": 20 },
                        "completed_appointments": { "type": "integer", "example": 100 },
                        "cancelled_appointments": { "type": "integer", "example": 30 }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      }
    },
    "/appointments/{id}": {
      "get": {
        "tags": ["Appointments"],
        "summary": "Get appointment by ID",
        "description": "Get specific appointment by ID (role-based access)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Appointment retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Appointment retrieved successfully" },
                    "data": { "$ref": "#/components/schemas/Appointment" }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      },
      "delete": {
        "tags": ["Appointments"],
        "summary": "Cancel appointment",
        "description": "Cancel an appointment (Citizens can cancel own, Officers/Admins can cancel any)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "responses": {
          "200": {
            "description": "Appointment cancelled successfully",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ApiResponse" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },
    "/appointments/{id}/status": {
      "put": {
        "tags": ["Appointments"],
        "summary": "Update appointment status",
        "description": "Update appointment status (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["status"],
                "properties": {
                  "status": {
                    "type": "string",
                    "enum": ["pending", "confirmed", "in_progress", "completed", "cancelled"],
                    "example": "confirmed"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Appointment status updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Appointment status updated successfully" },
                    "data": { "$ref": "#/components/schemas/Appointment" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },
    "/appointments/{id}/officer": {
      "put": {
        "tags": ["Appointments"],
        "summary": "Assign officer to appointment",
        "description": "Assign or reassign officer to appointment (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" },
            "example": 1
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["officer_id"],
                "properties": {
                  "officer_id": { "type": "integer", "example": 2 }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Officer assigned successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Officer assigned successfully" },
                    "data": { "$ref": "#/components/schemas/Appointment" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },

    // Appointment Endpoints
    "/appointments": {
      "get": {
        "tags": ["Appointments"],
        "summary": "Get appointments",
        "description": "Get user's appointments (Citizens see own, Officers/Admins see all)",
        "security": [{"bearerAuth": []}],
        "responses": {
          "200": {
            "description": "Appointments retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Appointments retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Appointment" }
                    }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" }
        }
      },
      "post": {
        "tags": ["Appointments"],
        "summary": "Create appointment",
        "description": "Book a new appointment",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["service_id", "timeslot_id"],
                "properties": {
                  "service_id": { "type": "integer", "example": 1 },
                  "timeslot_id": { "type": "integer", "example": 1 },
                  "user_id": { "type": "integer", "example": 1, "description": "Only for officers/admin booking for other users" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Appointment created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Appointment booked successfully" },
                    "data": { "$ref": "#/components/schemas/Appointment" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "409": {
            "description": "Timeslot not available",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "success": false, "message": "Timeslot is not available" }
              }
            }
          }
        }
      }
    },
    "/appointments/booking/{bookingRef}": {
      "get": {
        "tags": ["Appointments"],
        "summary": "Get appointment by booking reference",
        "description": "Retrieve appointment details using booking reference (public)",
        "parameters": [
          {
            "name": "bookingRef",
            "in": "path",
            "required": true,
            "schema": { "type": "string" },
            "example": "GV250816ABC1"
          }
        ],
        "responses": {
          "200": {
            "description": "Appointment retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Appointment retrieved successfully" },
                    "data": { "$ref": "#/components/schemas/Appointment" }
                  }
                }
              }
            }
          },
          "404": { "$ref": "#/components/responses/NotFoundError" }
        }
      }
    },

    // Feedback Endpoints
    "/feedbacks": {
      "get": {
        "tags": ["Feedback"],
        "summary": "Get feedbacks",
        "description": "Get feedbacks (Officer/Admin only)",
        "security": [{"bearerAuth": []}],
        "responses": {
          "200": {
            "description": "Feedbacks retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Feedbacks retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": { "$ref": "#/components/schemas/Feedback" }
                    }
                  }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      },
      "post": {
        "tags": ["Feedback"],
        "summary": "Submit feedback",
        "description": "Submit feedback for an appointment (Citizens only)",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["appointment_id", "rating"],
                "properties": {
                  "appointment_id": { "type": "integer", "example": 1 },
                  "rating": { "type": "integer", "minimum": 1, "maximum": 5, "example": 4 },
                  "comment": { "type": "string", "example": "Good service, quick processing" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Feedback submitted successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Feedback submitted successfully" },
                    "data": { "$ref": "#/components/schemas/Feedback" }
                  }
                }
              }
            }
          },
          "400": { "$ref": "#/components/responses/ValidationError" },
          "401": { "$ref": "#/components/responses/UnauthorizedError" },
          "403": { "$ref": "#/components/responses/ForbiddenError" }
        }
      }
    },
    "/feedbacks/stats/services": {
      "get": {
        "tags": ["Feedback"],
        "summary": "Get service rating statistics",
        "description": "Get rating statistics for all services (public)",
        "responses": {
          "200": {
            "description": "Service rating statistics retrieved successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "message": { "type": "string", "example": "Statistics retrieved successfully" },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "service_id": { "type": "integer", "example": 1 },
                          "service_name": { "type": "string", "example": "Passport Application" },
                          "average_rating": { "type": "number", "example": 4.2 },
                          "total_feedbacks": { "type": "integer", "example": 25 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};