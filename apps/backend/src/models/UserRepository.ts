// User repository with specific methods
import { BaseRepository } from './BaseRepository';
import { User, CreateUserData, UpdateUserData, UserRole } from '../types/database';

export class UserRepository extends BaseRepository<User, CreateUserData, UpdateUserData> {
  constructor() {
    super('users', true); // Use admin client for user operations
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    const { error } = await this.client
      .from(this.tableName)
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async isEmailTaken(email: string, excludeId?: number): Promise<boolean> {
    let query = this.client
      .from(this.tableName)
      .select('id')
      .eq('email', email);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data?.length || 0) > 0;
  }

  async isPhoneNumberTaken(phoneNumber: string, excludeId?: number): Promise<boolean> {
    let query = this.client
      .from(this.tableName)
      .select('id')
      .eq('phone_number', phoneNumber);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data?.length || 0) > 0;
  }
}
