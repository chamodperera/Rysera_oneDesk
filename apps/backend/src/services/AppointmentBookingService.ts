// Business logic service for appointment booking with race condition handling
import { 
  appointmentRepository, 
  timeslotRepository, 
  userRepository, 
  serviceRepository 
} from '../models';
import { 
  CreateAppointmentData, 
  AppointmentStatus, 
  Appointment,
  AppointmentWithDetails 
} from '../types/database';

export interface BookAppointmentRequest {
  userId: number;
  serviceId: number;
  timeslotId: number;
  officerId?: number;
}

export interface BookAppointmentResult {
  success: boolean;
  appointment?: Appointment;
  bookingReference?: string;
  error?: string;
  errorCode?: 'SLOT_UNAVAILABLE' | 'TIMESLOT_NOT_FOUND' | 'USER_NOT_FOUND' | 'SERVICE_NOT_FOUND' | 'PAST_TIMESLOT' | 'CONCURRENCY_ERROR' | 'UNKNOWN_ERROR';
}

export class AppointmentBookingService {
  
  /**
   * Books an appointment with atomic timeslot management
   * Handles race conditions and ensures data integrity
   */
  static async bookAppointment(request: BookAppointmentRequest): Promise<BookAppointmentResult> {
    const { userId, serviceId, timeslotId, officerId } = request;

    try {
      console.log(`🎯 Starting appointment booking for user ${userId}, timeslot ${timeslotId}`);

      // 1. Validate all entities exist
      const validationResult = await this.validateBookingRequest(request);
      if (!validationResult.success) {
        return validationResult;
      }

      // 2. Generate booking reference before slot booking
      const bookingReference = await appointmentRepository.generateBookingReference();
      
      // 3. Attempt to book the timeslot (with race condition handling)
      try {
        await timeslotRepository.bookSlot(timeslotId);
        console.log(`✅ Timeslot ${timeslotId} booked successfully`);
      } catch (slotError) {
        console.error(`❌ Timeslot booking failed:`, slotError);
        
        if (slotError instanceof Error) {
          if (slotError.message.includes('No slots available')) {
            return {
              success: false,
              error: 'This timeslot is fully booked. Please select another time.',
              errorCode: 'SLOT_UNAVAILABLE'
            };
          }
          
          if (slotError.message.includes('past')) {
            return {
              success: false,
              error: 'Cannot book appointments for past timeslots.',
              errorCode: 'PAST_TIMESLOT'
            };
          }
          
          if (slotError.message.includes('concurrency') || slotError.message.includes('conflict')) {
            return {
              success: false,
              error: 'This timeslot was just booked by another user. Please select another time.',
              errorCode: 'CONCURRENCY_ERROR'
            };
          }
        }
        
        return {
          success: false,
          error: 'Failed to book timeslot. Please try again.',
          errorCode: 'UNKNOWN_ERROR'
        };
      }

      // 4. Create appointment record (slot is now reserved)
      let appointment: Appointment;
      try {
        const appointmentData: CreateAppointmentData = {
          user_id: userId,
          service_id: serviceId,
          timeslot_id: timeslotId,
          officer_id: officerId,
          booking_reference: bookingReference
        };

        appointment = await appointmentRepository.create(appointmentData);
        console.log(`✅ Appointment created: ${appointment.id} with booking reference ${bookingReference}`);

      } catch (appointmentError) {
        console.error(`❌ Appointment creation failed, releasing slot:`, appointmentError);
        
        // CRITICAL: Release the slot if appointment creation fails
        try {
          await timeslotRepository.releaseSlot(timeslotId);
          console.log(`✅ Slot ${timeslotId} released due to appointment creation failure`);
        } catch (releaseError) {
          console.error(`💥 CRITICAL: Failed to release slot ${timeslotId}:`, releaseError);
          // This is a critical error - slot is booked but no appointment exists
          // In production, this should trigger an alert/notification
        }
        
        return {
          success: false,
          error: 'Failed to create appointment. Please try again.',
          errorCode: 'UNKNOWN_ERROR'
        };
      }

      // 5. Success! Return the complete result
      return {
        success: true,
        appointment,
        bookingReference
      };

    } catch (error) {
      console.error(`💥 Unexpected error during appointment booking:`, error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        errorCode: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Cancels an appointment and releases the timeslot
   */
  static async cancelAppointment(appointmentId: number, reason?: string): Promise<BookAppointmentResult> {
    try {
      console.log(`🚫 Cancelling appointment ${appointmentId}`);

      // 1. Get appointment details
      const appointment = await appointmentRepository.findById(appointmentId);
      if (!appointment) {
        return {
          success: false,
          error: 'Appointment not found.',
          errorCode: 'UNKNOWN_ERROR'
        };
      }

      // 2. Check if appointment can be cancelled
      if (appointment.status === 'completed' || appointment.status === 'cancelled') {
        return {
          success: false,
          error: `Cannot cancel appointment with status: ${appointment.status}`,
          errorCode: 'UNKNOWN_ERROR'
        };
      }

      // 3. Update appointment status to cancelled
      await appointmentRepository.update(appointmentId, { 
        status: AppointmentStatus.CANCELLED 
      });

      // 4. Release the timeslot
      try {
        await timeslotRepository.releaseSlot(appointment.timeslot_id);
        console.log(`✅ Timeslot ${appointment.timeslot_id} released after cancellation`);
      } catch (releaseError) {
        console.error(`❌ Failed to release slot after cancellation:`, releaseError);
        // Appointment is cancelled but slot isn't released - log for manual intervention
      }

      return {
        success: true,
        appointment
      };

    } catch (error) {
      console.error(`💥 Error cancelling appointment:`, error);
      return {
        success: false,
        error: 'Failed to cancel appointment. Please try again.',
        errorCode: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Validates that all entities in the booking request exist and are valid
   */
  private static async validateBookingRequest(request: BookAppointmentRequest): Promise<BookAppointmentResult> {
    const { userId, serviceId, timeslotId } = request;

    // Check user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        error: 'User not found.',
        errorCode: 'USER_NOT_FOUND'
      };
    }

    // Check service exists
    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      return {
        success: false,
        error: 'Service not found.',
        errorCode: 'SERVICE_NOT_FOUND'
      };
    }

    // Check timeslot exists and belongs to the service
    const timeslot = await timeslotRepository.findById(timeslotId);
    if (!timeslot) {
      return {
        success: false,
        error: 'Timeslot not found.',
        errorCode: 'TIMESLOT_NOT_FOUND'
      };
    }

    if (timeslot.service_id !== serviceId) {
      return {
        success: false,
        error: 'Timeslot does not belong to the selected service.',
        errorCode: 'TIMESLOT_NOT_FOUND'
      };
    }

    // Check if user already has an appointment for this timeslot
    const existingAppointments = await appointmentRepository.findByUser(userId, {
      fromDate: new Date().toISOString().split('T')[0]
    });
    
    const conflictingAppointment = existingAppointments.find(apt => 
      apt.timeslot_id === timeslotId && 
      (apt.status === 'pending' || apt.status === 'confirmed')
    );

    if (conflictingAppointment) {
      return {
        success: false,
        error: 'You already have an appointment for this timeslot.',
        errorCode: 'UNKNOWN_ERROR'
      };
    }

    return { success: true };
  }

  /**
   * Get available timeslots for a service with real-time availability
   */
  static async getAvailableSlots(serviceId: number, date?: string): Promise<any[]> {
    try {
      const availableSlots = await timeslotRepository.findAvailable(serviceId, date);
      
      // Add additional metadata
      return availableSlots.map(slot => ({
        ...slot,
        isAvailable: slot.slots_available > 0,
        availabilityPercentage: Math.round((slot.slots_available / slot.capacity) * 100)
      }));

    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  /**
   * Get booking statistics for monitoring
   */
  static async getBookingStats(serviceId?: number): Promise<{
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
    utilizationRate: number;
  }> {
    try {
      let query = {};
      if (serviceId) {
        query = { service_id: serviceId };
      }

      const timeslots = await timeslotRepository.findAll(query);
      
      const totalSlots = timeslots.reduce((sum, slot) => sum + slot.capacity, 0);
      const availableSlots = timeslots.reduce((sum, slot) => sum + slot.slots_available, 0);
      const bookedSlots = totalSlots - availableSlots;
      const utilizationRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

      return {
        totalSlots,
        bookedSlots,
        availableSlots,
        utilizationRate
      };

    } catch (error) {
      console.error('Error calculating booking stats:', error);
      return {
        totalSlots: 0,
        bookedSlots: 0,
        availableSlots: 0,
        utilizationRate: 0
      };
    }
  }
}
