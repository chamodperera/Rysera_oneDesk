import { EmailService, EmailOptions } from '../utils/email.js';
import { notificationRepository } from '../models/index.js';
import {
  NotificationType,
  NotificationMethod,
  NotificationStatus
} from '../types/database.js';
import QRCode from 'qrcode';

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
    try {
      const subject = 'Appointment Confirmation - Government Services';
      const message = `Your appointment has been confirmed. Booking Reference: ${appointmentDetails.bookingReference}`;
      
      // Generate QR code with appointment details
      const qrData = JSON.stringify({
        bookingReference: appointmentDetails.bookingReference,
        appointmentId: appointmentDetails.appointmentId,
        userId: userId,
        service: appointmentDetails.serviceName,
        dateTime: appointmentDetails.dateTime,
        officer: appointmentDetails.officerName,
        department: appointmentDetails.departmentName
      });

      // Generate QR code as base64 data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5aa0;">Appointment Confirmation</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your appointment has been confirmed with the following details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Booking Reference:</strong> ${appointmentDetails.bookingReference}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Service:</strong> ${appointmentDetails.serviceName}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Department:</strong> ${appointmentDetails.departmentName}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #e9ecef;"><strong>Date & Time:</strong> ${appointmentDetails.dateTime}</li>
              <li style="padding: 8px 0;"><strong>Officer:</strong> ${appointmentDetails.officerName}</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <h3 style="color: #2c5aa0; margin-bottom: 15px;">Your Appointment QR Code</h3>
            <img src="${qrCodeDataUrl}" alt="Appointment QR Code" style="border: 2px solid #2c5aa0; border-radius: 8px; padding: 10px; background: white;" />
            <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
              <strong>Please bring this QR code to your appointment.</strong><br>
              Show this to the officer for quick check-in.
            </p>
          </div>

          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #0d47a1; margin-top: 0;">Important Instructions:</h4>
            <ul style="margin: 10px 0;">
              <li>Please arrive <strong>15 minutes before</strong> your scheduled time</li>
              <li>Bring a valid ID document for verification</li>
              <li>Show this QR code to the reception/officer</li>
              <li>If you need to reschedule, contact us at least 24 hours in advance</li>
            </ul>
          </div>

          <p style="margin-top: 30px;">Best regards,<br><strong>Government Appointment Booking System</strong></p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;

      return this.sendNotification({
        userId,
        appointmentId: appointmentDetails.appointmentId,
        type: NotificationType.GENERIC, // Using GENERIC for now as APPOINTMENT_CONFIRMATION may not be in DB
        email: userEmail,
        subject,
        message,
        htmlContent
      });
    } catch (error) {
      console.error('Error generating QR code for appointment confirmation:', error);
      // Fallback to sending without QR code
      return this.sendNotification({
        userId,
        appointmentId: appointmentDetails.appointmentId,
        type: NotificationType.GENERIC,
        email: userEmail,
        subject: 'Appointment Confirmation - Government Services',
        message: `Your appointment has been confirmed. Booking Reference: ${appointmentDetails.bookingReference}`,
        htmlContent: `
          <h2>Appointment Confirmation</h2>
          <p>Hello ${userName},</p>
          <p>Your appointment has been confirmed with booking reference: <strong>${appointmentDetails.bookingReference}</strong></p>
          <p><em>Note: QR code could not be generated, but your appointment is confirmed.</em></p>
          <p>Best regards,<br>Government Appointment Booking System</p>
        `
      });
    }
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
      type: NotificationType.GENERIC, // Using GENERIC for now as APPOINTMENT_REMINDER may not be in DB
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
