import cron from 'node-cron';
import { ReminderService, ReminderStats } from './ReminderService.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

// Configure dayjs for Sri Lanka timezone
dayjs.extend(utc);
dayjs.extend(timezone);

export interface SchedulerStats {
  isRunning: boolean;
  lastRun: string | null;
  nextRun: string | null;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastStats: ReminderStats | null;
}

export class SchedulerService {
  private static readonly SRI_LANKA_TIMEZONE = 'Asia/Colombo';
  private static readonly REMINDER_CRON_SCHEDULE = '0 9 * * *'; // Daily at 9:00 AM
  
  private static cronJob: cron.ScheduledTask | null = null;
  private static schedulerStats: SchedulerStats = {
    isRunning: false,
    lastRun: null,
    nextRun: null,
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    lastStats: null
  };

  /**
   * Initialize and start the scheduler service
   */
  static initialize(): void {
    console.log('🚀 Initializing Appointment Reminder Scheduler...');
    
    // Validate cron schedule
    if (!cron.validate(this.REMINDER_CRON_SCHEDULE)) {
      throw new Error(`Invalid cron schedule: ${this.REMINDER_CRON_SCHEDULE}`);
    }

    // Create the cron job
    this.cronJob = cron.schedule(
      this.REMINDER_CRON_SCHEDULE,
      this.executeReminderJob.bind(this),
      {
        scheduled: false, // Don't start immediately
        timezone: this.SRI_LANKA_TIMEZONE
      }
    );

    console.log(`⏰ Scheduler configured to run daily at 9:00 AM (${this.SRI_LANKA_TIMEZONE})`);
    console.log(`📋 Next execution will be: ${this.getNextExecutionTime()}`);
  }

  /**
   * Start the scheduler
   */
  static start(): void {
    if (!this.cronJob) {
      throw new Error('Scheduler not initialized. Call initialize() first.');
    }

    if (this.schedulerStats.isRunning) {
      console.log('⚠️ Scheduler is already running');
      return;
    }

    this.cronJob.start();
    this.schedulerStats.isRunning = true;
    this.schedulerStats.nextRun = this.getNextExecutionTime();

    console.log('✅ Appointment Reminder Scheduler started successfully');
    console.log(`📅 Next reminder job scheduled for: ${this.schedulerStats.nextRun}`);
  }

  /**
   * Stop the scheduler
   */
  static stop(): void {
    if (!this.cronJob) {
      console.log('⚠️ No scheduler to stop');
      return;
    }

    if (!this.schedulerStats.isRunning) {
      console.log('⚠️ Scheduler is already stopped');
      return;
    }

    this.cronJob.stop();
    this.schedulerStats.isRunning = false;
    this.schedulerStats.nextRun = null;

    console.log('⏹️ Appointment Reminder Scheduler stopped');
  }

  /**
   * Restart the scheduler
   */
  static restart(): void {
    console.log('🔄 Restarting Appointment Reminder Scheduler...');
    this.stop();
    this.start();
  }

  /**
   * Execute the reminder job (called by cron)
   */
  private static async executeReminderJob(): Promise<void> {
    const executionId = this.generateExecutionId();
    const currentTime = dayjs().tz(this.SRI_LANKA_TIMEZONE).format('YYYY-MM-DD HH:mm:ss');

    console.log(`\n🔄 [${executionId}] Starting scheduled reminder job at ${currentTime}`);
    console.log('=' .repeat(60));

    this.schedulerStats.totalRuns++;
    this.schedulerStats.lastRun = currentTime;
    this.schedulerStats.nextRun = this.getNextExecutionTime();

    try {
      // Execute the reminder service
      const stats = await ReminderService.sendTomorrowReminders();
      
      // Update scheduler stats
      this.schedulerStats.successfulRuns++;
      this.schedulerStats.lastStats = stats;

      console.log(`✅ [${executionId}] Reminder job completed successfully`);
      console.log(`📊 [${executionId}] Results: ${stats.citizenReminders} citizens, ${stats.officerReminders} officers notified`);
      
      if (stats.failures > 0) {
        console.log(`⚠️ [${executionId}] ${stats.failures} failures encountered during execution`);
      }

    } catch (error) {
      this.schedulerStats.failedRuns++;
      console.error(`❌ [${executionId}] Reminder job failed:`, error);
      
      // Log the error for monitoring
      this.logSchedulerError(executionId, error);
    }

    console.log('=' .repeat(60));
    console.log(`📅 [${executionId}] Next execution scheduled for: ${this.schedulerStats.nextRun}\n`);
  }

