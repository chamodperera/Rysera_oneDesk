/**
 * Test appointment confirmation email functionality
 */

import { NotificationService } from '../../../dist/services/NotificationService.cjs';

console.log('🧪 Testing Appointment Confirmation Email...');

async function testAppointmentConfirmation() {
  try {
    console.log('📧 Testing appointment confirmation email...');

    // Test appointment details
    const appointmentDetails = {
      appointmentId: 22, // Using real appointment ID from our test
      bookingReference: 'TEST123456',
      serviceName: 'Passport Application',
      departmentName: 'Immigration Department',
      dateTime: 'Monday, August 17, 2025 at 10:00 AM - 10:30 AM',
      officerName: 'John Smith'
    };

    console.log('📤 Sending confirmation email...');
    
    const success = await NotificationService.sendAppointmentConfirmation(
      20, // Test user ID
      'chamodperera87@gmail.com', // Test email
      'Chamod Perera', // Test name
      appointmentDetails
    );

    if (success) {
      console.log('✅ Appointment confirmation email sent successfully!');
      console.log('📋 Email contents:');
      console.log(`   - To: chamodperera87@gmail.com`);
      console.log(`   - Subject: Appointment Confirmation - Government Services`);
      console.log(`   - Booking Reference: ${appointmentDetails.bookingReference}`);
      console.log(`   - Service: ${appointmentDetails.serviceName}`);
      console.log(`   - Date/Time: ${appointmentDetails.dateTime}`);
      console.log(`   - Officer: ${appointmentDetails.officerName}`);
    } else {
      console.log('❌ Failed to send appointment confirmation email');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAppointmentConfirmation()
  .then(() => {
    console.log('✅ Appointment confirmation test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test error:', error);
    process.exit(1);
  });
