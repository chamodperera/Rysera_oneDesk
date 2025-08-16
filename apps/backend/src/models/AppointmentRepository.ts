// Appointment repository with complex relationships
import { BaseRepository } from './BaseRepository';
import { 
  Appointment, 
  CreateAppointmentData, 
  AppointmentWithDetails,
  AppointmentStatus 
} from '../types/database';

interface UpdateAppointmentData {
  officer_id?: number;
  status?: AppointmentStatus;
  booking_reference?: string;
  qr_code?: string;
}

export class AppointmentRepository extends BaseRepository<Appointment, CreateAppointmentData, UpdateAppointmentData> {
  constructor() {
    super('appointments');
  }

  async findByBookingNo(bookingNo: number): Promise<Appointment | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('booking_no', bookingNo)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findByBookingReference(bookingRef: string): Promise<Appointment | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('booking_reference', bookingRef)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findWithDetails(id: number): Promise<AppointmentWithDetails | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        user:users(first_name, last_name, email, phone_number),
        service:services(name, description, duration_minutes),
        officer:officers(
          position,
          user:users(first_name, last_name, email)
        ),
        timeslot:timeslots(slot_date, start_time, end_time),
        department:services(department:departments(name))
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findByUser(userId: number, filters?: {
    status?: AppointmentStatus;
    fromDate?: string;
    toDate?: string;
  }): Promise<AppointmentWithDetails[]> {
    let query = this.client
      .from(this.tableName)
      .select(`
        *,
        service:services(name, description, duration_minutes),
        officer:officers(
          position,
          user:users(first_name, last_name, email)
        ),
        timeslot:timeslots(slot_date, start_time, end_time)
      `)
      .eq('user_id', userId);
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.fromDate) {
      query = query.gte('created_at', filters.fromDate);
    }
    
    if (filters?.toDate) {
      query = query.lte('created_at', filters.toDate);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async findByOfficer(officerId: number, filters?: {
    status?: AppointmentStatus;
    date?: string;
  }): Promise<AppointmentWithDetails[]> {
    let query = this.client
      .from(this.tableName)
      .select(`
        *,
        user:users(first_name, last_name, email, phone_number),
        service:services(name, description, duration_minutes),
        timeslot:timeslots(slot_date, start_time, end_time)
      `)
      .eq('officer_id', officerId);
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.date) {
      // Filter by timeslot date
      query = query.eq('timeslots.slot_date', filters.date);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async findUpcomingReminders(hoursAhead: number = 24): Promise<AppointmentWithDetails[]> {
    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + hoursAhead);
    
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        user:users(first_name, last_name, email),
        service:services(name),
        officer:officers(
          user:users(first_name, last_name, email)
        ),
        timeslot:timeslots(slot_date, start_time, end_time)
      `)
      .eq('status', 'confirmed')
      .eq('timeslots.slot_date', reminderTime.toISOString().split('T')[0]); // Match date
    
    if (error) throw error;
    return data || [];
  }

  async updateStatus(id: number, status: AppointmentStatus): Promise<Appointment | null> {
    return this.update(id, { status });
  }

  async assignOfficer(id: number, officerId: number): Promise<Appointment | null> {
    return this.update(id, { officer_id: officerId });
  }

  async getNextBookingNumber(): Promise<number> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('booking_no')
      .order('booking_no', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    const lastBookingNo = data?.[0]?.booking_no || 0;
    return lastBookingNo + 1;
  }

  async generateBookingReference(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return `GV${year}${month}${day}${random}`;
  }

  async getAppointmentStats(filters?: {
    fromDate?: string;
    toDate?: string;
    departmentId?: number;
    serviceId?: number;
  }): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }> {
    let query = this.client.from(this.tableName).select('status');
    
    if (filters?.fromDate) {
      query = query.gte('created_at', filters.fromDate);
    }
    
    if (filters?.toDate) {
      query = query.lte('created_at', filters.toDate);
    }
    
    if (filters?.serviceId) {
      query = query.eq('service_id', filters.serviceId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const stats = {
      total: data?.length || 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    
    data?.forEach(appointment => {
      stats[appointment.status as keyof typeof stats]++;
    });
    
    return stats;
  }

  async findAllWithPagination(
    page: number,
    limit: number,
    filters?: {
      userId?: number;
      status?: AppointmentStatus;
      officerId?: number;
      serviceId?: number;
      fromDate?: string;
      toDate?: string;
      userRole?: string;
    },
    sortBy: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ appointments: AppointmentWithDetails[], count: number }> {
    let query = this.client
      .from(this.tableName)
      .select(`
        *,
        user:users(first_name, last_name, email, phone_number),
        service:services(name, description, duration_minutes,
          department:departments(name)
        ),
        officer:officers(
          position,
          user:users(first_name, last_name, email)
        ),
        timeslot:timeslots(slot_date, start_time, end_time)
      `);

    let countQuery = this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    // Apply filters
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
      countQuery = countQuery.eq('user_id', filters.userId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
      countQuery = countQuery.eq('status', filters.status);
    }

    if (filters?.officerId) {
      query = query.eq('officer_id', filters.officerId);
      countQuery = countQuery.eq('officer_id', filters.officerId);
    }

    if (filters?.serviceId) {
      query = query.eq('service_id', filters.serviceId);
      countQuery = countQuery.eq('service_id', filters.serviceId);
    }

    if (filters?.fromDate) {
      query = query.gte('created_at', filters.fromDate);
      countQuery = countQuery.gte('created_at', filters.fromDate);
    }

    if (filters?.toDate) {
      query = query.lte('created_at', filters.toDate);
      countQuery = countQuery.lte('created_at', filters.toDate);
    }

    // Get count
    const { count } = await countQuery;

    // Get paginated data
    const { data: appointments, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      appointments: appointments || [],
      count: count || 0
    };
  }

  /**
   * Find appointments scheduled for tomorrow that need reminder emails
   * (24 hours from now, considering Sri Lanka timezone)
   */
  async findAppointmentsForReminder(targetDate: string): Promise<AppointmentWithDetails[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        user:users!appointments_user_id_fkey(
          id,
          first_name,
          last_name,
          email,
          phone_number
        ),
        service:services!appointments_service_id_fkey(
          name,
          description,
          duration_minutes,
          department:departments!services_department_id_fkey(
            name
          )
        ),
        officer:officers!appointments_officer_id_fkey(
          position,
          user:users!officers_user_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        ),
        timeslot:timeslots!appointments_timeslot_id_fkey(
          slot_date,
          start_time,
          end_time
        )
      `)
      .eq('timeslot.slot_date', targetDate)
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to find appointments for reminder: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Check if reminder has already been sent for an appointment
   * by checking the notifications table
   */
  async hasReminderBeenSent(appointmentId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from('notifications')
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('type', 'generic') // Using 'generic' for now as 'appointment_reminder' may not be in DB
      .eq('status', 'sent')
      .ilike('message', '%reminder%') // Additional filter to identify reminder notifications
      .limit(1);

    if (error) {
      console.warn(`Error checking reminder status for appointment ${appointmentId}:`, error.message);
      return false; // If we can't check, assume not sent to be safe
    }

    return (data && data.length > 0);
  }
}
