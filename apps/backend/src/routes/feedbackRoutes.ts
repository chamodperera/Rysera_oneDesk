import express, { Router } from 'express';
import { FeedbackController } from '../controllers/FeedbackController.js';
import { authenticateToken, requireRole } from '../middlewares/index.js';
import { UserRole } from '../types/database.js';

const router: Router = express.Router();
const feedbackController = new FeedbackController();

// Public routes
// GET /api/feedbacks/stats/services - Get service rating statistics (public)
router.get('/stats/services', feedbackController.getServiceRatingStats);

// Authenticated routes
// POST /api/feedbacks - Submit feedback (Citizens only)
router.post('/', 
  authenticateToken, 
  requireRole(UserRole.CITIZEN, UserRole.ADMIN), // Admin can also submit feedback for testing
  feedbackController.submitFeedback
);

// GET /api/feedbacks/my - Get user's own feedbacks (Citizens only)
router.get('/my', 
  authenticateToken, 
  requireRole(UserRole.CITIZEN), 
  feedbackController.getMyFeedbacks
);

// Admin/Officer routes
// GET /api/feedbacks - Get all feedbacks with filtering (Admin/Officer only)
router.get('/', 
  authenticateToken, 
  requireRole(UserRole.OFFICER, UserRole.ADMIN), 
  feedbackController.getAllFeedbacks
);

// GET /api/feedbacks/:id - Get feedback by ID (Admin/Officer only)
router.get('/:id', 
  authenticateToken, 
  requireRole(UserRole.OFFICER, UserRole.ADMIN), 
  feedbackController.getFeedbackById
);

// DELETE /api/feedbacks/:id - Delete feedback (Admin only)
router.delete('/:id', 
  authenticateToken, 
  requireRole(UserRole.ADMIN), 
  feedbackController.deleteFeedback
);

export default router;
