const cron = require('node-cron');
const notificationService = require('./notificationService');

class SchedulerService {
  constructor() {
    this.tasks = [];
  }

  // Start all scheduled tasks
  start() {
    console.log('Starting notification scheduler...');
    
    // Run due date reminders every day at 9 AM
    const dailyReminders = cron.schedule('0 9 * * *', async () => {
      console.log('Running daily due date reminders...');
      await notificationService.sendDueDateReminders();
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata" // Adjust timezone as needed
    });
    
    this.tasks.push({ name: 'daily-reminders', task: dailyReminders });
    
    // Run overdue checks every day at 10 AM
    const overdueChecks = cron.schedule('0 10 * * *', async () => {
      console.log('Running daily overdue checks...');
      await notificationService.sendOverdueNotifications();
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata"
    });
    
    this.tasks.push({ name: 'overdue-checks', task: overdueChecks });
    
    // Run quick overdue check every 6 hours (for urgent notifications)
    const quickOverdueCheck = cron.schedule('0 */6 * * *', async () => {
      console.log('Running quick overdue check...');
      await notificationService.sendOverdueNotifications();
    }, {
      scheduled: false,
      timezone: "Asia/Kolkata"
    });
    
    this.tasks.push({ name: 'quick-overdue-check', task: quickOverdueCheck });
    
    // Start all tasks
    this.tasks.forEach(({ task }) => task.start());
    
    console.log(`Scheduler started with ${this.tasks.length} tasks`);
  }

  // Stop all scheduled tasks
  stop() {
    console.log('Stopping notification scheduler...');
    this.tasks.forEach(({ name, task }) => {
      task.stop();
      console.log(`Stopped task: ${name}`);
    });
    this.tasks = [];
  }

  // Run manual check for testing
  async runManualCheck() {
    console.log('Running manual notification check...');
    await notificationService.sendDueDateReminders();
    await notificationService.sendOverdueNotifications();
    console.log('Manual check completed');
  }

  // Get task status
  getStatus() {
    return this.tasks.map(({ name, task }) => ({
      name,
      running: task.running,
    }));
  }
}

module.exports = new SchedulerService();