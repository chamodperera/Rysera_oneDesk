// Authentication routes
import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, requireRole, optionalAuthenticateToken } from '../middlewares';
import { UserRole } from '../types/database';

const router: RouterType = Router();
const authController = new AuthController();

// Public routes (with optional authentication for admin user creation)
router.post('/register', optionalAuthenticateToken, authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/change-password', authenticateToken, authController.changePassword);

// Admin-only registration route for creating officers/admins
router.post('/admin/register', authenticateToken, requireRole(UserRole.ADMIN), authController.register);

export default router;
