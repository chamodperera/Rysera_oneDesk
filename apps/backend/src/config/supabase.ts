import { createClient } from '@supabase/supabase-js';
import config from './index';

// Initialize Supabase client
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseKey
);

// Service role client for admin operations
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default supabase;
