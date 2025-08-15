import { Router } from 'express';
import { AppointmentController } from '../controllers/AppointmentController';
import { authenticateToken, requireRole } from '../middlewares';
import { UserRole } from '../models';

const router: Router = Router();
const appointmentController = new AppointmentController();

// Public routes
router.get('/booking/:bookingRef', appointmentController.getAppointmentByBookingRef);

// Stats route (must be before /:id to avoid conflicts)
router.get('/stats', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), appointmentController.getAppointmentStats);

// My appointments route (must be before /:id)
router.get('/my', authenticateToken, requireRole(UserRole.CITIZEN), appointmentController.getMyAppointments);

// Authenticated routes - Citizens can access their own, Officers/Admins can access all
router.get('/', authenticateToken, appointmentController.getAllAppointments);
router.get('/:id', authenticateToken, appointmentController.getAppointmentById);

// Booking - Citizens can book for themselves, Officers/Admins can book for others
router.post('/', authenticateToken, appointmentController.createAppointment);

// Cancellation - Citizens can cancel their own, Officers/Admins can cancel any
router.delete('/:id', authenticateToken, appointmentController.cancelAppointment);

// Management routes - Officers and Admins only
router.put('/:id/status', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), appointmentController.updateAppointmentStatus);
router.put('/:id/officer', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), appointmentController.assignOfficer);

export default router;
