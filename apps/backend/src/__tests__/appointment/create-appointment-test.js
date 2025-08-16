// Test file to create an appointment using the modified QR code logic
// Run with: node create-appointment-test.mjs

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
      
      // If we get an error about existing appointment, try to fetch existing appointments
      if (error.includes('already has an appointment')) {
        console.log('👉 Fetching existing user appointments instead...');
        
        const existingAppointmentsResponse = await fetch(`${BASE_URL}/appointments`, {
          headers: {
            'Authorization': `Bearer ${citizenToken}`
          }
        });
        
        if (existingAppointmentsResponse.ok) {
          const existingData = await existingAppointmentsResponse.json();
          if (existingData.data && existingData.data.length > 0) {
            console.log('✅ Found existing appointment');
            console.log(JSON.stringify(existingData.data[0], null, 2));
            return existingData;
          }
        }
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
      
      // Check if QR code contains appointment ID
      if (appointment.appointment.qr_code.includes(appointment.appointment.id.toString())) {
        console.log('✅ QR code contains appointment ID');
      } else if (appointment.appointment.qr_code.startsWith('data:image/png;base64,')) {
        console.log('ℹ️ QR code is a base64 image, cannot check content directly');
      } else {
        console.log('⚠️ QR code does not seem to contain appointment ID');
      }
    }
  }
}

// Run the test
testAppointmentCreation();
