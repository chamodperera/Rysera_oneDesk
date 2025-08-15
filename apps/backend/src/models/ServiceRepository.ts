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
}
