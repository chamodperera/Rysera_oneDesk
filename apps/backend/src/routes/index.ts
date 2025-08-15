// Index file for all routes
import { Router } from 'express';
import type { Router as RouterType } from 'express';

const router: RouterType = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Government Appointment Booking System' });
});

// API routes will be added here in future phases
// Example structure:
// router.use('/auth', authRoutes);
// router.use('/departments', departmentRoutes);
// router.use('/services', serviceRoutes);
// router.use('/officers', officerRoutes);
// router.use('/timeslots', timeslotRoutes);
// router.use('/appointments', appointmentRoutes);
// router.use('/documents', documentRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/feedback', feedbackRoutes);

export default router;
