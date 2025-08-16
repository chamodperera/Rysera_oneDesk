import { Request, Response } from 'express';
import { TimeslotRepository } from '../models/TimeslotRepository';
import { ServiceRepository } from '../models/ServiceRepository';
import { OfficerRepository } from '../models/OfficerRepository';
import { AuthenticatedRequest } from '../middlewares';
import { CreateTimeslotData } from '../types/database';

export class TimeslotController {
  private timeslotRepository: TimeslotRepository;
  private serviceRepository: ServiceRepository;
  private officerRepository: OfficerRepository;

  constructor() {
    this.timeslotRepository = new TimeslotRepository();
    this.serviceRepository = new ServiceRepository();
    this.officerRepository = new OfficerRepository();
  }

  // GET /api/timeslots - Public endpoint with pagination, filtering, and sorting
  getAllTimeslots = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        service_id = '',
        date = '',
        available_only = 'false',
        sort_by = 'slot_date',
        sort_order = 'asc'
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const serviceId = service_id ? parseInt(service_id as string, 10) : undefined;
      const availableOnly = available_only === 'true';

      // Validate sort order
      const validSortOrder = sort_order === 'desc' ? 'desc' : 'asc';
      const validSortBy = ['slot_date', 'start_time', 'end_time', 'capacity', 'slots_available', 'created_at'].includes(sort_by as string) 
        ? sort_by as string 
        : 'slot_date';

      const { timeslots, count } = await this.timeslotRepository.findAllWithPagination(
        pageNum,
        limitNum,
        serviceId,
        date as string,
        availableOnly,
        validSortBy,
        validSortOrder
      );

      const totalPages = Math.ceil(count / limitNum);

      res.json({
        success: true,
        data: {
          timeslots,
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
      console.error('Error fetching timeslots:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/timeslots/:id - Public endpoint
  getTimeslotById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const timeslotId = parseInt(id, 10);

      if (isNaN(timeslotId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid timeslot ID'
        });
        return;
      }

      const timeslot = await this.timeslotRepository.findWithDetails(timeslotId);

      if (!timeslot) {
        res.status(404).json({
          success: false,
          message: 'Timeslot not found'
        });
        return;
      }

      // Get timeslot stats
      const stats = await this.timeslotRepository.getTimeslotStats(timeslotId);

      res.json({
        success: true,
        data: {
          timeslot: {
            ...timeslot,
            stats
          }
        }
      });
    } catch (error) {
      console.error('Error fetching timeslot:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/timeslots/service/:serviceId - Public endpoint to get timeslots by service
  getTimeslotsByService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const { date } = req.query;
      const servId = parseInt(serviceId, 10);

      if (isNaN(servId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid service ID'
        });
        return;
      }

      // Verify service exists
      const service = await this.serviceRepository.findById(servId);
      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Service not found'
        });
        return;
      }

      const timeslots = await this.timeslotRepository.findByService(servId, date as string);

