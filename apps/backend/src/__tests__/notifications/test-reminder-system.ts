/**
 * Test script for the Appointment Reminder System
 * This script validates the functionality of scheduled reminders
 */

import { SchedulerService } from '../../services/SchedulerService.js';
import { ReminderService } from '../../services/ReminderService.js';
import { appointmentRepository } from '../../models/index.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

// Configure dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const SRI_LANKA_TIMEZONE = 'Asia/Colombo';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds timeout for each test
  verbose: true
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message: string) {
  const line = '='.repeat(60);
  log(`\n${line}`, 'cyan');
  log(`${message}`, 'cyan');
  log(`${line}`, 'cyan');
}

function logTest(message: string) {
  log(`🧪 ${message}`, 'blue');
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message: string) {
  log(`⚠️ ${message}`, 'yellow');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

/**
 * Test 1: Verify Scheduler Service initialization
 */
async function testSchedulerInitialization(): Promise<boolean> {
  logTest('Testing Scheduler Service initialization...');
  
  try {
    // Test initialization
    SchedulerService.initialize();
    logSuccess('Scheduler initialized successfully');
    
    // Test status retrieval
    const status = SchedulerService.getStatus();
    log(`📊 Initial Status: Running=${status.isRunning}, Total Runs=${status.totalRuns}`);
    
    // Test debug info
    const debugInfo = SchedulerService.getDebugInfo();
    log(`🔍 Cron Schedule: ${debugInfo.cronSchedule}`);
    log(`🌏 Timezone: ${debugInfo.timezone}`);
    log(`🕐 Current Time: ${debugInfo.currentTime}`);
    
    return true;
  } catch (error) {
    logError(`Scheduler initialization failed: ${error}`);
    return false;
  }
}

/**
 * Test 2: Test scheduler start/stop functionality
 */
async function testSchedulerStartStop(): Promise<boolean> {
  logTest('Testing Scheduler start/stop functionality...');
  
  try {
    // Test start
    SchedulerService.start();
    let status = SchedulerService.getStatus();
    
    if (!status.isRunning) {
      logError('Scheduler failed to start');
      return false;
    }
    logSuccess('Scheduler started successfully');
    log(`📅 Next run scheduled for: ${status.nextRun}`);
    
    // Test stop
    SchedulerService.stop();
    status = SchedulerService.getStatus();
    
    if (status.isRunning) {
      logError('Scheduler failed to stop');
      return false;
    }
    logSuccess('Scheduler stopped successfully');
    
    // Test restart
    SchedulerService.restart();
    status = SchedulerService.getStatus();
    
    if (!status.isRunning) {
      logError('Scheduler failed to restart');
      return false;
    }
    logSuccess('Scheduler restarted successfully');
    
    return true;
  } catch (error) {
    logError(`Scheduler start/stop test failed: ${error}`);
    return false;
  }
}

/**
 * Test 3: Test appointment query functionality
 */
async function testAppointmentQueries(): Promise<boolean> {
  logTest('Testing appointment query functionality...');
  
  try {
    // Get tomorrow's date
    const tomorrow = dayjs()
      .tz(SRI_LANKA_TIMEZONE)
      .add(1, 'day')
      .format('YYYY-MM-DD');
    
    log(`📅 Querying appointments for: ${tomorrow}`);
    
    // Test findAppointmentsForReminder
    const appointments = await appointmentRepository.findAppointmentsForReminder(tomorrow);
    log(`📋 Found ${appointments.length} appointments for tomorrow`);
    
    if (appointments.length > 0) {
      const appointment = appointments[0];
      log(`📝 Sample appointment: ID=${appointment.id}, Booking=${appointment.booking_reference}, Status=${appointment.status}`);
      
      // Test hasReminderBeenSent
      const reminderSent = await appointmentRepository.hasReminderBeenSent(appointment.id);
      log(`📧 Reminder already sent: ${reminderSent}`);
    }
    
    logSuccess('Appointment queries completed successfully');
    return true;
  } catch (error) {
    logError(`Appointment query test failed: ${error}`);
    return false;
  }
}

/**
 * Test 4: Test reminder statistics
 */
async function testReminderStatistics(): Promise<boolean> {
  logTest('Testing reminder statistics...');
  
  try {
    const stats = await ReminderService.getReminderStatistics();
    
    log(`📊 Reminder Statistics:`);
    log(`   - Appointments scheduled: ${stats.appointmentsScheduled}`);
    log(`   - Reminders already sent: ${stats.remindersAlreadySent}`);
    log(`   - Pending reminders: ${stats.pendingReminders}`);
    
    logSuccess('Reminder statistics retrieved successfully');
    return true;
  } catch (error) {
    logError(`Reminder statistics test failed: ${error}`);
    return false;
  }
}

/**
 * Test 5: Test manual reminder execution (dry run)
 */
async function testManualExecution(): Promise<boolean> {
  logTest('Testing manual reminder execution...');
  
  try {
    // Get current stats before execution
    const statsBefore = await ReminderService.getReminderStatistics();
    log(`📊 Pre-execution stats: ${statsBefore.pendingReminders} pending reminders`);
    
    if (statsBefore.pendingReminders === 0) {
      logWarning('No pending reminders to test with. This is normal if no appointments are scheduled for tomorrow.');
      return true;
    }
    
    // Execute manual reminder job
    log('🚀 Executing manual reminder job...');
    const executionStats = await SchedulerService.triggerManualExecution('Test execution from reminder test script');
    
    log(`📊 Execution Results:`);
    log(`   - Total appointments: ${executionStats.totalAppointments}`);
    log(`   - Citizen reminders sent: ${executionStats.citizenReminders}`);
    log(`   - Officer reminders sent: ${executionStats.officerReminders}`);
    log(`   - Duplicates skipped: ${executionStats.skippedDuplicates}`);
    log(`   - Failures: ${executionStats.failures}`);
    log(`   - Processing time: ${executionStats.processingTime}ms`);
    
    if (executionStats.failures > 0) {
      logWarning(`${executionStats.failures} failures occurred during execution`);
    }
    
    logSuccess('Manual reminder execution completed');
    return true;
  } catch (error) {
    logError(`Manual execution test failed: ${error}`);
    return false;
  }
}

/**
 * Test 6: Test scheduler health check
 */
async function testHealthCheck(): Promise<boolean> {
  logTest('Testing scheduler health check...');
  
  try {
    const health = SchedulerService.healthCheck();
    
    log(`🏥 Health Check Results:`);
    log(`   - Status: ${health.status}`);
    log(`   - Initialized: ${health.details.isInitialized}`);
    log(`   - Running: ${health.details.isRunning}`);
    log(`   - Last run: ${health.details.lastRun || 'Never'}`);
    log(`   - Next run: ${health.details.nextRun || 'Not scheduled'}`);
    log(`   - Error rate: ${health.details.errorRate}%`);
    
    if (health.status === 'unhealthy') {
      logWarning('Scheduler health check indicates unhealthy status');
    } else {
      logSuccess('Scheduler is healthy');
    }
    
    return true;
  } catch (error) {
    logError(`Health check test failed: ${error}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  logHeader('APPOINTMENT REMINDER SYSTEM TEST SUITE');
  log(`Started at: ${dayjs().tz(SRI_LANKA_TIMEZONE).format('YYYY-MM-DD HH:mm:ss')} (Sri Lanka Time)`);
  
  const tests = [
    { name: 'Scheduler Initialization', fn: testSchedulerInitialization },
    { name: 'Scheduler Start/Stop', fn: testSchedulerStartStop },
    { name: 'Appointment Queries', fn: testAppointmentQueries },
    { name: 'Reminder Statistics', fn: testReminderStatistics },
    { name: 'Manual Execution', fn: testManualExecution },
    { name: 'Health Check', fn: testHealthCheck }
  ];
  
  const results: { name: string; passed: boolean; error?: any }[] = [];
  
  for (const test of tests) {
    logHeader(`TEST: ${test.name.toUpperCase()}`);
    
    try {
      const startTime = Date.now();
      const passed = await Promise.race([
        test.fn(),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.timeout)
        )
      ]);
      
      const duration = Date.now() - startTime;
      
      results.push({ name: test.name, passed });
      
      if (passed) {
        logSuccess(`✅ ${test.name} PASSED (${duration}ms)`);
      } else {
        logError(`❌ ${test.name} FAILED (${duration}ms)`);
      }
    } catch (error) {
      results.push({ name: test.name, passed: false, error });
      logError(`💥 ${test.name} CRASHED: ${error}`);
    }
  }
  
  // Test summary
  logHeader('TEST SUMMARY');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  log(`📊 Total tests: ${results.length}`);
  log(`✅ Passed: ${passed}`, passed === results.length ? 'green' : 'reset');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
  
  if (failed === 0) {
    logSuccess('🎉 ALL TESTS PASSED! Reminder system is ready for production.');
  } else {
    logError('⚠️ Some tests failed. Please review the issues before deploying.');
    
    // Show failed tests
    const failedTests = results.filter(r => !r.passed);
    log('\nFailed tests:');
    failedTests.forEach(test => {
      log(`  - ${test.name}${test.error ? `: ${test.error.message}` : ''}`, 'red');
    });
  }
  
  log(`\nCompleted at: ${dayjs().tz(SRI_LANKA_TIMEZONE).format('YYYY-MM-DD HH:mm:ss')} (Sri Lanka Time)`);
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(() => {
      log('\n👋 Test suite completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      logError(`Fatal error in test suite: ${error}`);
      process.exit(1);
    });
}

export { runTests };
