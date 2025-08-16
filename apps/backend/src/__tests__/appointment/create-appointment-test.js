// Test file to create an appointment using the modified QR code logic
// Run with: node create-appointment-test.js

const BASE_URL = 'http://localhost:3001/api';

// Create appointment as citizen user
async function createAppointmentAsCitizen() {
  console.log('🔐 Creating appointment as citizen');
  
  try {
    // Step 1: Login as citizen
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'citizen123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Citizen login failed');
      const error = await loginResponse.text();
      console.log('Error:', error);
      return;
    }

    const loginData = await loginResponse.json();
    const citizenToken = loginData.data.token;
    console.log('✅ Citizen authenticated');

    // Step 2: Use known service ID instead of fetching services
    const serviceId = 9; // Known service ID (Driving License Application)
    console.log(`📋 Using Service ID: ${serviceId} (Driving License Application)`);
    
    // Step 3: Use known timeslot ID instead of fetching
    const timeslotId = 185; // Known timeslot ID
    console.log(`🕒 Using Timeslot ID: ${timeslotId}`);
    
    // Step 4: Create appointment using known IDs
    const appointmentResponse = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${citizenToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: serviceId,
        timeslot_id: timeslotId
      })
    });
    
    if (appointmentResponse.ok) {
      const appointmentData = await appointmentResponse.json();
      console.log('✅ Appointment created successfully!');
      console.log('📅 Appointment details:');
      console.log(JSON.stringify(appointmentData.data, null, 2));
      return appointmentData.data;
    } else {
      const error = await appointmentResponse.text();
      console.log('❌ Appointment creation failed:', error);
      try {
        const errorJson = JSON.parse(error);
        console.log('Error details:', errorJson);
      } catch (e) {
        // Not JSON, just use the text
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Main function to run the test
async function testAppointmentCreation() {
  console.log('🚀 Appointment Creation Test');
  console.log('============================\n');

  const appointment = await createAppointmentAsCitizen();
  
  console.log('\n📋 Summary:');
  console.log('✅ Appointment creation: ', appointment ? 'SUCCESS' : 'FAILED');
  
  if (appointment && appointment.appointment) {
    console.log('\n🔍 QR Code:');
    console.log('QR Code exists: ', !!appointment.appointment.qr_code);
    // Only log the first 100 characters as the base64 string is very long
    if (appointment.appointment.qr_code) {
      console.log('QR Code (first 100 chars): ' + appointment.appointment.qr_code.substring(0, 100) + '...');
    }
  }
}

// Run the test
testAppointmentCreation();
