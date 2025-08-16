import { BaseRepository } from './BaseRepository.js';
import { supabaseAdmin } from '../config/supabase.js';
import {
  Notification,
  NotificationType,
  NotificationMethod,
  NotificationStatus
} from '../types/database.js';

export interface CreateNotificationData {
  user_id: number;
  appointment_id?: number;
  type: NotificationType;
  message: string;
  method: NotificationMethod;
  status?: NotificationStatus;
}

export interface UpdateNotificationData {
  status?: NotificationStatus;
  sent_at?: string;
  error_message?: string;
}

export interface NotificationWithDetails extends Notification {
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  appointment?: {
    booking_reference: string;
    service?: {
      name: string;
    };
  };
}

export interface NotificationFilters {
  user_id?: number;
  type?: NotificationType;
  status?: NotificationStatus;
  method?: NotificationMethod;
  appointment_id?: number;
  limit?: number;
  offset?: number;
}

export class NotificationRepository extends BaseRepository<Notification, CreateNotificationData, UpdateNotificationData> {
  constructor() {
    super('notifications', true); // Use admin client for notifications
  }

  /**
   * Create a new notification record
   */
  async create(data: CreateNotificationData): Promise<Notification> {
    const { data: notification, error } = await supabaseAdmin
      .from(this.tableName)
      .insert({
        ...data,
        status: data.status || NotificationStatus.QUEUED
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return notification;
  }

  /**
   * Get notification by ID
   */
  async findById(id: number): Promise<Notification | null> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find notification: ${error.message}`);
    }

    return data;
  }

  /**
   * Get notification with user and appointment details
   */
  async findWithDetails(id: number): Promise<NotificationWithDetails | null> {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select(`
        *,
        user:users!notifications_user_id_fkey (
          first_name,
          last_name,
          email
        ),
        appointment:appointments!notifications_appointment_id_fkey (
          booking_reference,
          service:services!appointments_service_id_fkey (
            name
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to find notification with details: ${error.message}`);
    }

    return data;
  }

  /**
   * Get notifications by user ID (for citizens to see their own notifications)
   */
  async findByUserId(userId: number, filters: NotificationFilters = {}): Promise<{ notifications: NotificationWithDetails[], total: number }> {
    let query = supabaseAdmin
      .from(this.tableName)
      .select(`
        *,
        user:users!notifications_user_id_fkey (
          first_name,
          last_name,
          email
        ),
        appointment:appointments!notifications_appointment_id_fkey (
          booking_reference,
          service:services!appointments_service_id_fkey (
            name
          )
        )
      `, { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.method) {
      query = query.eq('method', filters.method);
    }
    if (filters.appointment_id) {
      query = query.eq('appointment_id', filters.appointment_id);
    }

    // Apply pagination
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by created date (newest first)
    query = query.order('id', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find notifications for user: ${error.message}`);
    }

    return {
      notifications: data || [],
      total: count || 0
    };
  }

  /**
   * Get all notifications with filtering (for admin/officer view)
   */
  async findAllWithFilters(filters: NotificationFilters = {}): Promise<{ notifications: NotificationWithDetails[], total: number }> {
    let query = supabaseAdmin
      .from(this.tableName)
      .select(`
        *,
        user:users!notifications_user_id_fkey (
          first_name,
          last_name,
          email
        ),
        appointment:appointments!notifications_appointment_id_fkey (
          booking_reference,
          service:services!appointments_service_id_fkey (
            name
          )
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.method) {
      query = query.eq('method', filters.method);
    }
    if (filters.appointment_id) {
      query = query.eq('appointment_id', filters.appointment_id);
    }

    // Apply pagination
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by created date (newest first)
    query = query.order('id', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to find notifications: ${error.message}`);
    }

    return {
      notifications: data || [],
      total: count || 0
    };
  }

  /**
   * Update notification status
   */
  async updateStatus(id: number, status: NotificationStatus, sentAt?: string): Promise<Notification> {
    const updateData: UpdateNotificationData = { status };
    if (sentAt) {
      updateData.sent_at = sentAt;
    }

    const { data: notification, error } = await supabaseAdmin
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update notification status: ${error.message}`);
    }

    return notification;
  }

  /**
   * Mark notification as sent
   */
  async markAsSent(id: number): Promise<Notification> {
    return this.updateStatus(id, NotificationStatus.SENT, new Date().toISOString());
  }

  /**
   * Mark notification as failed
   */
  async markAsFailed(id: number): Promise<Notification> {
    return this.updateStatus(id, NotificationStatus.FAILED);
  }

  /**
   * Get recent notifications count for a user (for rate limiting)
   * Simplified approach: count total notifications for user (since we don't have timestamps)
   */
  async getRecentNotificationCount(userId: number, minutes: number = 60): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.warn(`Rate limiting query failed: ${error.message}, allowing notification`);
        return 0; // If query fails, allow the notification
      }

      return count || 0;
    } catch (error) {
      console.warn(`Rate limiting error: ${error}, allowing notification`);
      return 0; // If anything fails, allow the notification
    }
  }

  /**
   * Check if user can receive more notifications (rate limiting)
   * For new users with no notifications, always allow
   */
  async canSendNotification(userId: number, maxPerHour: number = 10): Promise<boolean> {
    try {
      const recentCount = await this.getRecentNotificationCount(userId, 60);
      return recentCount < maxPerHour;
    } catch (error) {
      console.warn(`Rate limiting check failed: ${error}, allowing notification`);
      return true; // If rate limiting fails, allow the notification
    }
  }
}
