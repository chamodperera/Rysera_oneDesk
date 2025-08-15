// Supabase client configuration and utilities
import { createClient } from '@supabase/supabase-js';
import config from '../config';

// Create Supabase client with anon key for general operations
export const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Create Supabase admin client with service key for admin operations
export const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database query utilities
export class DatabaseUtils {
  static async executeQuery(query: string, params?: any[]) {
    try {
      const { data, error } = await supabase.rpc(query, params);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  static async checkConnection() {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  }
}

// Storage utilities for file uploads
export class StorageUtils {
  static async uploadFile(bucket: string, fileName: string, file: File | Buffer) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  static async deleteFile(bucket: string, fileName: string) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }

  static getFileUrl(bucket: string, fileName: string) {
    return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
  }
}
