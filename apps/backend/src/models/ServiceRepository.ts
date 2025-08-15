// Service repository with department relationships
import { BaseRepository } from './BaseRepository';
import { Service, CreateServiceData, ServiceWithDepartment } from '../types/database';

interface UpdateServiceData {
  department_id?: number;
  name?: string;
  description?: string;
  duration_minutes?: number;
  requirements?: string;
}

export class ServiceRepository extends BaseRepository<Service, CreateServiceData, UpdateServiceData> {
  constructor() {
    super('services');
  }

  async findByDepartment(departmentId: number): Promise<Service[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('department_id', departmentId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async findWithDepartment(id: number): Promise<ServiceWithDepartment | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        department:departments(name, description)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findAllWithDepartments(filters?: Record<string, any>): Promise<ServiceWithDepartment[]> {
    let query = this.client
      .from(this.tableName)
      .select(`
        *,
        department:departments(name, description)
      `);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    return data || [];
  }

  async search(query: string, departmentId?: number): Promise<ServiceWithDepartment[]> {
    let dbQuery = this.client
      .from(this.tableName)
      .select(`
        *,
        department:departments(name, description)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    
    if (departmentId) {
      dbQuery = dbQuery.eq('department_id', departmentId);
    }
    
    const { data, error } = await dbQuery.order('name');
    
    if (error) throw error;
    return data || [];
  }

  async getServiceStats(serviceId: number): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    averageRating: number;
  }> {
    // Get appointment stats
    const { data: appointmentStats, error: appointmentError } = await this.client
      .from('appointments')
      .select('status')
      .eq('service_id', serviceId);
    
    if (appointmentError) throw appointmentError;
    
    // Get average rating
    const { data: feedbackStats, error: feedbackError } = await this.client
      .from('feedbacks')
      .select('rating')
      .in('appointment_id', 
        await this.client
          .from('appointments')
          .select('id')
          .eq('service_id', serviceId)
          .then(({ data }) => data?.map(a => a.id) || [])
      );
    
    if (feedbackError) throw feedbackError;
    
    const totalAppointments = appointmentStats?.length || 0;
    const completedAppointments = appointmentStats?.filter(a => a.status === 'completed').length || 0;
    const averageRating = feedbackStats?.length 
      ? feedbackStats.reduce((sum, f) => sum + f.rating, 0) / feedbackStats.length 
      : 0;
    
    return {
      totalAppointments,
      completedAppointments,
      averageRating: Math.round(averageRating * 100) / 100 // Round to 2 decimal places
    };
  }

  async findAllWithPagination(
    page: number,
    limit: number,
    search?: string,
    departmentId?: number,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<{ services: ServiceWithDepartment[]; count: number }> {
    const offset = (page - 1) * limit;
    
    let query = this.client
      .from(this.tableName)
      .select(`
        *,
        department:departments(name, description)
      `, { count: 'exact' });

    // Apply department filter
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,requirements.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { services: data || [], count: count || 0 };
  }

  async isNameTakenInDepartment(name: string, departmentId: number, excludeId?: number): Promise<boolean> {
    let query = this.client
      .from(this.tableName)
      .select('id')
      .eq('name', name)
      .eq('department_id', departmentId);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  async hasAssociatedTimeslots(serviceId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from('timeslots')
      .select('id')
      .eq('service_id', serviceId)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  async hasAssociatedAppointments(serviceId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from('appointments')
      .select('id')
      .eq('service_id', serviceId)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  }
}
