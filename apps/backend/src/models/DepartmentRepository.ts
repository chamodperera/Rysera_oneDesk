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
}
