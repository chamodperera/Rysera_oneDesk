import { Router } from 'express';
import { TimeslotController } from '../controllers/TimeslotController';
import { authenticateToken, requireRole } from '../middlewares';
import { UserRole } from '../models';

const router: Router = Router();
const timeslotController = new TimeslotController();

// Public routes
router.get('/', timeslotController.getAllTimeslots);
router.get('/search', timeslotController.searchTimeslots);
router.get('/service/:serviceId', timeslotController.getTimeslotsByService);
router.get('/service/:serviceId/available', timeslotController.getAvailableTimeslots);
router.get('/:id', timeslotController.getTimeslotById);

// Public booking endpoint (for appointments)
router.put('/:id/book', timeslotController.bookTimeslot);

// Protected routes - Officer and Admin only
router.post('/', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), timeslotController.createTimeslot);
router.post('/bulk', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), timeslotController.createBulkTimeslots);
router.put('/:id', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), timeslotController.updateTimeslot);
router.delete('/:id', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), timeslotController.deleteTimeslot);

// Officer and Admin routes (Officers need to manage their department's slots)
router.put('/:id/release', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), timeslotController.releaseTimeslot);

export default router;
