// Create test timeslots with limited capacity for concurrency testing
import { timeslotRepository, serviceRepository } from '../../models';

async function createLimitedCapacityTimeslots() {
  console.log('🎯 Creating limited capacity timeslots for testing...\n');

  try {
    // Get existing services
    const services = await serviceRepository.findAll();
    if (services.length === 0) {
      console.log('❌ No services found');
      return;
    }

    const service = services[0]; // Use first service
    console.log(`Using service: ${service.name} (ID: ${service.id})`);

    // Create timeslots with very limited capacity for testing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testDate = tomorrow.toISOString().split('T')[0];

    const testTimeslots = [
      {
        service_id: service.id,
        slot_date: testDate,
        start_time: '08:00:00',
        end_time: '09:00:00',
        capacity: 2,        // Very limited capacity
        slots_available: 2
      },
      {
        service_id: service.id,
        slot_date: testDate,
        start_time: '08:30:00',
        end_time: '09:30:00',
        capacity: 1,        // Only 1 slot - perfect for race condition testing
        slots_available: 1
      },
      {
        service_id: service.id,
        slot_date: testDate,
        start_time: '09:00:00',
        end_time: '10:00:00',
        capacity: 3,
        slots_available: 3
      }
    ];

    for (const timeslotData of testTimeslots) {
      const timeslot = await timeslotRepository.create(timeslotData);
      console.log(`✅ Created test timeslot: ${timeslot.id} - ${testDate} ${timeslot.start_time} (${timeslot.capacity} capacity)`);
    }

    console.log('\n🎉 Test timeslots created successfully!');
    
    // Show available slots for testing
    const availableSlots = await timeslotRepository.findAvailable(service.id, testDate);
    console.log(`\n📊 Available test slots: ${availableSlots.length}`);
    availableSlots.forEach(slot => {
      console.log(`  - Slot ${slot.id}: ${slot.start_time}-${slot.end_time} (${slot.slots_available}/${slot.capacity})`);
    });

  } catch (error) {
    console.error('❌ Failed to create test timeslots:', error);
  }
}

createLimitedCapacityTimeslots();
