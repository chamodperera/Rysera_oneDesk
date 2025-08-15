// Base repository class with common CRUD operations
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../utils/supabase';

export abstract class BaseRepository<T, CreateData, UpdateData> {
  protected tableName: string;
  protected client: SupabaseClient;

  constructor(tableName: string, useAdmin = false) {
    this.tableName = tableName;
    this.client = useAdmin ? supabaseAdmin : supabase;
  }

  async findAll(filters?: Record<string, any>, limit?: number, offset?: number): Promise<T[]> {
    let query = this.client.from(this.tableName).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    if (limit) query = query.limit(limit);
    if (offset) query = query.range(offset, offset + (limit || 10) - 1);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async findById(id: number): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  }

  async create(data: CreateData): Promise<T> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async update(id: number, data: UpdateData): Promise<T | null> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    let query = this.client.from(this.tableName).select('*', { count: 'exact', head: true });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    const { count, error } = await query;
    
    if (error) throw error;
    return count || 0;
  }

  async exists(filters: Record<string, any>): Promise<boolean> {
    const count = await this.count(filters);
    return count > 0;
  }
}
