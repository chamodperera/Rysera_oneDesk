import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the config type interface
interface Config {
  port: number;
  nodeEnv: string;
  
  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;
  
  // Supabase
  supabaseUrl: string;
  supabaseKey: string;
  supabaseServiceKey: string;
  
  // SendGrid
  sendgridApiKey: string;
  fromEmail: string;
  
  // Timezone
  timezone: string;
  
  // File Upload
  maxFileSize: number;
  allowedFileTypes: string[];
}

export const config: Config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
 
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '48h',
 
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
 
  // SendGrid
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@onedesk.gov.lk',
 
  // Timezone
  timezone: 'Asia/Colombo',
 
  // File Upload
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['pdf', 'png', 'jpg', 'jpeg'],
};

export default config;