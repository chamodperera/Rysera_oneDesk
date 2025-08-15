// Timeslot repository with availability management
import { BaseRepository } from './BaseRepository';
import { Timeslot, CreateTimeslotData } from '../types/database';

interface UpdateTimeslotData {
  service_id?: number;
  slot_date?: string;
  start_time?: string;
  end_time?: string;
  capacity?: number;
  slots_available?: number;
}

export class TimeslotRepository extends BaseRepository<Timeslot, CreateTimeslotData, UpdateTimeslotData> {
  constructor() {
    super('timeslots');
  }

  async findByService(serviceId: number, date?: string): Promise<Timeslot[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .eq('service_id', serviceId);
    
    if (date) {
      query = query.eq('slot_date', date);
    }
    
    const { data, error } = await query.order('slot_date').order('start_time');
    
    if (error) throw error;
    return data || [];
  }

  async findAvailable(serviceId: number, date?: string): Promise<Timeslot[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .eq('service_id', serviceId)
      .gt('slots_available', 0);
    
    if (date) {
      query = query.eq('slot_date', date);
    } else {
      // Only future dates
      query = query.gte('slot_date', new Date().toISOString().split('T')[0]);
    }
    
    const { data, error } = await query.order('slot_date').order('start_time');
    
    if (error) throw error;
    return data || [];
  }

  async findByDateRange(serviceId: number, fromDate: string, toDate: string): Promise<Timeslot[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('service_id', serviceId)
      .gte('slot_date', fromDate)
      .lte('slot_date', toDate)
      .order('slot_date')
      .order('start_time');
    
    if (error) throw error;
    return data || [];
  }

