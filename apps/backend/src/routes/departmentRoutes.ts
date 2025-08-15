import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { DepartmentController } from '../controllers/DepartmentController';
import { authenticateToken, requireRole } from '../middlewares';
import { UserRole } from '../types/database';

const router: RouterType = Router();
const departmentController = new DepartmentController();

// Public routes - anyone can read departments
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Admin only routes
router.post('/', 
  authenticateToken, 
  requireRole(UserRole.ADMIN), 
  departmentController.createDepartment
);

router.put('/:id', 
  authenticateToken, 
  requireRole(UserRole.ADMIN), 
  departmentController.updateDepartment
);

router.delete('/:id', 
  authenticateToken, 
  requireRole(UserRole.ADMIN), 
  departmentController.deleteDepartment
);

export default router;
