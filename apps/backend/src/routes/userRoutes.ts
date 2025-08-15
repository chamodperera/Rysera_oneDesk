// User management routes (Admin only)
import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middlewares';
import { UserRole } from '../types/database';

const router: RouterType = Router();
const userController = new UserController();

// All user management routes require admin role
router.use(authenticateToken, requireRole(UserRole.ADMIN));

// User management routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/role/:role', userController.getUsersByRole);

export default router;
