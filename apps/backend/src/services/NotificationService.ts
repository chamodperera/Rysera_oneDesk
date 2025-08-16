import { EmailService, EmailOptions } from '../utils/email.js';
import { notificationRepository } from '../models/index.js';
import {
  NotificationType,
  NotificationMethod,
  NotificationStatus
} from '../types/database.js';

export interface SendNotificationOptions {
  userId: number;
  appointmentId?: number;
  type: NotificationType;
  email: string;
  subject: string;
  message: string;
  htmlContent?: string;
}

export class NotificationService {
  private static readonly RATE_LIMIT_PER_HOUR = 10;

  /**
   * Send notification with database logging
   */
  static async sendNotification(options: SendNotificationOptions): Promise<boolean> {
    try {
      // Check rate limiting
      const canSend = await notificationRepository.canSendNotification(
        options.userId,
        this.RATE_LIMIT_PER_HOUR
      );

      if (!canSend) {
        console.warn(`Rate limit exceeded for user ${options.userId}`);
        return false;
      }

      // Create notification record in database first
      const notification = await notificationRepository.create({
        user_id: options.userId,
        appointment_id: options.appointmentId,
        type: options.type,
        message: options.message,
        method: NotificationMethod.EMAIL,
        status: NotificationStatus.QUEUED
      });

      // Attempt to send email
      const emailOptions: EmailOptions = {
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.htmlContent
      };

      const emailSent = await EmailService.sendEmail(emailOptions);

      // Update notification status based on email result
      if (emailSent) {
        await notificationRepository.markAsSent(notification.id);
        console.log(`Notification ${notification.id} sent successfully to ${options.email}`);
        return true;
      } else {
        await notificationRepository.markAsFailed(notification.id);
        console.error(`Failed to send notification ${notification.id} to ${options.email}`);
        return false;
      }

    } catch (error) {
      console.error('NotificationService error:', error);
      return false;
    }
  }

  /**
   * Send appointment confirmation notification
   */
  static async sendAppointmentConfirmation(
    userId: number,
    userEmail: string,
    userName: string,
    appointmentDetails: {
      appointmentId: number;
      bookingReference: string;
      serviceName: string;
      departmentName: string;
      dateTime: string;
      officerName: string;
    }
  ): Promise<boolean> {
    const subject = 'Appointment Confirmation - Government Services';
    const message = `Your appointment has been confirmed. Booking Reference: ${appointmentDetails.bookingReference}`;
    
    const htmlContent = `
      <h2>Appointment Confirmation</h2>
      <p>Hello ${userName},</p>
      <p>Your appointment has been confirmed with the following details:</p>
      <ul>
        <li><strong>Booking Reference:</strong> ${appointmentDetails.bookingReference}</li>
        <li><strong>Service:</strong> ${appointmentDetails.serviceName}</li>
        <li><strong>Department:</strong> ${appointmentDetails.departmentName}</li>
        <li><strong>Date & Time:</strong> ${appointmentDetails.dateTime}</li>
        <li><strong>Officer:</strong> ${appointmentDetails.officerName}</li>
      </ul>
      <p>Please arrive 15 minutes before your scheduled time.</p>
      <p>Best regards,<br>Government Appointment Booking System</p>
    `;

    return this.sendNotification({
      userId,
      appointmentId: appointmentDetails.appointmentId,
      type: NotificationType.APPOINTMENT_CONFIRMATION,
      email: userEmail,
      subject,
      message,
      htmlContent
    });
  }

  /**
   * Send appointment reminder notification
   */
  static async sendAppointmentReminder(
    userId: number,
    userEmail: string,
    userName: string,
    appointmentDetails: {
      appointmentId: number;
      bookingReference: string;
      serviceName: string;
      departmentName: string;
      dateTime: string;
      officerName: string;
    }
  ): Promise<boolean> {
    const subject = 'Appointment Reminder - Tomorrow';
    const message = `Reminder: You have an appointment tomorrow. Booking Reference: ${appointmentDetails.bookingReference}`;
    
    const htmlContent = `
      <h2>Appointment Reminder</h2>
      <p>Hello ${userName},</p>
      <p>This is a reminder that you have an appointment tomorrow:</p>
      <ul>
        <li><strong>Booking Reference:</strong> ${appointmentDetails.bookingReference}</li>
        <li><strong>Service:</strong> ${appointmentDetails.serviceName}</li>
        <li><strong>Department:</strong> ${appointmentDetails.departmentName}</li>
        <li><strong>Date & Time:</strong> ${appointmentDetails.dateTime}</li>
        <li><strong>Officer:</strong> ${appointmentDetails.officerName}</li>
      </ul>
      <p>Please arrive 15 minutes before your scheduled time.</p>
      <p>Best regards,<br>Government Appointment Booking System</p>
    `;

    return this.sendNotification({
      userId,
      appointmentId: appointmentDetails.appointmentId,
      type: NotificationType.APPOINTMENT_REMINDER,
      email: userEmail,
      subject,
      message,
      htmlContent
    });
  }

