import { Request, Response } from 'express';
import { notificationRepository } from '../models/index.js';
import { NotificationService } from '../services/NotificationService.js';
import { AuthenticatedRequest } from '../middlewares/index.js';
import { supabaseAdmin } from '../config/supabase.js';
import {
  NotificationType,
  NotificationStatus,
  NotificationMethod,
  UserRole
} from '../types/database.js';

export class NotificationController {
  /**
   * GET /api/notifications - Get all notifications (Admin/Officer only)
   */
  static async getAllNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Parse filters
      const filters: any = { limit, offset };
      
      if (req.query.user_id) {
        filters.user_id = parseInt(req.query.user_id as string);
      }
      if (req.query.type) {
        filters.type = req.query.type as NotificationType;
      }
      if (req.query.status) {
        filters.status = req.query.status as NotificationStatus;
      }
      if (req.query.method) {
        filters.method = req.query.method as NotificationMethod;
      }
      if (req.query.appointment_id) {
        filters.appointment_id = parseInt(req.query.appointment_id as string);
      }

      const { notifications, total } = await notificationRepository.findAllWithFilters(filters);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/notifications/my - Get user's own notifications (Citizens)
   */
  static async getMyNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.user!.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Parse filters
      const filters: any = { limit, offset };
      
      if (req.query.type) {
        filters.type = req.query.type as NotificationType;
      }
      if (req.query.status) {
        filters.status = req.query.status as NotificationStatus;
      }
      if (req.query.appointment_id) {
        filters.appointment_id = parseInt(req.query.appointment_id as string);
      }

      const { notifications, total } = await notificationRepository.findByUserId(userId, filters);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/notifications/:id - Get specific notification
   */
  static async getNotificationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const notificationId = parseInt(id, 10);
      const userId = parseInt(req.user!.id);
      const userRole = req.user!.role;

      if (isNaN(notificationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid notification ID'
        });
        return;
      }

      const notification = await notificationRepository.findWithDetails(notificationId);
      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      // Check permissions: citizens can only see their own notifications
      if (userRole === UserRole.CITIZEN && notification.user_id !== userId) {
        res.status(403).json({
          success: false,
          message: 'You can only view your own notifications'
        });
        return;
      }

      res.json({
        success: true,
        data: { notification }
      });
    } catch (error) {
      console.error('Error fetching notification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/notifications/send - Send manual notification (Admin only)
   */
  static async sendManualNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { user_id, subject, message, html_content, appointment_id } = req.body;

      // Validate required fields
      if (!user_id || !subject || !message) {
        res.status(400).json({
          success: false,
          message: 'user_id, subject, and message are required'
        });
        return;
      }

      const targetUserId = parseInt(user_id, 10);
      if (isNaN(targetUserId)) {
        res.status(400).json({
          success: false,
          message: 'user_id must be a valid number'
        });
        return;
      }

      // Get target user details (we need their email)
      // This assumes you have a method to get user by ID, let me check existing models
      // For now, I'll assume we need to get the user email somehow
      
      // Note: We need to get user email, but I notice there's no user repository method called yet
      // Let me create a simple query for now
      
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', targetUserId)
        .single();

      if (userError || !user) {
        res.status(404).json({
          success: false,
          message: 'Target user not found'
        });
        return;
      }

      // Send notification
      const success = await NotificationService.sendGenericNotification(
        targetUserId,
        user.email,
        subject,
        message,
        html_content,
        appointment_id ? parseInt(appointment_id, 10) : undefined
      );

      if (success) {
        res.status(201).json({
          success: true,
          message: 'Notification sent successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to send notification'
        });
      }
    } catch (error) {
      console.error('Error sending manual notification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * PUT /api/notifications/:id/resend - Resend failed notification (Admin only)
   */
  static async resendNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const notificationId = parseInt(id, 10);

      if (isNaN(notificationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid notification ID'
        });
        return;
      }

      const notification = await notificationRepository.findWithDetails(notificationId);
      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      // Only allow resending failed notifications
      if (notification.status !== NotificationStatus.FAILED) {
        res.status(400).json({
          success: false,
          message: 'Only failed notifications can be resent'
        });
        return;
      }

      // Get user email
      
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', notification.user_id)
        .single();

      if (userError || !user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Update status to queued and try to resend
      await notificationRepository.updateStatus(notificationId, NotificationStatus.QUEUED);

      // Resend the notification
      const success = await NotificationService.sendGenericNotification(
        notification.user_id,
        user.email,
        `Resend: ${notification.message}`, // Simple subject for resend
        notification.message,
        undefined, // No HTML content stored in DB
        notification.appointment_id || undefined
      );

      if (success) {
        res.json({
          success: true,
          message: 'Notification resent successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to resend notification'
        });
      }
    } catch (error) {
      console.error('Error resending notification:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/notifications/stats - Get notification statistics (Admin only)
   */
  static async getNotificationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Get total counts by status (simplified since Supabase doesn't support groupBy in select)
      const { data: allNotifications, error } = await supabaseAdmin
        .from('notifications')
        .select('status, type');

      if (error) {
        throw error;
      }

      // Count by status
      const statusCounts: Record<string, number> = {};
      const typeCounts: Record<string, number> = {};

      allNotifications?.forEach(notification => {
        statusCounts[notification.status] = (statusCounts[notification.status] || 0) + 1;
        typeCounts[notification.type] = (typeCounts[notification.type] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          by_status: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
          by_type: Object.entries(typeCounts).map(([type, count]) => ({ type, count })),
          total: allNotifications?.length || 0
        }
      });
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
