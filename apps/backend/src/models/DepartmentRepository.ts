// Department repository
import { BaseRepository } from './BaseRepository';
import { Department, CreateDepartmentData, UpdateUserData } from '../types/database';

interface UpdateDepartmentData {
  name?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
}

export class DepartmentRepository extends BaseRepository<Department, CreateDepartmentData, UpdateDepartmentData> {
  constructor() {
    super('departments');
  }

  async findByName(name: string): Promise<Department | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('name', name)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async search(query: string): Promise<Department[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async isNameTaken(name: string, excludeId?: number): Promise<boolean> {
    let query = this.client
      .from(this.tableName)
      .select('id')
      .eq('name', name);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  async findAllWithPagination(
    page: number,
    limit: number,
    search?: string,
    sortBy: string = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<{ departments: Department[]; count: number }> {
    const offset = (page - 1) * limit;
    
    let query = this.client
      .from(this.tableName)
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;
    return { departments: data || [], count: count || 0 };
  }

  async hasAssociatedServices(departmentId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from('services')
      .select('id')
      .eq('department_id', departmentId)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  async hasAssociatedOfficers(departmentId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from('officers')
      .select('id')
      .eq('department_id', departmentId)
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  }
}
