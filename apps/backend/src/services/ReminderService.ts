import { appointmentRepository } from '../models/index.js';
import { NotificationService } from './NotificationService.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

// Configure dayjs for Sri Lanka timezone
dayjs.extend(utc);
dayjs.extend(timezone);

export interface ReminderStats {
  totalAppointments: number;
  citizenReminders: number;
  officerReminders: number;
  skippedDuplicates: number;
  failures: number;
  processingTime: number;
}

export class ReminderService {
  private static readonly SRI_LANKA_TIMEZONE = 'Asia/Colombo';

  /**
   * Process and send reminder emails for appointments scheduled tomorrow
   */
  static async sendTomorrowReminders(): Promise<ReminderStats> {
    const startTime = Date.now();
    const stats: ReminderStats = {
      totalAppointments: 0,
      citizenReminders: 0,
      officerReminders: 0,
      skippedDuplicates: 0,
      failures: 0,
      processingTime: 0
    };

    try {
      console.log('🔄 Starting appointment reminder process...');

      // Get tomorrow's date in Sri Lanka timezone
      const tomorrow = dayjs()
        .tz(this.SRI_LANKA_TIMEZONE)
        .add(1, 'day')
        .format('YYYY-MM-DD');

      console.log(`📅 Processing reminders for appointments on: ${tomorrow}`);

      // Find all appointments scheduled for tomorrow
      const appointments = await appointmentRepository.findAppointmentsForReminder(tomorrow);
      stats.totalAppointments = appointments.length;

      console.log(`📋 Found ${appointments.length} appointments scheduled for tomorrow`);

      if (appointments.length === 0) {
        console.log('✅ No appointments found for tomorrow. Reminder process completed.');
        stats.processingTime = Date.now() - startTime;
        return stats;
      }

      // Process each appointment
      for (const appointment of appointments) {
        try {
          await this.processAppointmentReminder(appointment, stats);
        } catch (error) {
          console.error(`❌ Error processing reminder for appointment ${appointment.id}:`, error);
          stats.failures++;
        }
      }

      stats.processingTime = Date.now() - startTime;

      console.log('✅ Appointment reminder process completed');
      console.log(`📊 Stats: ${stats.citizenReminders} citizen reminders, ${stats.officerReminders} officer reminders, ${stats.skippedDuplicates} duplicates skipped, ${stats.failures} failures`);
      console.log(`⏱️ Processing time: ${stats.processingTime}ms`);

      return stats;

    } catch (error) {
      console.error('💥 Fatal error in reminder process:', error);
      stats.processingTime = Date.now() - startTime;
      throw error;
    }
  }

  /**
   * Process reminder for a single appointment
   */
  private static async processAppointmentReminder(appointment: any, stats: ReminderStats): Promise<void> {
    console.log(`📝 Processing appointment ${appointment.id} (Booking: ${appointment.booking_reference})`);

    // Check if reminder has already been sent
    const reminderSent = await appointmentRepository.hasReminderBeenSent(appointment.id);
    if (reminderSent) {
      console.log(`⏭️ Reminder already sent for appointment ${appointment.id}, skipping`);
      stats.skippedDuplicates++;
      return;
    }

    // Prepare appointment details for notification
    const appointmentDetails = {
      appointmentId: appointment.id,
      bookingReference: appointment.booking_reference,
      serviceName: appointment.service?.name || 'Unknown Service',
      departmentName: appointment.service?.department?.name || 'Unknown Department',
      dateTime: this.formatAppointmentDateTime(appointment.timeslot),
      officerName: appointment.officer?.user 
        ? `${appointment.officer.user.first_name} ${appointment.officer.user.last_name}`
        : 'To be assigned'
    };

    // Send reminder to citizen
    if (appointment.user) {
      try {
        console.log(`📧 Sending citizen reminder to: ${appointment.user.email}`);
        
        const citizenSuccess = await NotificationService.sendAppointmentReminder(
          appointment.user.id,
          appointment.user.email,
          `${appointment.user.first_name} ${appointment.user.last_name}`,
          appointmentDetails
        );

        if (citizenSuccess) {
          console.log(`✅ Citizen reminder sent successfully for appointment ${appointment.id}`);
          stats.citizenReminders++;
        } else {
          console.error(`❌ Failed to send citizen reminder for appointment ${appointment.id}`);
          stats.failures++;
        }
      } catch (error) {
        console.error(`💥 Error sending citizen reminder for appointment ${appointment.id}:`, error);
        stats.failures++;
      }
    }

    // Send reminder to officer (if assigned)
    if (appointment.officer?.user) {
      try {
        console.log(`📧 Sending officer reminder to: ${appointment.officer.user.email}`);
        
        const officerSuccess = await this.sendOfficerReminder(
          appointment.officer.user,
          appointment,
          appointmentDetails
        );

        if (officerSuccess) {
          console.log(`✅ Officer reminder sent successfully for appointment ${appointment.id}`);
          stats.officerReminders++;
        } else {
          console.error(`❌ Failed to send officer reminder for appointment ${appointment.id}`);
          stats.failures++;
        }
      } catch (error) {
        console.error(`💥 Error sending officer reminder for appointment ${appointment.id}:`, error);
        stats.failures++;
      }
    } else {
      console.log(`ℹ️ No officer assigned to appointment ${appointment.id}, skipping officer reminder`);
    }
  }

