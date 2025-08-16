import { Router } from 'express';
import { OfficerController } from '../controllers/OfficerController';
import { authenticateToken, requireRole } from '../middlewares';
import { UserRole } from '../types/database';

const router: Router = Router();
const officerController = new OfficerController();

// Public routes - no authentication required
router.get('/search', officerController.searchOfficers);
router.get('/service/:serviceId/available', officerController.getAvailableOfficersForService);
router.get('/department/:departmentId', officerController.getOfficersByDepartment);
router.get('/:id', officerController.getOfficerById);
router.get('/', officerController.getAllOfficers);

// Officer/Admin routes - authentication required
router.get('/profile/me', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), officerController.getMyOfficerProfile);

// Admin only routes - authentication required
router.post('/', authenticateToken, requireRole(UserRole.ADMIN), officerController.createOfficer);
router.put('/:id', authenticateToken, requireRole(UserRole.ADMIN), officerController.updateOfficer);
router.delete('/:id', authenticateToken, requireRole(UserRole.ADMIN), officerController.deleteOfficer);

export default router;