      res.json({
        success: true,
        data: {
          timeslots,
          service: {
            id: service.id,
            name: service.name,
            duration_minutes: service.duration_minutes
          }
        }
      });
    } catch (error) {
      console.error('Error fetching timeslots by service:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/timeslots/service/:serviceId/available - Public endpoint for available slots
  getAvailableTimeslots = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const { date } = req.query;
      const servId = parseInt(serviceId, 10);

      if (isNaN(servId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid service ID'
        });
        return;
      }

      const timeslots = await this.timeslotRepository.findAvailable(servId, date as string);

      res.json({
        success: true,
        data: {
          timeslots
        }
      });
    } catch (error) {
      console.error('Error fetching available timeslots:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // GET /api/timeslots/search - Public endpoint for searching timeslots
  searchTimeslots = async (req: Request, res: Response): Promise<void> => {
    try {
      const { from_date, to_date, service_ids, available_only = 'false' } = req.query;

      if (!from_date || !to_date) {
        res.status(400).json({
          success: false,
          message: 'From date and to date are required'
        });
        return;
      }

      const serviceIds = service_ids 
        ? (service_ids as string).split(',').map(id => parseInt(id.trim(), 10))
        : undefined;
      
      const availableOnly = available_only === 'true';

      const timeslots = await this.timeslotRepository.searchTimeslots(
        from_date as string,
        to_date as string,
        serviceIds,
        availableOnly
      );

      res.json({
        success: true,
        data: {
          timeslots,
          search_criteria: {
            from_date,
            to_date,
            service_ids: serviceIds,
            available_only: availableOnly
          }
        }
      });
    } catch (error) {
      console.error('Error searching timeslots:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // POST /api/timeslots - Officer/Admin only
  createTimeslot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { service_id, slot_date, start_time, end_time, capacity } = req.body;

      // Validate required fields
      if (!service_id || !slot_date || !start_time || !end_time || !capacity) {
        res.status(400).json({
          success: false,
          message: 'Service ID, slot date, start time, end time, and capacity are required'
        });
        return;
      }

      const serviceIdNum = parseInt(service_id, 10);
      const capacityNum = parseInt(capacity, 10);

      if (isNaN(serviceIdNum) || isNaN(capacityNum) || capacityNum <= 0) {
        res.status(400).json({
          success: false,
          message: 'Service ID and capacity must be valid positive numbers'
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

      // Validate date format and ensure it's not in the past
      const slotDate = new Date(slot_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (slotDate < today) {
        res.status(400).json({
          success: false,
          message: 'Cannot create timeslots in the past'
        });
        return;
      }

      // Validate time format and logic
      const startTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const endTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (!startTimeRegex.test(start_time) || !endTimeRegex.test(end_time)) {
        res.status(400).json({
          success: false,
          message: 'Time must be in HH:MM format'
        });
        return;
      }

      // Check if end time is after start time
      const startDateTime = new Date(`1970-01-01T${start_time}:00`);
      const endDateTime = new Date(`1970-01-01T${end_time}:00`);

      if (endDateTime <= startDateTime) {
        res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
        return;
      }

      // Check for time conflicts
      const hasConflict = await this.timeslotRepository.hasTimeConflict(
        serviceIdNum,
        slot_date,
        start_time,
        end_time
      );

      if (hasConflict) {
        res.status(409).json({
          success: false,
          message: 'Timeslot conflicts with existing timeslot for this service'
        });
        return;
      }

      const timeslotData: CreateTimeslotData = {
        service_id: serviceIdNum,
        slot_date,
        start_time,
        end_time,
        capacity: capacityNum,
        slots_available: capacityNum // Initially all slots are available
      };

      const newTimeslot = await this.timeslotRepository.create(timeslotData);

      // Get the created timeslot with details
      const timeslotWithDetails = await this.timeslotRepository.findWithDetails(newTimeslot.id);

      res.status(201).json({
        success: true,
        message: 'Timeslot created successfully',
        data: {
          timeslot: timeslotWithDetails
        }
      });
    } catch (error) {
      console.error('Error creating timeslot:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // POST /api/timeslots/bulk - Officer/Admin only for creating multiple timeslots
  createBulkTimeslots = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { timeslots } = req.body;

      if (!Array.isArray(timeslots) || timeslots.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Timeslots array is required and cannot be empty'
        });
        return;
      }

      // Validate each timeslot
      for (let i = 0; i < timeslots.length; i++) {
        const slot = timeslots[i];
        if (!slot.service_id || !slot.slot_date || !slot.start_time || !slot.end_time || !slot.capacity) {
          res.status(400).json({
            success: false,
            message: `Timeslot at index ${i} is missing required fields`
          });
          return;
        }
      }

      const createdTimeslots = await this.timeslotRepository.createBulkSlots(timeslots);

      res.status(201).json({
        success: true,
        message: `${createdTimeslots.length} timeslots created successfully`,
        data: {
          timeslots: createdTimeslots
        }
      });
    } catch (error) {
      console.error('Error creating bulk timeslots:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // PUT /api/timeslots/:id - Officer/Admin only
  updateTimeslot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const timeslotId = parseInt(id, 10);

      if (isNaN(timeslotId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid timeslot ID'
        });
        return;
      }

      const { service_id, slot_date, start_time, end_time, capacity } = req.body;

      // Check if timeslot exists
      const existingTimeslot = await this.timeslotRepository.findById(timeslotId);
      if (!existingTimeslot) {
        res.status(404).json({
          success: false,
          message: 'Timeslot not found'
        });
        return;
      }

      // Check if timeslot has appointments (prevent modification if booked)
      const hasAppointments = await this.timeslotRepository.hasAssociatedAppointments(timeslotId);
      if (hasAppointments) {
        res.status(409).json({
          success: false,
          message: 'Cannot modify timeslot with existing appointments'
        });
        return;
      }

      const updateData: any = {};

      // Validate and set service_id if provided
      if (service_id !== undefined) {
        const serviceIdNum = parseInt(service_id, 10);
        if (isNaN(serviceIdNum)) {
          res.status(400).json({
            success: false,
            message: 'Service ID must be a valid number'
          });
          return;
        }

        const service = await this.serviceRepository.findById(serviceIdNum);
        if (!service) {
          res.status(404).json({
            success: false,
            message: 'Service not found'
          });
          return;
        }

        updateData.service_id = serviceIdNum;
      }

      // Validate and set other fields
      if (slot_date !== undefined) {
        const slotDate = new Date(slot_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (slotDate < today) {
          res.status(400).json({
            success: false,
            message: 'Cannot set timeslot date in the past'
          });
          return;
        }

        updateData.slot_date = slot_date;
      }

      if (start_time !== undefined) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(start_time)) {
          res.status(400).json({
            success: false,
            message: 'Start time must be in HH:MM format'
          });
          return;
        }
        updateData.start_time = start_time;
      }

      if (end_time !== undefined) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(end_time)) {
          res.status(400).json({
            success: false,
            message: 'End time must be in HH:MM format'
          });
          return;
        }
        updateData.end_time = end_time;
      }

      if (capacity !== undefined) {
        const capacityNum = parseInt(capacity, 10);
        if (isNaN(capacityNum) || capacityNum <= 0) {
          res.status(400).json({
            success: false,
            message: 'Capacity must be a positive number'
          });
          return;
        }

        // Don't allow reducing capacity below current bookings
        const currentBookings = existingTimeslot.capacity - existingTimeslot.slots_available;
        if (capacityNum < currentBookings) {
          res.status(400).json({
            success: false,
            message: `Cannot reduce capacity below current bookings (${currentBookings})`
          });
          return;
        }

        updateData.capacity = capacityNum;
        updateData.slots_available = capacityNum - currentBookings;
      }

      // Validate time logic if both times are being updated
      const finalStartTime = updateData.start_time || existingTimeslot.start_time;
      const finalEndTime = updateData.end_time || existingTimeslot.end_time;

      const startDateTime = new Date(`1970-01-01T${finalStartTime}:00`);
      const endDateTime = new Date(`1970-01-01T${finalEndTime}:00`);

      if (endDateTime <= startDateTime) {
        res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
        return;
      }

      // Check for conflicts if time or date is changing
      if (updateData.slot_date || updateData.start_time || updateData.end_time || updateData.service_id) {
        const finalServiceId = updateData.service_id || existingTimeslot.service_id;
        const finalSlotDate = updateData.slot_date || existingTimeslot.slot_date;

        const hasConflict = await this.timeslotRepository.hasTimeConflict(
          finalServiceId,
          finalSlotDate,
          finalStartTime,
          finalEndTime,
          timeslotId
        );

        if (hasConflict) {
          res.status(409).json({
            success: false,
            message: 'Updated timeslot would conflict with existing timeslot'
          });
          return;
        }
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid fields provided for update'
        });
        return;
      }

      const updatedTimeslot = await this.timeslotRepository.update(timeslotId, updateData);

      // Get the updated timeslot with details
      const timeslotWithDetails = await this.timeslotRepository.findWithDetails(timeslotId);

      res.json({
        success: true,
        message: 'Timeslot updated successfully',
        data: {
          timeslot: timeslotWithDetails
        }
      });
    } catch (error) {
      console.error('Error updating timeslot:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // DELETE /api/timeslots/:id - Officer/Admin only
  deleteTimeslot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const timeslotId = parseInt(id, 10);

      if (isNaN(timeslotId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid timeslot ID'
        });
        return;
      }

      // Check if timeslot exists
      const existingTimeslot = await this.timeslotRepository.findById(timeslotId);
      if (!existingTimeslot) {
        res.status(404).json({
          success: false,
          message: 'Timeslot not found'
        });
        return;
      }

      // Check if timeslot has appointments
      const hasAppointments = await this.timeslotRepository.hasAssociatedAppointments(timeslotId);
      if (hasAppointments) {
        res.status(409).json({
          success: false,
          message: 'Cannot delete timeslot with associated appointments'
        });
        return;
      }

      await this.timeslotRepository.delete(timeslotId);

      res.json({
        success: true,
        message: 'Timeslot deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting timeslot:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  // PUT /api/timeslots/:id/book - Public endpoint for booking slots
  bookTimeslot = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const timeslotId = parseInt(id, 10);

      if (isNaN(timeslotId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid timeslot ID'
        });
        return;
      }

      const success = await this.timeslotRepository.bookSlot(timeslotId);

      if (success) {
        const updatedTimeslot = await this.timeslotRepository.findWithDetails(timeslotId);
        
        res.json({
          success: true,
          message: 'Timeslot booked successfully',
          data: {
            timeslot: updatedTimeslot
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to book timeslot'
        });
      }
    } catch (error) {
      console.error('Error booking timeslot:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };

  // PUT /api/timeslots/:id/release - Admin only for releasing slots
  releaseTimeslot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const timeslotId = parseInt(id, 10);

      if (isNaN(timeslotId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid timeslot ID'
        });
        return;
      }

      const success = await this.timeslotRepository.releaseSlot(timeslotId);

      if (success) {
        const updatedTimeslot = await this.timeslotRepository.findWithDetails(timeslotId);
        
        res.json({
          success: true,
          message: 'Timeslot released successfully',
          data: {
            timeslot: updatedTimeslot
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to release timeslot'
        });
      }
    } catch (error) {
      console.error('Error releasing timeslot:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  };
}
