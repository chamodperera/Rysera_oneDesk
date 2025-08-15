// Index file for all routes
import { Router } from 'express';
import type { Router as RouterType } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import departmentRoutes from './departmentRoutes';
import serviceRoutes from './services';
import officerRoutes from './officers';

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

// API routes will be added here in future phases
// Example structure:
// router.use('/timeslots', timeslotRoutes);
// router.use('/appointments', appointmentRoutes);
// router.use('/documents', documentRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/feedback', feedbackRoutes);

export default router;