  /**
   * Send reminder to officer with officer-specific content
   */
  private static async sendOfficerReminder(
    officer: any,
    appointment: any,
    appointmentDetails: any
  ): Promise<boolean> {
    const subject = 'Appointment Reminder - Tomorrow\'s Schedule';
    const message = `You have an appointment tomorrow with ${appointment.user?.first_name} ${appointment.user?.last_name}. Booking Reference: ${appointmentDetails.bookingReference}`;
    
    const htmlContent = `
      <h2>Officer Appointment Reminder</h2>
      <p>Hello ${officer.first_name} ${officer.last_name},</p>
      <p>You have an appointment scheduled for tomorrow:</p>
      <ul>
        <li><strong>Citizen:</strong> ${appointment.user?.first_name} ${appointment.user?.last_name}</li>
        <li><strong>Email:</strong> ${appointment.user?.email}</li>
        <li><strong>Phone:</strong> ${appointment.user?.phone_number || 'Not provided'}</li>
        <li><strong>Service:</strong> ${appointmentDetails.serviceName}</li>
        <li><strong>Department:</strong> ${appointmentDetails.departmentName}</li>
        <li><strong>Date & Time:</strong> ${appointmentDetails.dateTime}</li>
        <li><strong>Booking Reference:</strong> ${appointmentDetails.bookingReference}</li>
      </ul>
      <p>Please be prepared for this appointment.</p>
      <p>Best regards,<br>Government Appointment Booking System</p>
    `;

    return NotificationService.sendGenericNotification(
      officer.id,
      officer.email,
      subject,
      message,
      htmlContent,
      appointment.id
    );
  }

  /**
   * Format appointment date and time for display
   */
  private static formatAppointmentDateTime(timeslot: any): string {
    if (!timeslot) return 'Date/Time TBD';

    try {
      const date = dayjs(timeslot.slot_date).tz(this.SRI_LANKA_TIMEZONE);
      const startTime = timeslot.start_time;
      const endTime = timeslot.end_time;

      return `${date.format('dddd, MMMM D, YYYY')} at ${startTime} - ${endTime} (Sri Lanka Time)`;
    } catch (error) {
      console.error('Error formatting appointment date/time:', error);
      return `${timeslot.slot_date} at ${timeslot.start_time} - ${timeslot.end_time}`;
    }
  }

  /**
   * Get statistics for reminder process (for monitoring)
   */
  static async getReminderStatistics(date?: string): Promise<{
    appointmentsScheduled: number;
    remindersAlreadySent: number;
    pendingReminders: number;
  }> {
    try {
      const targetDate = date || dayjs()
        .tz(this.SRI_LANKA_TIMEZONE)
        .add(1, 'day')
        .format('YYYY-MM-DD');

      const appointments = await appointmentRepository.findAppointmentsForReminder(targetDate);
      
      let remindersAlreadySent = 0;
      
      for (const appointment of appointments) {
        const sent = await appointmentRepository.hasReminderBeenSent(appointment.id);
        if (sent) remindersAlreadySent++;
      }

      return {
        appointmentsScheduled: appointments.length,
        remindersAlreadySent,
        pendingReminders: appointments.length - remindersAlreadySent
      };

    } catch (error) {
      console.error('Error getting reminder statistics:', error);
      return {
        appointmentsScheduled: 0,
        remindersAlreadySent: 0,
        pendingReminders: 0
      };
    }
  }
}
