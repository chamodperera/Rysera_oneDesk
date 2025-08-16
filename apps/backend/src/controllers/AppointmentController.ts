import { Request, Response } from 'express';
import { AppointmentRepository } from '../models/AppointmentRepository';
import { TimeslotRepository } from '../models/TimeslotRepository';
import { ServiceRepository } from '../models/ServiceRepository';
import { OfficerRepository } from '../models/OfficerRepository';
import { UserRepository } from '../models/UserRepository';
import { AuthenticatedRequest } from '../middlewares';
import { CreateAppointmentData, AppointmentStatus } from '../types/database';
import QRCode from 'qrcode';
import { SchedulerService } from '../services/SchedulerService.js';
import { ReminderService } from '../services/ReminderService.js';
import { NotificationService } from '../services/NotificationService.js';
import dayjs from 'dayjs';

export class AppointmentController {
  private appointmentRepository: AppointmentRepository;
  private timeslotRepository: TimeslotRepository;
  private serviceRepository: ServiceRepository;
  private officerRepository: OfficerRepository;
  private userRepository: UserRepository;

  constructor() {
    this.appointmentRepository = new AppointmentRepository();
    this.timeslotRepository = new TimeslotRepository();
    this.serviceRepository = new ServiceRepository();
    this.officerRepository = new OfficerRepository();
    this.userRepository = new UserRepository();
  }

  // GET /api/appointments - Get appointments with filtering (Officers/Admins see all, Citizens see their own)
  getAllAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        status,
        user_id,
        officer_id,
        service_id,
        from_date,
        to_date,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      // Prepare filters
      const filters: any = {};

      // Role-based filtering - Citizens can only see their own appointments
      if (req.user?.role === 'citizen') {
        filters.userId = parseInt(req.user.id);
      } else if (user_id) {
        // Officers/Admins can filter by user_id
        filters.userId = parseInt(user_id as string, 10);
      }

      if (status) filters.status = status as AppointmentStatus;
      if (officer_id) filters.officerId = parseInt(officer_id as string, 10);
      if (service_id) filters.serviceId = parseInt(service_id as string, 10);
      if (from_date) filters.fromDate = from_date as string;
      if (to_date) filters.toDate = to_date as string;

      // Validate sort parameters
      const validSortBy = ['created_at', 'booking_no', 'status', 'updated_at'].includes(sort_by as string) 
        ? sort_by as string 
        : 'created_at';
      const validSortOrder = sort_order === 'asc' ? 'asc' : 'desc';

      const { appointments, count } = await this.appointmentRepository.findAllWithPagination(
        pageNum,
        limitNum,
        filters,
        validSortBy,
        validSortOrder
      );

      const totalPages = Math.ceil(count / limitNum);

