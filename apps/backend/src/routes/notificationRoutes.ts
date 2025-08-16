import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController.js';
import { authenticateToken, requireRole } from '../middlewares/index.js';
import { UserRole } from '../types/database.js';

const router: Router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications (Admin/Officer only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [generic, appointment_reminder, appointment_confirmation, appointment_cancellation, document_status]
 *         description: Filter by notification type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [queued, sent, failed]
 *         description: Filter by notification status
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [in_app, email, sms]
 *         description: Filter by notification method
 *       - in: query
 *         name: appointment_id
 *         schema:
 *           type: integer
 *         description: Filter by appointment ID
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/', 
  authenticateToken, 
  requireRole(UserRole.OFFICER, UserRole.ADMIN), 
  NotificationController.getAllNotifications
);

/**
 * @swagger
 * /api/notifications/my:
 *   get:
 *     summary: Get user's own notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [generic, appointment_reminder, appointment_confirmation, appointment_cancellation, document_status]
 *         description: Filter by notification type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [queued, sent, failed]
 *         description: Filter by notification status
 *       - in: query
 *         name: appointment_id
 *         schema:
 *           type: integer
 *         description: Filter by appointment ID
 *     responses:
 *       200:
 *         description: User notifications retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/my', 
  authenticateToken, 
  NotificationController.getMyNotifications
);

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Get notification statistics (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     by_status:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     by_type:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     total:
 *                       type: integer
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/stats', 
  authenticateToken, 
  requireRole(UserRole.ADMIN), 
  NotificationController.getNotificationStats
);

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send manual notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - subject
 *               - message
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: Target user ID
 *               subject:
 *                 type: string
 *                 description: Email subject
 *               message:
 *                 type: string
 *                 description: Notification message
 *               html_content:
 *                 type: string
 *                 description: Optional HTML content for email
 *               appointment_id:
 *                 type: integer
 *                 description: Optional appointment ID to link notification
 *     responses:
 *       201:
 *         description: Notification sent successfully
 *       400:
 *         description: Bad request - missing required fields
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Target user not found
 *       500:
 *         description: Server error
 */
router.post('/send', 
  authenticateToken, 
  requireRole(UserRole.ADMIN), 
  NotificationController.sendManualNotification
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *       400:
 *         description: Invalid notification ID
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.get('/:id', 
  authenticateToken, 
  NotificationController.getNotificationById
);

/**
 * @swagger
 * /api/notifications/{id}/resend:
 *   put:
 *     summary: Resend failed notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The notification ID
 *     responses:
 *       200:
 *         description: Notification resent successfully
 *       400:
 *         description: Invalid notification ID or notification not failed
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.put('/:id/resend', 
  authenticateToken, 
  requireRole(UserRole.ADMIN), 
  NotificationController.resendNotification
);

export default router;
