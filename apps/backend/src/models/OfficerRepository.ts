import { BaseRepository } from './BaseRepository';
import { Officer, OfficerWithDetails } from '../types/database';

export interface CreateOfficerData {
  user_id: number;
  department_id: number;
  position?: string;
}

export interface UpdateOfficerData {
  department_id?: number;
  position?: string;
}

export interface OfficerFilters {
  departmentId?: number;
  position?: string;
  search?: string;
}

export class OfficerRepository extends BaseRepository<Officer, CreateOfficerData, UpdateOfficerData> {
  constructor() {
    super('officers');
  }

  // Find officer with user and department details
  async findWithDetails(id: number): Promise<OfficerWithDetails | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        user:users(
          first_name,
          last_name,
          email,
          phone_number
        ),
        department:departments(
          name,
          description
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

  // Find officers by department
  async findByDepartment(departmentId: number): Promise<OfficerWithDetails[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        user:users(
          first_name,
          last_name,
          email,
          phone_number
        ),
        department:departments(
          name,
          description
        )
      `)
      .eq('department_id', departmentId)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Find officer by user ID
  async findByUserId(userId: number): Promise<OfficerWithDetails | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        user:users(
          first_name,
          last_name,
          email,
          phone_number
        ),
        department:departments(
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // Search officers by name or position
  async search(query: string, departmentId?: number): Promise<OfficerWithDetails[]> {
    let queryBuilder = this.client
      .from(this.tableName)
      .select(`
        *,
        user:users(
          first_name,
          last_name,
          email,
          phone_number
        ),
        department:departments(
          name,
          description
        )
      `);

    // Apply department filter if provided
    if (departmentId) {
      queryBuilder = queryBuilder.eq('department_id', departmentId);
    }

    // Search in position field only (can't search in joined table fields easily)
    const { data, error } = await queryBuilder
      .ilike('position', `%${query}%`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get all officers with pagination and filtering
  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    departmentId?: number,
    position?: string,
    sortBy: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<{ officers: OfficerWithDetails[]; count: number }> {
    const offset = (page - 1) * limit;

    let queryBuilder = this.client
      .from(this.tableName)
      .select(`
        *,
        user:users(
          first_name,
          last_name,
          email,
          phone_number
        ),
        department:departments(
          name,
          description
        )
      `, { count: 'exact' });

    // Apply filters
    if (departmentId) {
      queryBuilder = queryBuilder.eq('department_id', departmentId);
    }

    if (position) {
      queryBuilder = queryBuilder.ilike('position', `%${position}%`);
    }

    if (search) {
      queryBuilder = queryBuilder.or(`position.ilike.%${search}%`);
    }

    // Apply sorting (only on direct officer table fields) and pagination
    const validSortBy = ['position', 'created_at', 'updated_at'].includes(sortBy) ? sortBy : 'created_at';
    const { data, error, count } = await queryBuilder
      .order(validSortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      officers: data || [],
      count: count || 0
    };
  }

  // Check if a user is already an officer
  async isUserAlreadyOfficer(userId: number, excludeOfficerId?: number): Promise<boolean> {
    let queryBuilder = this.client
      .from(this.tableName)
      .select('id')
      .eq('user_id', userId);

    if (excludeOfficerId) {
      queryBuilder = queryBuilder.neq('id', excludeOfficerId);
    }

    const { data, error } = await queryBuilder.single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // Check if officer has associated timeslots
  async hasAssociatedTimeslots(officerId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from('timeslots')
      .select('id')
      .eq('officer_id', officerId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // Check if officer has associated appointments
  async hasAssociatedAppointments(officerId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from('appointments')
      .select('id')
      .eq('officer_id', officerId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // Get officer statistics
  async getOfficerStats(officerId: number): Promise<{
    totalTimeslots: number;
    totalAppointments: number;
    completedAppointments: number;
    averageRating: number;
  }> {
    // Get timeslots count
    const { count: timeslotsCount } = await this.client
      .from('timeslots')
      .select('*', { count: 'exact', head: true })
      .eq('officer_id', officerId);

    // Get appointments count and completed count
    const { count: appointmentsCount } = await this.client
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('officer_id', officerId);

    const { count: completedCount } = await this.client
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('officer_id', officerId)
      .eq('status', 'completed');

    // Get average rating from feedback
    const { data: ratingData } = await this.client
      .from('appointments')
      .select('feedback:feedback(rating)')
      .eq('officer_id', officerId)
      .not('feedback.rating', 'is', null);

    let averageRating = 0;
    if (ratingData && ratingData.length > 0) {
      const ratings = ratingData
        .map((item: any) => item.feedback?.[0]?.rating)
        .filter(rating => rating !== null && rating !== undefined);
      
      if (ratings.length > 0) {
        averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      }
    }

    return {
      totalTimeslots: timeslotsCount || 0,
      totalAppointments: appointmentsCount || 0,
      completedAppointments: completedCount || 0,
      averageRating: Math.round(averageRating * 100) / 100
    };
  }

  // Get available officers for a specific service/department
  async getAvailableOfficersForService(serviceId: number): Promise<OfficerWithDetails[]> {
    // First get the department for the service
    const { data: serviceData, error: serviceError } = await this.client
      .from('services')
      .select('department_id')
      .eq('id', serviceId)
      .single();

    if (serviceError) throw serviceError;
    if (!serviceData) return [];

    // Get officers from that department
    return this.findByDepartment(serviceData.department_id);
  }
}
