// Middleware functions for the Government Appointment Booking System
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { UserRole } from '../models';

// Extended Request interface to include user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// JWT Authentication middleware
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Optional JWT Authentication middleware (doesn't reject if no token)
export const optionalAuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // If no token provided, just continue without setting req.user
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid, continue without setting req.user
    // The controller will handle the lack of authentication
    next();
  }
};

// Role-based access control middleware
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Error handling middleware
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Request validation middleware (to be implemented)
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validation logic will be implemented in future phases
    next();
  };
};

// Rate limiting middleware (to be implemented)
export const rateLimiter = (options: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Rate limiting logic will be implemented in future phases
    next();
  };
};