  /**
   * Send appointment cancellation notification
   */
  static async sendAppointmentCancellation(
    userId: number,
    userEmail: string,
    userName: string,
    appointmentDetails: {
      appointmentId: number;
      bookingReference: string;
      serviceName: string;
      departmentName: string;
      dateTime: string;
    }
  ): Promise<boolean> {
    const subject = 'Appointment Cancelled';
    const message = `Your appointment has been cancelled. Booking Reference: ${appointmentDetails.bookingReference}`;
    
    const htmlContent = `
      <h2>Appointment Cancelled</h2>
      <p>Hello ${userName},</p>
      <p>Your appointment has been cancelled:</p>
      <ul>
        <li><strong>Booking Reference:</strong> ${appointmentDetails.bookingReference}</li>
        <li><strong>Service:</strong> ${appointmentDetails.serviceName}</li>
        <li><strong>Department:</strong> ${appointmentDetails.departmentName}</li>
        <li><strong>Date & Time:</strong> ${appointmentDetails.dateTime}</li>
      </ul>
      <p>If you need to reschedule, please book a new appointment through our system.</p>
      <p>Best regards,<br>Government Appointment Booking System</p>
    `;

    return this.sendNotification({
      userId,
      appointmentId: appointmentDetails.appointmentId,
      type: NotificationType.APPOINTMENT_CANCELLATION,
      email: userEmail,
      subject,
      message,
      htmlContent
    });
  }

  /**
   * Send document status update notification
   */
  static async sendDocumentStatusUpdate(
    userId: number,
    userEmail: string,
    userName: string,
    documentDetails: {
      appointmentId: number;
      documentName: string;
      status: string;
      comments?: string;
      bookingReference: string;
    }
  ): Promise<boolean> {
    const subject = `Document ${documentDetails.status.charAt(0).toUpperCase() + documentDetails.status.slice(1)} - ${documentDetails.documentName}`;
    const message = `Your document "${documentDetails.documentName}" has been ${documentDetails.status}`;
    
    const htmlContent = `
      <h2>Document Status Update</h2>
      <p>Hello ${userName},</p>
      <p>Your document has been reviewed:</p>
      <ul>
        <li><strong>Document:</strong> ${documentDetails.documentName}</li>
        <li><strong>Status:</strong> ${documentDetails.status.charAt(0).toUpperCase() + documentDetails.status.slice(1)}</li>
        <li><strong>Appointment Reference:</strong> ${documentDetails.bookingReference}</li>
        ${documentDetails.comments ? `<li><strong>Comments:</strong> ${documentDetails.comments}</li>` : ''}
      </ul>
      <p>Best regards,<br>Government Appointment Booking System</p>
    `;

    return this.sendNotification({
      userId,
      appointmentId: documentDetails.appointmentId,
      type: NotificationType.DOCUMENT_STATUS,
      email: userEmail,
      subject,
      message,
      htmlContent
    });
  }

  /**
   * Send password reset notification
   */
  static async sendPasswordReset(
    userId: number,
    userEmail: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const message = `Password reset requested. Use the link in the email to reset your password.`;
    
    const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>Government Appointment Booking System</p>
    `;

    return this.sendNotification({
      userId,
      type: NotificationType.GENERIC,
      email: userEmail,
      subject,
      message,
      htmlContent
    });
  }

  /**
   * Send generic notification
   */
  static async sendGenericNotification(
    userId: number,
    userEmail: string,
    subject: string,
    message: string,
    htmlContent?: string,
    appointmentId?: number
  ): Promise<boolean> {
    return this.sendNotification({
      userId,
      appointmentId,
      type: NotificationType.GENERIC,
      email: userEmail,
      subject,
      message,
      htmlContent
    });
  }
}
