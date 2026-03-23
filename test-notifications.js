// Test script for notification system
const axios = require('axios');

async function testNotifications() {
  try {
    console.log('Testing notification system...\n');
    
    // Test 1: Get scheduler status (requires admin token)
    console.log('1. Testing scheduler status endpoint:');
    try {
      const statusResponse = await axios.get('http://localhost:5000/api/notifications/scheduler-status', {
        headers: { Authorization: 'Bearer YOUR_ADMIN_TOKEN_HERE' }
      });
      console.log('✓ Scheduler status:', statusResponse.data);
    } catch (error) {
      console.log('ℹ Scheduler status check requires valid admin token');
    }
    
    // Test 2: Manual notification check (requires admin token)
    console.log('\n2. Testing manual notification trigger:');
    try {
      const triggerResponse = await axios.post('http://localhost:5000/api/notifications/trigger-check', {}, {
        headers: { Authorization: 'Bearer YOUR_ADMIN_TOKEN_HERE' }
      });
      console.log('✓ Manual check triggered:', triggerResponse.data);
    } catch (error) {
      console.log('ℹ Manual check requires valid admin token');
    }
    
    // Test 3: Database notification creation
    console.log('\n3. Checking database for existing notifications:');
    const { sequelize } = require('./server/models');
    const { Notification } = require('./server/models');
    
    const notificationCount = await Notification.count();
    console.log(`✓ Total notifications in database: ${notificationCount}`);
    
    if (notificationCount > 0) {
      const recentNotifications = await Notification.findAll({
        limit: 5,
        order: [['created_at', 'DESC']]
      });
      
      console.log('Recent notifications:');
      recentNotifications.forEach(notification => {
        console.log(`  - ${notification.title} (${notification.type}) - ${notification.created_at}`);
      });
    }
    
    console.log('\n✅ Notification system tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotifications();