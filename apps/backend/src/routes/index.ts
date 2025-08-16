// Index file for all routes
import { Router } from 'express';
import type { Router as RouterType } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import departmentRoutes from './departmentRoutes';
import serviceRoutes from './services';
import officerRoutes from './officers';
import timeslotRoutes from './timeslots';
import appointmentRoutes from './appointments';
import feedbackRoutes from './feedbackRoutes';
import documentRoutes from './documentRoutes';

const router: RouterType = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Government Appointment Booking System' });
});

// Authentication routes
router.use('/auth', authRoutes);

// User management routes (Admin only)
router.use('/users', userRoutes);

// Department routes (Public GET, Admin CRUD)
router.use('/departments', departmentRoutes);

// Service routes (Public GET, Officer/Admin CRUD)
router.use('/services', serviceRoutes);

// Officer routes (Public GET, Admin CRUD, Officer profile)
router.use('/officers', officerRoutes);

// Timeslot routes (Public GET, Officer/Admin CRUD)
router.use('/timeslots', timeslotRoutes);

// Appointment routes (Citizens book/view their own, Officers/Admins manage all)
router.use('/appointments', appointmentRoutes);

// Feedback routes (Citizens submit, Officers/Admins view, Public rating stats)
router.use('/feedbacks', feedbackRoutes);

// Document routes (Test upload functionality)
router.use('/documents', documentRoutes);

// API routes will be added here in future phases
// Example structure:
// router.use('/notifications', notificationRoutes);

export default router;
