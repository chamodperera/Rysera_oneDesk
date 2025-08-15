import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { authenticateToken, requireRole } from '../middlewares';
import { UserRole } from '../models';

const router: Router = Router();
const serviceController = new ServiceController();

// Public routes - no authentication required
router.get('/search', serviceController.searchServices);
router.get('/department/:departmentId', serviceController.getServicesByDepartment);
router.get('/:id', serviceController.getServiceById);
router.get('/', serviceController.getAllServices);

// Officer/Admin only routes - authentication required
router.post('/', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), serviceController.createService);
router.put('/:id', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), serviceController.updateService);
router.delete('/:id', authenticateToken, requireRole(UserRole.OFFICER, UserRole.ADMIN), serviceController.deleteService);

export default router;
