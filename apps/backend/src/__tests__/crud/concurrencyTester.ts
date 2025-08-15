// Test script to demonstrate race condition handling in timeslot booking
import { AppointmentBookingService } from '../../services/AppointmentBookingService';
import { timeslotRepository, userRepository, serviceRepository } from '../../models';

export class ConcurrencyTester {
  
  /**
   * Simulates multiple users trying to book the same timeslot simultaneously
   */
  static async testRaceCondition(): Promise<void> {
    console.log('🏁 Testing Race Condition Handling\n');

    try {
      // 1. Get a timeslot with limited capacity
      const services = await serviceRepository.findAll();
      if (services.length === 0) {
        console.log('❌ No services found');
        return;
      }

      const service = services[0]; // Use first available service
      const timeslots = await timeslotRepository.findAvailable(service.id);
      if (timeslots.length === 0) {
        console.log('❌ No available timeslots found for testing');
        return;
      }

      const testTimeslot = timeslots[0];
      console.log(`📅 Using timeslot: ${testTimeslot.id} (${testTimeslot.slots_available}/${testTimeslot.capacity} available)`);

      // 2. Get test users
      const users = await userRepository.findAll();
      if (users.length < 3) {
        console.log('❌ Need at least 3 users for race condition testing');
        return;
      }

      // 3. Create multiple concurrent booking requests
      const concurrentBookings = users.slice(0, 6).map((user, index) => {
        return AppointmentBookingService.bookAppointment({
          userId: user.id,
          serviceId: testTimeslot.service_id,
          timeslotId: testTimeslot.id
        });
      });

      console.log(`🚀 Launching ${concurrentBookings.length} concurrent booking requests...\n`);

      // 4. Execute all bookings simultaneously
      const startTime = Date.now();
      const results = await Promise.allSettled(concurrentBookings);
      const endTime = Date.now();

      // 5. Analyze results
      console.log(`⏱️  Total execution time: ${endTime - startTime}ms\n`);
      console.log('📊 Booking Results:');

      let successCount = 0;
      let failureCount = 0;
      let slotUnavailableCount = 0;
      let concurrencyErrorCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const bookingResult = result.value;
          if (bookingResult.success) {
            successCount++;
            console.log(`  ✅ User ${users[index].id}: SUCCESS - Booking ${bookingResult.bookingReference}`);
          } else {
            failureCount++;
            if (bookingResult.errorCode === 'SLOT_UNAVAILABLE') {
              slotUnavailableCount++;
            } else if (bookingResult.errorCode === 'CONCURRENCY_ERROR') {
              concurrencyErrorCount++;
            }
            console.log(`  ❌ User ${users[index].id}: FAILED - ${bookingResult.error}`);
          }
        } else {
          failureCount++;
          console.log(`  💥 User ${users[index].id}: CRASHED - ${result.reason}`);
        }
      });

      // 6. Verify slot integrity
      const updatedTimeslot = await timeslotRepository.findById(testTimeslot.id);
      const expectedAvailable = testTimeslot.slots_available - successCount;

      console.log('\n🔍 Slot Integrity Check:');
      console.log(`  Original available: ${testTimeslot.slots_available}`);
      console.log(`  Successful bookings: ${successCount}`);
      console.log(`  Expected available: ${expectedAvailable}`);
      console.log(`  Actual available: ${updatedTimeslot?.slots_available}`);
      
      if (updatedTimeslot?.slots_available === expectedAvailable) {
        console.log('  ✅ SLOT INTEGRITY MAINTAINED');
      } else {
        console.log('  ❌ SLOT INTEGRITY VIOLATED!');
      }

      // 7. Summary
      console.log('\n📈 Test Summary:');
      console.log(`  Total requests: ${concurrentBookings.length}`);
      console.log(`  Successful: ${successCount}`);
      console.log(`  Failed (slot unavailable): ${slotUnavailableCount}`);
      console.log(`  Failed (concurrency): ${concurrencyErrorCount}`);
      console.log(`  Failed (other): ${failureCount - slotUnavailableCount - concurrencyErrorCount}`);
      console.log(`  Success rate: ${Math.round((successCount / concurrentBookings.length) * 100)}%`);

    } catch (error) {
      console.error('💥 Race condition test failed:', error);
    }
  }

  /**
   * Test booking and cancellation flow
   */
  static async testBookingCancellationFlow(): Promise<void> {
    console.log('\n🔄 Testing Booking & Cancellation Flow\n');

    try {
      // 1. Get available timeslot
      const services = await serviceRepository.findAll();
      if (services.length === 0) {
        console.log('❌ No services found');
        return;
      }

      const service = services[0]; // Use first available service
      const timeslots = await timeslotRepository.findAvailable(service.id);
      if (timeslots.length === 0) {
        console.log('❌ No available timeslots found');
        return;
      }

      const timeslot = timeslots[0];
      const originalAvailable = timeslot.slots_available;

      // 2. Get a user
      const users = await userRepository.findAll();
      if (users.length === 0) {
        console.log('❌ No users found');
        return;
      }

      const user = users[0];
      console.log(`👤 Using user: ${user.first_name} ${user.last_name}`);
      console.log(`📅 Using timeslot: ${timeslot.id} (${originalAvailable} available)`);

      // 3. Book appointment
      console.log('\n📝 Booking appointment...');
      const bookingResult = await AppointmentBookingService.bookAppointment({
        userId: user.id,
        serviceId: timeslot.service_id,
        timeslotId: timeslot.id
      });

      if (!bookingResult.success || !bookingResult.appointment) {
        console.log(`❌ Booking failed: ${bookingResult.error}`);
        return;
      }

      console.log(`✅ Appointment booked: ${bookingResult.bookingReference}`);

      // 4. Verify slot was decremented
      const afterBookingSlot = await timeslotRepository.findById(timeslot.id);
      console.log(`📊 Slots after booking: ${afterBookingSlot?.slots_available} (was ${originalAvailable})`);

      // 5. Cancel appointment
      console.log('\n🚫 Cancelling appointment...');
      const cancellationResult = await AppointmentBookingService.cancelAppointment(
        bookingResult.appointment.id,
        'Test cancellation'
      );

      if (!cancellationResult.success) {
        console.log(`❌ Cancellation failed: ${cancellationResult.error}`);
        return;
      }

      console.log(`✅ Appointment cancelled`);

      // 6. Verify slot was incremented back
      const afterCancellationSlot = await timeslotRepository.findById(timeslot.id);
      console.log(`📊 Slots after cancellation: ${afterCancellationSlot?.slots_available} (should be ${originalAvailable})`);

      if (afterCancellationSlot?.slots_available === originalAvailable) {
        console.log('✅ BOOKING/CANCELLATION FLOW SUCCESSFUL');
      } else {
        console.log('❌ SLOT COUNT MISMATCH AFTER CANCELLATION');
      }

    } catch (error) {
      console.error('💥 Booking/cancellation test failed:', error);
    }
  }

  /**
   * Test edge cases
   */
  static async testEdgeCases(): Promise<void> {
    console.log('\n🎯 Testing Edge Cases\n');

    try {
      const users = await userRepository.findAll();
      const services = await serviceRepository.findAll();
      
      if (users.length === 0 || services.length === 0) {
        console.log('❌ Need users and services for edge case testing');
        return;
      }

      const user = users[0];
      const service = services[0];

      // Test 1: Invalid timeslot ID
      console.log('1️⃣ Testing invalid timeslot ID...');
      const invalidTimeslotResult = await AppointmentBookingService.bookAppointment({
        userId: user.id,
        serviceId: service.id,
        timeslotId: 99999 // Non-existent
      });
      console.log(`  ${invalidTimeslotResult.success ? '❌' : '✅'} Invalid timeslot: ${invalidTimeslotResult.error}`);

      // Test 2: Invalid user ID
      console.log('2️⃣ Testing invalid user ID...');
      const timeslots = await timeslotRepository.findAvailable(service.id);
      if (timeslots.length > 0) {
        const invalidUserResult = await AppointmentBookingService.bookAppointment({
          userId: 99999, // Non-existent
          serviceId: service.id,
          timeslotId: timeslots[0].id
        });
        console.log(`  ${invalidUserResult.success ? '❌' : '✅'} Invalid user: ${invalidUserResult.error}`);
      }

      // Test 3: Service/timeslot mismatch
      console.log('3️⃣ Testing service/timeslot mismatch...');
      const allTimeslots = await timeslotRepository.findAll();
      const differentServiceTimeslot = allTimeslots.find(t => t.service_id !== service.id);
      
      if (differentServiceTimeslot) {
        const mismatchResult = await AppointmentBookingService.bookAppointment({
          userId: user.id,
          serviceId: service.id,
          timeslotId: differentServiceTimeslot.id
        });
        console.log(`  ${mismatchResult.success ? '❌' : '✅'} Service mismatch: ${mismatchResult.error}`);
      }

      console.log('\n✅ Edge case testing completed');

    } catch (error) {
      console.error('💥 Edge case testing failed:', error);
    }
  }

  /**
   * Run all concurrency tests
   */
  static async runAllTests(): Promise<void> {
    console.log('🧪 Starting Comprehensive Concurrency Tests\n');
    console.log('='.repeat(60));

    await this.testRaceCondition();
    console.log('\n' + '='.repeat(60));
    
    await this.testBookingCancellationFlow();
    console.log('\n' + '='.repeat(60));
    
    await this.testEdgeCases();
    console.log('\n' + '='.repeat(60));
    
    console.log('\n🎉 ALL CONCURRENCY TESTS COMPLETED');
  }
}

// Auto-run tests if this file is executed directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  ConcurrencyTester.runAllTests()
    .then(() => {
      console.log('\n✅ Concurrency testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Concurrency testing failed:', error);
      process.exit(1);
    });
}
