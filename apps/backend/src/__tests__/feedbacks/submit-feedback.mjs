// Script to submit feedback for a specific appointment and user
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Configuration
const APPOINTMENT_ID = 15;
const USER_ID = 20;
const RATING = 5; // 1-5
const COMMENT = "Great service, very helpful staff!";

// Set appointment status to 'completed' if not already
async function setAppointmentAsCompleted() {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', APPOINTMENT_ID)
    .eq('user_id', USER_ID)
    .select();

  if (error) {
    console.error('Error updating appointment status:', error);
    return false;
  }

  if (data?.length === 0) {
    console.error(`No appointment found with ID ${APPOINTMENT_ID} for user ${USER_ID}`);
    return false;
  }

  console.log('Appointment status set to completed:', data);
  return true;
}

// Insert feedback directly into the database
async function createFeedback() {
  const { data, error } = await supabase
    .from('feedbacks')
    .insert({
      appointment_id: APPOINTMENT_ID,
      user_id: USER_ID,
      rating: RATING,
      comment: COMMENT,
      created_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error('Error inserting feedback:', error);
    return false;
  }

  console.log('Feedback created successfully:', data);
  return true;
}

// Main function
async function main() {
  console.log(`Creating feedback for appointment ID ${APPOINTMENT_ID} and user ID ${USER_ID}...`);
  
  // First ensure appointment is marked as completed
  const appointmentUpdated = await setAppointmentAsCompleted();
  if (!appointmentUpdated) {
    console.log('Could not update appointment status, checking if it already exists...');
  }
  
  // Create the feedback
  const feedbackCreated = await createFeedback();
  
  if (feedbackCreated) {
    console.log('✅ Feedback submission complete');
  } else {
    console.log('❌ Feedback submission failed');
  }
}

main().catch(console.error);