  async bookSlot(timeslotId: number): Promise<boolean> {
    // Use optimistic locking with retry mechanism for race condition handling
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // 1. Get current slot state with row-level locking
        const { data: currentSlot, error: fetchError } = await this.client
          .from(this.tableName)
          .select('slots_available, capacity, slot_date, start_time')
          .eq('id', timeslotId)
          .single();
        
        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            throw new Error('Timeslot not found');
          }
          throw fetchError;
        }

        // 2. Business rule validation
        if (!currentSlot || currentSlot.slots_available <= 0) {
          throw new Error('No slots available for this timeslot');
        }

        // 3. Check if timeslot is in the past
        const slotDateTime = new Date(`${currentSlot.slot_date}T${currentSlot.start_time}`);
        const now = new Date();
        if (slotDateTime <= now) {
          throw new Error('Cannot book slots in the past');
        }

        // 4. Atomic update with optimistic locking
        const newSlotsAvailable = currentSlot.slots_available - 1;
        const { data: updatedSlot, error: updateError, count } = await this.client
          .from(this.tableName)
          .update({ 
            slots_available: newSlotsAvailable,
            updated_at: new Date().toISOString()
          })
          .eq('id', timeslotId)
          .eq('slots_available', currentSlot.slots_available) // Critical: Only update if slots_available hasn't changed
          .select()
          .single();
        
        if (updateError) {
          throw updateError;
        }

        // 5. Verify the update was successful (row was actually updated)
        if (!updatedSlot) {
          // This means another transaction modified the row between our read and write
          retryCount++;
          console.warn(`Slot booking conflict detected (attempt ${retryCount}/${maxRetries}), retrying...`);
          
          if (retryCount >= maxRetries) {
            throw new Error('Slot booking failed due to high concurrency. Please try again.');
          }
          
          // Short delay before retry to reduce contention
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
          continue;
        }

        console.log(`✅ Slot booked successfully: ${timeslotId}, new available: ${newSlotsAvailable}`);
        return true;

      } catch (error) {
        if (retryCount >= maxRetries - 1) {
          throw error;
        }
        
        // Only retry on concurrency-related errors
        if (error instanceof Error && 
            (error.message.includes('conflict') || 
             error.message.includes('No rows updated') ||
             error.message.includes('concurrent'))) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
          continue;
        }
        
        throw error;
      }
    }

    throw new Error('Maximum retry attempts exceeded');
  }

  async releaseSlot(timeslotId: number): Promise<boolean> {
    // Release a slot when appointment is cancelled (with validation)
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const { data: currentSlot, error: fetchError } = await this.client
          .from(this.tableName)
          .select('capacity, slots_available')
          .eq('id', timeslotId)
          .single();
        
        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            throw new Error('Timeslot not found');
          }
          throw fetchError;
        }
        
        if (!currentSlot) {
          throw new Error('Timeslot not found');
        }

        // Business rule: Can't have more available slots than capacity
        if (currentSlot.slots_available >= currentSlot.capacity) {
          throw new Error('Cannot release slot - already at full capacity');
        }
        
        // Atomic update with optimistic locking
        const newSlotsAvailable = currentSlot.slots_available + 1;
        const { data: updatedSlot, error: updateError } = await this.client
          .from(this.tableName)
          .update({ 
            slots_available: newSlotsAvailable,
            updated_at: new Date().toISOString()
          })
          .eq('id', timeslotId)
          .eq('slots_available', currentSlot.slots_available) // Optimistic locking
          .select()
          .single();
        
        if (updateError) {
          throw updateError;
        }

        if (!updatedSlot) {
          // Concurrency conflict, retry
          retryCount++;
          if (retryCount >= maxRetries) {
            throw new Error('Slot release failed due to high concurrency. Please try again.');
          }
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
          continue;
        }

        console.log(`✅ Slot released successfully: ${timeslotId}, new available: ${newSlotsAvailable}`);
        return true;

      } catch (error) {
        if (retryCount >= maxRetries - 1) {
          throw error;
        }
        
        if (error instanceof Error && 
            (error.message.includes('conflict') || 
             error.message.includes('No rows updated') ||
             error.message.includes('concurrent'))) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
          continue;
        }
        
        throw error;
      }
    }

    throw new Error('Maximum retry attempts exceeded');
  }

  async isSlotAvailable(timeslotId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('slots_available')
      .eq('id', timeslotId)
      .single();
    
    if (error) throw error;
    return data ? data.slots_available > 0 : false;
  }

  async getSlotDetails(timeslotId: number): Promise<Timeslot & { 
    service: { name: string; duration_minutes: number };
    department: { name: string };
  } | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        service:services(
          name,
          duration_minutes,
          department:departments(name)
        )
      `)
      .eq('id', timeslotId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createBulkSlots(slots: CreateTimeslotData[]): Promise<Timeslot[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(slots)
      .select();
    
    if (error) throw error;
    return data || [];
  }

  async deleteByService(serviceId: number, fromDate?: string): Promise<boolean> {
    let query = this.client
      .from(this.tableName)
      .delete()
      .eq('service_id', serviceId);
    
    if (fromDate) {
      query = query.gte('slot_date', fromDate);
    }
    
    const { error } = await query;
    
    if (error) throw error;
    return true;
  }

  // Get timeslots with service and department details
  async findWithDetails(id: number): Promise<any> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        service:services(
          name,
          description,
          duration_minutes,
          department:departments(
            name,
            description
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // Get all timeslots with pagination, filtering, and sorting
  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
    serviceId?: number,
    date?: string,
    availableOnly: boolean = false,
    sortBy: string = 'slot_date',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<{ timeslots: any[]; count: number }> {
    const offset = (page - 1) * limit;

    let queryBuilder = this.client
      .from(this.tableName)
      .select(`
        *,
        service:services(
          name,
          description,
          department:departments(
            name,
            description
          )
        )
      `, { count: 'exact' });

    // Apply filters
    if (serviceId) {
      queryBuilder = queryBuilder.eq('service_id', serviceId);
    }

    if (date) {
      queryBuilder = queryBuilder.eq('slot_date', date);
    }

    if (availableOnly) {
      queryBuilder = queryBuilder.gt('slots_available', 0);
      queryBuilder = queryBuilder.gte('slot_date', new Date().toISOString().split('T')[0]);
    }

    // Apply sorting and pagination
    const validSortBy = ['slot_date', 'start_time', 'end_time', 'capacity', 'slots_available', 'created_at'].includes(sortBy) 
      ? sortBy 
      : 'slot_date';
    
    const { data, error, count } = await queryBuilder
      .order(validSortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      timeslots: data || [],
      count: count || 0
    };
  }

  // Check if timeslot has associated appointments
  async hasAssociatedAppointments(timeslotId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from('appointments')
      .select('id')
      .eq('timeslot_id', timeslotId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // Get timeslot statistics
  async getTimeslotStats(timeslotId: number): Promise<{
    totalCapacity: number;
    bookedSlots: number;
    availableSlots: number;
    utilizationRate: number;
  }> {
    const timeslot = await this.findById(timeslotId);
    if (!timeslot) {
      throw new Error('Timeslot not found');
    }

    const bookedSlots = timeslot.capacity - timeslot.slots_available;
    const utilizationRate = timeslot.capacity > 0 ? (bookedSlots / timeslot.capacity) * 100 : 0;

    return {
      totalCapacity: timeslot.capacity,
      bookedSlots,
      availableSlots: timeslot.slots_available,
      utilizationRate: Math.round(utilizationRate * 100) / 100
    };
  }

  // Find timeslots by officer (if officer_id field exists)
  async findByOfficer(officerId: number, date?: string): Promise<any[]> {
    let queryBuilder = this.client
      .from(this.tableName)
      .select(`
        *,
        service:services(
          name,
          description,
          department:departments(
            name,
            description
          )
        )
      `)
      .eq('officer_id', officerId);

    if (date) {
      queryBuilder = queryBuilder.eq('slot_date', date);
    }

    const { data, error } = await queryBuilder
      .order('slot_date')
      .order('start_time');

    if (error) throw error;
    return data || [];
  }

  // Search timeslots by date range and service
  async searchTimeslots(
    fromDate: string,
    toDate: string,
    serviceIds?: number[],
    availableOnly: boolean = false
  ): Promise<any[]> {
    let queryBuilder = this.client
      .from(this.tableName)
      .select(`
        *,
        service:services(
          name,
          description,
          department:departments(
            name,
            description
          )
        )
      `)
      .gte('slot_date', fromDate)
      .lte('slot_date', toDate);

    if (serviceIds && serviceIds.length > 0) {
      queryBuilder = queryBuilder.in('service_id', serviceIds);
    }

    if (availableOnly) {
      queryBuilder = queryBuilder.gt('slots_available', 0);
    }

    const { data, error } = await queryBuilder
      .order('slot_date')
      .order('start_time');

    if (error) throw error;
    return data || [];
  }

  // Validate timeslot conflicts
  async hasTimeConflict(
    serviceId: number,
    slotDate: string,
    startTime: string,
    endTime: string,
    excludeTimeslotId?: number
  ): Promise<boolean> {
    let queryBuilder = this.client
      .from(this.tableName)
      .select('id')
      .eq('service_id', serviceId)
      .eq('slot_date', slotDate)
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`);

    if (excludeTimeslotId) {
      queryBuilder = queryBuilder.neq('id', excludeTimeslotId);
    }

    const { data, error } = await queryBuilder.limit(1);

    if (error) throw error;
    return (data && data.length > 0);
  }
}
