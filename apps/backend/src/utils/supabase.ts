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
      console.log('Testing Supabase connection...');
      console.log('Supabase URL:', config.supabaseUrl);
      console.log('Supabase Key (first 10 chars):', config.supabaseKey.substring(0, 10) + '...');
      
      // Test connection by checking auth service (doesn't require any tables)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Supabase connection error:', error.message);
        return { success: false, error: error.message };
      }
      
      console.log('✅ Supabase connection successful!');
      console.log('Session status:', session ? 'Active session found' : 'No active session (expected for test)');
      return { success: true, session };
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      return { success: false, error: (error as Error).message || 'Unknown error' };
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


