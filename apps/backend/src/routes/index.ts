// Index file for all routes
import { Router } from 'express';
import type { Router as RouterType } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

const router: RouterType = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Government Appointment Booking System' });
});

// Authentication routes
router.use('/auth', authRoutes);

// User management routes (Admin only)
router.use('/users', userRoutes);

// API routes will be added here in future phases
// Example structure:
// router.use('/departments', departmentRoutes);
// router.use('/services', serviceRoutes);
// router.use('/officers', officerRoutes);
// router.use('/timeslots', timeslotRoutes);
// router.use('/appointments', appointmentRoutes);
// router.use('/documents', documentRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/feedback', feedbackRoutes);

export default router;
