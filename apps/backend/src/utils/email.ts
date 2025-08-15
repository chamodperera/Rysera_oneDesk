// Email utilities using SendGrid
import nodemailer from 'nodemailer';
import config from '../config';

// Create transporter for SendGrid
const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: config.sendgridApiKey
  }
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.fromEmail,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const subject = 'Welcome to Government Appointment Booking System';
    const html = `
      <h2>Welcome to the Government Appointment Booking System</h2>
      <p>Hello ${userName},</p>
      <p>Your account has been successfully created. You can now book appointments with government departments.</p>
      <p>Best regards,<br>Government Appointment Booking System</p>
    `;

    return this.sendEmail({ to: userEmail, subject, html });
  }

  static async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail({ to: userEmail, subject, html });
  }

  static async sendAppointmentConfirmation(
    userEmail: string, 
    userName: string, 
    appointmentDetails: any
  ): Promise<boolean> {
    const subject = 'Appointment Confirmation';
    const html = `
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

    return this.sendEmail({ to: userEmail, subject, html });
  }

  static async sendAppointmentReminder(
    userEmail: string, 
    userName: string, 
    appointmentDetails: any
  ): Promise<boolean> {
    const subject = 'Appointment Reminder - Tomorrow';
    const html = `
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

    return this.sendEmail({ to: userEmail, subject, html });
  }
}