  /**
   * Manually trigger reminder job (for admin use)
   */
  static async triggerManualExecution(reason?: string): Promise<ReminderStats> {
    const executionId = this.generateExecutionId();
    const currentTime = dayjs().tz(this.SRI_LANKA_TIMEZONE).format('YYYY-MM-DD HH:mm:ss');

    console.log(`\n🔄 [${executionId}] Starting MANUAL reminder job at ${currentTime}`);
    console.log(`📝 [${executionId}] Reason: ${reason || 'Admin triggered'}`);
    console.log('=' .repeat(60));

    try {
      const stats = await ReminderService.sendTomorrowReminders();
      
      console.log(`✅ [${executionId}] Manual reminder job completed successfully`);
      console.log(`📊 [${executionId}] Results: ${stats.citizenReminders} citizens, ${stats.officerReminders} officers notified`);
      
      return stats;

    } catch (error) {
      console.error(`❌ [${executionId}] Manual reminder job failed:`, error);
      this.logSchedulerError(executionId, error);
      throw error;
    } finally {
      console.log('=' .repeat(60));
    }
  }

  /**
   * Get current scheduler status and statistics
   */
  static getStatus(): SchedulerStats {
    return {
      ...this.schedulerStats,
      nextRun: this.schedulerStats.isRunning ? this.getNextExecutionTime() : null
    };
  }

  /**
   * Get next execution time in Sri Lanka timezone
   */
  private static getNextExecutionTime(): string {
    if (!this.cronJob) return 'Unknown';

    try {
      // Calculate next execution based on cron schedule
      const now = dayjs().tz(this.SRI_LANKA_TIMEZONE);
      const today9AM = now.hour(9).minute(0).second(0).millisecond(0);
      
      let nextExecution;
      if (now.isBefore(today9AM)) {
        // If it's before 9 AM today, next execution is today at 9 AM
        nextExecution = today9AM;
      } else {
        // If it's after 9 AM today, next execution is tomorrow at 9 AM
        nextExecution = today9AM.add(1, 'day');
      }

      return nextExecution.format('YYYY-MM-DD HH:mm:ss [Sri Lanka Time]');
    } catch (error) {
      console.error('Error calculating next execution time:', error);
      return 'Calculation Error';
    }
  }

  /**
   * Generate unique execution ID for logging
   */
  private static generateExecutionId(): string {
    const timestamp = dayjs().format('YYYYMMDD-HHmmss');
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `REM-${timestamp}-${random}`;
  }

  /**
   * Log scheduler errors for monitoring
   */
  private static logSchedulerError(executionId: string, error: any): void {
    const errorLog = {
      executionId,
      timestamp: dayjs().tz(this.SRI_LANKA_TIMEZONE).format(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      schedulerStats: this.schedulerStats
    };

    // Log to console (in production, this would go to a logging service)
    console.error(`💥 [${executionId}] Scheduler Error Details:`, JSON.stringify(errorLog, null, 2));
  }

  /**
   * Health check for the scheduler
   */
  static healthCheck(): {
    status: 'healthy' | 'unhealthy';
    details: {
      isInitialized: boolean;
      isRunning: boolean;
      lastRun: string | null;
      nextRun: string | null;
      errorRate: number;
    };
  } {
    const errorRate = this.schedulerStats.totalRuns > 0 
      ? (this.schedulerStats.failedRuns / this.schedulerStats.totalRuns) * 100 
      : 0;

    const isHealthy = this.cronJob !== null && 
                     this.schedulerStats.isRunning &&
                     errorRate < 50; // Consider unhealthy if more than 50% failure rate

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      details: {
        isInitialized: this.cronJob !== null,
        isRunning: this.schedulerStats.isRunning,
        lastRun: this.schedulerStats.lastRun,
        nextRun: this.schedulerStats.nextRun,
        errorRate: Math.round(errorRate * 100) / 100
      }
    };
  }

  /**
   * Get detailed scheduler information for debugging
   */
  static getDebugInfo(): any {
    return {
      cronSchedule: this.REMINDER_CRON_SCHEDULE,
      timezone: this.SRI_LANKA_TIMEZONE,
      currentTime: dayjs().tz(this.SRI_LANKA_TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
      cronJobExists: this.cronJob !== null,
      schedulerStats: this.schedulerStats,
      healthCheck: this.healthCheck()
    };
  }
}
