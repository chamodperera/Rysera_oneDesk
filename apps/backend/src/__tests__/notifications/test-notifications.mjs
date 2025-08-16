<<<<<<< HEAD
// Test script for notification functionality
import { NotificationService } from "../../services/NotificationService.js";
import { notificationRepository } from "../../models/index.js";
import { NotificationType, NotificationStatus } from "../../types/database.js";
=======
// Test script for notification functionality  
// Note: Run this after building the project with 'npm run build'
import { NotificationService } from '../../services/NotificationService.js';
import { notificationRepository } from '../../models/index.js';
import { NotificationType, NotificationStatus } from '../../types/database.js';
>>>>>>> 4d897a338bde0419d0e384055dc05554f448f102

console.log("🧪 Testing Notification Module...");

async function testNotificationModule() {
  try {
    console.log("📧 Testing notification service...");

    // Test 1: Send a test notification
    const testUserId = 20; // Using our test user
    const testEmail = "test@example.com"; // Replace with a real email for testing

    console.log(`📤 Sending test notification to user ${testUserId}...`);

    const success = await NotificationService.sendGenericNotification(
      testUserId,
      testEmail,
      "Test Notification",
      "This is a test notification from the system.",
      "<h2>Test Notification</h2><p>This is a test notification from the system.</p>"
    );

    if (success) {
      console.log("✅ Notification sent successfully!");
    } else {
      console.log("❌ Failed to send notification");
    }

    // Test 2: Get user notifications
    console.log(`📋 Fetching notifications for user ${testUserId}...`);

    const { notifications, total } = await notificationRepository.findByUserId(
      testUserId,
      {
        limit: 5,
        offset: 0,
      }
    );

    console.log(`📊 Found ${total} total notifications for user ${testUserId}`);
    console.log("🔍 Recent notifications:");
    notifications.forEach((notification) => {
      console.log(
        `  - ID: ${notification.id}, Type: ${notification.type}, Status: ${notification.status}, Message: ${notification.message.substring(0, 50)}...`
      );
    });

    // Test 3: Test rate limiting
    console.log("⚡ Testing rate limiting...");

    const canSend = await notificationRepository.canSendNotification(
      testUserId,
      10
    );
    console.log(`📊 Can send more notifications: ${canSend}`);

    // Test 4: Get notification statistics
    console.log("📈 Testing notification statistics...");

    const { notifications: allNotifications } =
      await notificationRepository.findAllWithFilters({
        limit: 100,
        offset: 0,
      });

    const statusCounts = {};
    const typeCounts = {};

    allNotifications.forEach((notification) => {
      statusCounts[notification.status] =
        (statusCounts[notification.status] || 0) + 1;
      typeCounts[notification.type] = (typeCounts[notification.type] || 0) + 1;
    });

    console.log("📊 Notification counts by status:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });

    console.log("📊 Notification counts by type:");
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
<<<<<<< HEAD
testNotificationModule()
  .then(() => {
    console.log("✅ Notification module test completed");
  })
  .catch((error) => {
    console.error("❌ Test error:", error);
  });
V;
=======
testNotificationModule().then(() => {
  console.log('✅ Notification module test completed');
}).catch(error => {
  console.error('❌ Test error:', error);
});
>>>>>>> 4d897a338bde0419d0e384055dc05554f448f102