      res.json({
        success: true,
        data: {
          appointments,
          pagination: {
            current_page: pageNum,
            total_pages: totalPages,
            total_items: count,
            items_per_page: limitNum,
            has_next: pageNum < totalPages,
            has_prev: pageNum > 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/appointments/:id - Get specific appointment
  getAppointmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const appointmentId = parseInt(id, 10);

      if (isNaN(appointmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid appointment ID'
        });
        return;
      }

      const appointment = await this.appointmentRepository.findWithDetails(appointmentId);

      if (!appointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
        return;
      }

      // Citizens can only access their own appointments
      if (req.user?.role === 'citizen' && appointment.user_id !== parseInt(req.user.id)) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          appointment
        }
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/appointments/booking/:bookingRef - Get appointment by booking reference (public)
  getAppointmentByBookingRef = async (req: Request, res: Response): Promise<void> => {
    try {
      const { bookingRef } = req.params;

      const appointment = await this.appointmentRepository.findByBookingReference(bookingRef);

      if (!appointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
        return;
      }

      const appointmentDetails = await this.appointmentRepository.findWithDetails(appointment.id);

      res.json({
        success: true,
        data: {
          appointment: appointmentDetails
        }
      });
    } catch (error) {
      console.error('Error fetching appointment by booking reference:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // POST /api/appointments - Create new appointment (Citizens can book, Officers/Admins can book for others)
  createAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { user_id, service_id, timeslot_id, officer_id } = req.body;

      // Validate required fields
      if (!service_id || !timeslot_id) {
        res.status(400).json({
          success: false,
          message: 'Service ID and timeslot ID are required'
        });
        return;
      }

      const serviceIdNum = parseInt(service_id, 10);
      const timeslotIdNum = parseInt(timeslot_id, 10);

      if (isNaN(serviceIdNum) || isNaN(timeslotIdNum)) {
        res.status(400).json({
          success: false,
          message: 'Service ID and timeslot ID must be valid numbers'
        });
        return;
      }

      // Determine the user for the appointment
      let appointmentUserId: number;
      if (req.user?.role === 'citizen') {
        // Citizens can only book for themselves
        appointmentUserId = parseInt(req.user.id);
      } else {
        // Officers/Admins can book for others
        if (!user_id) {
          res.status(400).json({
            success: false,
            message: 'User ID is required when booking for others'
          });
          return;
        }
        appointmentUserId = parseInt(user_id, 10);
        if (isNaN(appointmentUserId)) {
          res.status(400).json({
            success: false,
            message: 'User ID must be a valid number'
          });
          return;
        }
      }

      // Verify user exists
      const user = await this.userRepository.findById(appointmentUserId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Verify service exists
      const service = await this.serviceRepository.findById(serviceIdNum);
      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Service not found'
        });
        return;
      }

      // Check if timeslot exists and is available
      const timeslot = await this.timeslotRepository.findById(timeslotIdNum);
      if (!timeslot) {
        res.status(404).json({
          success: false,
          message: 'Timeslot not found'
        });
        return;
      }

      if (timeslot.slots_available <= 0) {
        res.status(400).json({
          success: false,
          message: 'No available slots for this timeslot'
        });
        return;
      }

      // Verify timeslot belongs to the service
      if (timeslot.service_id !== serviceIdNum) {
        res.status(400).json({
          success: false,
          message: 'Timeslot does not belong to the specified service'
        });
        return;
      }

      // Check if user already has an appointment for this timeslot
      const existingAppointments = await this.appointmentRepository.findByUser(appointmentUserId, {
        status: AppointmentStatus.PENDING
      });

      const hasConflict = existingAppointments.some(apt => apt.timeslot_id === timeslotIdNum);
      if (hasConflict) {
        res.status(409).json({
          success: false,
          message: 'User already has an appointment for this timeslot'
        });
        return;
      }

      // Book the timeslot (this handles concurrency)
      const bookingSuccess = await this.timeslotRepository.bookSlot(timeslotIdNum);
      if (!bookingSuccess) {
        res.status(400).json({
          success: false,
          message: 'Failed to book timeslot - may no longer be available'
        });
        return;
      }

      try {
        // Auto-assign officer if not specified
        let assignedOfficerId: number | undefined = officer_id ? parseInt(officer_id, 10) : undefined;

        if (!assignedOfficerId) {
          // Auto-assign officer using round-robin or first available
          const availableOfficers = await this.officerRepository.findByDepartment(service.department_id);
          if (availableOfficers.length > 0) {
            // Simple round-robin: get officer with least current appointments
            let minOfficer = availableOfficers[0];
            let minCount = (await this.appointmentRepository.findByOfficer(minOfficer.id, {
              status: AppointmentStatus.PENDING
            })).length;

            for (const officer of availableOfficers.slice(1)) {
              const count = (await this.appointmentRepository.findByOfficer(officer.id, {
                status: AppointmentStatus.PENDING
              })).length;
              if (count < minCount) {
                minOfficer = officer;
                minCount = count;
              }
            }

            assignedOfficerId = minOfficer.id;
          }
        }

        // Generate booking number and reference
        const bookingNo = await this.appointmentRepository.getNextBookingNumber();
        const bookingReference = await this.appointmentRepository.generateBookingReference();

        // Create appointment first without QR code
        const appointmentData: CreateAppointmentData = {
          user_id: appointmentUserId,
          service_id: serviceIdNum,
          timeslot_id: timeslotIdNum,
          officer_id: assignedOfficerId,
          booking_reference: bookingReference,
          qr_code: '' // Will be updated after creating appointment
        };

        // Set booking number manually since it's auto-generated
        const appointment = await this.appointmentRepository.create({
          ...appointmentData,
          booking_no: bookingNo
        } as any);

        // Now generate QR code with just the appointment ID
        let qrCode = '';
        try {
          // Only use appointment ID, which is enough to retrieve all details
          qrCode = await QRCode.toDataURL(`${appointment.id}`);
          console.log('QR code generated successfully with appointment ID');
        } catch (qrError) {
          console.error('QR code generation error:', qrError);
          qrCode = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + 
            encodeURIComponent(`${appointment.id}`);
          console.log('Using fallback QR URL with appointment ID');
        }
        
        // Update the appointment with the QR code
        await this.appointmentRepository.update(appointment.id, { qr_code: qrCode });
        
        // Get appointment with details (now including the QR code)
        const appointmentWithDetails = await this.appointmentRepository.findWithDetails(appointment.id);

        // Send email confirmation
        try {
          console.log(`📧 Sending appointment confirmation email to ${user.email}`);
          
          // Prepare appointment details for email
          const emailDetails = {
            appointmentId: appointment.id,
            bookingReference: bookingReference,
            serviceName: service.name,
            departmentName: 'Government Services', // Simplified for now
            dateTime: this.formatAppointmentDateTime(appointmentWithDetails!.timeslot),
            officerName: assignedOfficerId && appointmentWithDetails!.officer?.user 
              ? `${appointmentWithDetails!.officer.user.first_name} ${appointmentWithDetails!.officer.user.last_name}`
              : 'To be assigned'
          };

          const emailSent = await NotificationService.sendAppointmentConfirmation(
            appointmentUserId,
            user.email,
            `${user.first_name} ${user.last_name}`,
            emailDetails
          );

          if (emailSent) {
            console.log('✅ Appointment confirmation email sent successfully');
          } else {
            console.log('⚠️ Failed to send appointment confirmation email');
          }
        } catch (emailError) {
          console.error('📧 Email sending error:', emailError);
          // Don't fail the appointment creation if email fails
        }

        res.status(201).json({
          success: true,
          message: 'Appointment booked successfully',
          data: {
            appointment: appointmentWithDetails,
            booking_reference: bookingReference,
            booking_number: bookingNo
          }
        });

      } catch (appointmentError) {
        // If appointment creation fails, release the booked slot
        console.error('Appointment creation failed, releasing slot:', appointmentError);
        await this.timeslotRepository.releaseSlot(timeslotIdNum);
        throw appointmentError;
      }

    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // PUT /api/appointments/:id/status - Update appointment status (Officers/Admins only)
  updateAppointmentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const appointmentId = parseInt(id, 10);

      if (isNaN(appointmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid appointment ID'
        });
        return;
      }

      if (!Object.values(AppointmentStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: pending, confirmed, in_progress, completed, cancelled'
        });
        return;
      }

      // Check if appointment exists
      const existingAppointment = await this.appointmentRepository.findById(appointmentId);
      if (!existingAppointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
        return;
      }

      // Update status
      const updatedAppointment = await this.appointmentRepository.updateStatus(appointmentId, status);

      // If cancelled, release the timeslot
      if (status === AppointmentStatus.CANCELLED) {
        await this.timeslotRepository.releaseSlot(existingAppointment.timeslot_id);
      }

      // Get updated appointment with details
      const appointmentWithDetails = await this.appointmentRepository.findWithDetails(appointmentId);

      res.json({
        success: true,
        message: 'Appointment status updated successfully',
        data: {
          appointment: appointmentWithDetails
        }
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // PUT /api/appointments/:id/officer - Assign/reassign officer (Officers/Admins only)
  assignOfficer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { officer_id } = req.body;
      const appointmentId = parseInt(id, 10);

      if (isNaN(appointmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid appointment ID'
        });
        return;
      }

      const officerId = parseInt(officer_id, 10);
      if (isNaN(officerId)) {
        res.status(400).json({
          success: false,
          message: 'Officer ID must be a valid number'
        });
        return;
      }

      // Check if appointment exists
      const existingAppointment = await this.appointmentRepository.findById(appointmentId);
      if (!existingAppointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
        return;
      }

      // Check if officer exists
      const officer = await this.officerRepository.findById(officerId);
      if (!officer) {
        res.status(404).json({
          success: false,
          message: 'Officer not found'
        });
        return;
      }

      // Assign officer
      await this.appointmentRepository.assignOfficer(appointmentId, officerId);

      // Get updated appointment with details
      const appointmentWithDetails = await this.appointmentRepository.findWithDetails(appointmentId);

      res.json({
        success: true,
        message: 'Officer assigned successfully',
        data: {
          appointment: appointmentWithDetails
        }
      });
    } catch (error) {
      console.error('Error assigning officer:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // DELETE /api/appointments/:id - Cancel appointment (Citizens can cancel their own, Officers/Admins can cancel any)
  cancelAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const appointmentId = parseInt(id, 10);

      if (isNaN(appointmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid appointment ID'
        });
        return;
      }

      // Check if appointment exists
      const existingAppointment = await this.appointmentRepository.findById(appointmentId);
      if (!existingAppointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
        return;
      }

      // Citizens can only cancel their own appointments
      if (req.user?.role === 'citizen' && existingAppointment.user_id !== parseInt(req.user.id)) {
        res.status(403).json({
          success: false,
          message: 'You can only cancel your own appointments'
        });
        return;
      }

      // Can't cancel if already completed
      if (existingAppointment.status === AppointmentStatus.COMPLETED) {
        res.status(400).json({
          success: false,
          message: 'Cannot cancel completed appointment'
        });
        return;
      }

      // Update status to cancelled
      await this.appointmentRepository.updateStatus(appointmentId, AppointmentStatus.CANCELLED);

      // Release the timeslot
      await this.timeslotRepository.releaseSlot(existingAppointment.timeslot_id);

      res.json({
        success: true,
        message: 'Appointment cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/appointments/stats - Get appointment statistics (Officers/Admins only)
  getAppointmentStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { from_date, to_date, department_id, service_id } = req.query;

      const filters: any = {};

      if (from_date) filters.fromDate = from_date as string;
      if (to_date) filters.toDate = to_date as string;
      if (department_id) filters.departmentId = parseInt(department_id as string, 10);
      if (service_id) filters.serviceId = parseInt(service_id as string, 10);

      const stats = await this.appointmentRepository.getAppointmentStats(filters);

      res.json({
        success: true,
        data: {
          stats,
          filters
        }
      });
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/appointments/my - Get current user's appointments (Citizens)
  getMyAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { status, from_date, to_date } = req.query;

      const filters: any = {};
      if (status) filters.status = status as AppointmentStatus;
      if (from_date) filters.fromDate = from_date as string;
      if (to_date) filters.toDate = to_date as string;

      const appointments = await this.appointmentRepository.findByUser(
        parseInt(req.user!.id),
        filters
      );

      res.json({
        success: true,
        data: {
          appointments
        }
      });
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/appointments/scheduler/status - Get scheduler status (Admin only)
  getSchedulerStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const status = SchedulerService.getStatus();
      const debugInfo = SchedulerService.getDebugInfo();

      res.json({
        success: true,
        data: {
          status,
          debugInfo
        }
      });
    } catch (error) {
      console.error('Error getting scheduler status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // POST /api/appointments/scheduler/trigger - Manually trigger reminder job (Admin only)
  triggerSchedulerManually = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { reason } = req.body;

      const stats = await SchedulerService.triggerManualExecution(
        reason || `Manual trigger by admin ${req.user?.email}`
      );

      res.json({
        success: true,
        message: 'Reminder job executed successfully',
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('Error triggering manual reminder job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute reminder job',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/appointments/reminders/stats - Get reminder statistics (Admin/Officer)
  getReminderStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { date } = req.query;

      const stats = await ReminderService.getReminderStatistics(date as string);

      res.json({
        success: true,
        data: {
          stats,
          date: date || 'tomorrow'
        }
      });
    } catch (error) {
      console.error('Error getting reminder statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // POST /api/appointments/scheduler/restart - Restart the scheduler (Admin only)
  restartScheduler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      SchedulerService.restart();

      const status = SchedulerService.getStatus();

      res.json({
        success: true,
        message: 'Scheduler restarted successfully',
        data: {
          status
        }
      });
    } catch (error) {
      console.error('Error restarting scheduler:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restart scheduler',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Format appointment date and time for display
   */
  private formatAppointmentDateTime(timeslot: any): string {
    if (!timeslot) return 'Date/Time TBD';

    try {
      const date = dayjs(timeslot.slot_date);
      const startTime = timeslot.start_time;
      const endTime = timeslot.end_time;

      return `${date.format('dddd, MMMM D, YYYY')} at ${startTime} - ${endTime}`;
    } catch (error) {
      console.error('Error formatting appointment date/time:', error);
      return `${timeslot.slot_date} at ${timeslot.start_time} - ${timeslot.end_time}`;
    }
  }
}
