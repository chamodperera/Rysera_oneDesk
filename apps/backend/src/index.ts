import { createServer } from "./server";
import config from "./config";
import { SchedulerService } from "./services/SchedulerService.js";

const server = createServer();
const port = config.port;

server.listen(port, () => {
  console.log(`🚀 Government Appointment Booking System API running on port ${port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌏 Timezone: ${config.timezone}`);
  console.log(`📋 API Documentation: http://localhost:${port}/api-docs (to be implemented)`);
  
  // Initialize and start the appointment reminder scheduler
  try {
    console.log('\n🕐 Initializing Appointment Reminder Scheduler...');
    SchedulerService.initialize();
    SchedulerService.start();
    console.log('✅ Appointment Reminder Scheduler started successfully\n');
  } catch (error) {
    console.error('❌ Failed to start Appointment Reminder Scheduler:', error);
    console.error('⚠️ Server will continue running, but reminders will not be sent automatically\n');
  }
});
