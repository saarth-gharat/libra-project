const { Notification, User, Borrow, Book } = require('../models');
const emailService = require('./emailService');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    // Initialize Twilio client only if credentials are provided and valid
    if (process.env.TWILIO_ACCOUNT_SID && 
        process.env.TWILIO_AUTH_TOKEN && 
        process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      try {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log('Twilio client initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize Twilio client:', error.message);
        this.twilioClient = null;
      }
    } else {
      this.twilioClient = null;
      if (process.env.TWILIO_ACCOUNT_SID) {
        console.warn('Twilio not configured properly - SMS notifications disabled');
      }
    }
  }

  // Create notification and send via all configured channels
  async createNotification(userId, title, message, type = 'info', entityType = null, entityId = null) {
    try {
      // Create notification record
      const notification = await Notification.create({
        user_id: userId,
        title,
        message,
        type,
        related_entity_type: entityType,
        related_entity_id: entityId,
      });

      // Get user details for contact info
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      // Send email notification if enabled
      if (user.email && !notification.is_emailed) {
        await this.sendEmailNotification(user, title, message, type);
        await notification.update({ is_emailed: true });
      }

      // Send SMS notification if phone number exists and SMS is enabled
      if (user.phone_number && this.twilioClient && !notification.is_sms_sent) {
        await this.sendSMSNotification(user, message);
        await notification.update({ is_sms_sent: true });
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send email notification
  async sendEmailNotification(user, title, message, type) {
    try {
      const mailOptions = {
        from: `"LIBRA.ONE" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `[${type.toUpperCase()}] ${title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 40px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">LIBRA.ONE</h1>
                        <p style="color: #e0e7ff; margin: 10px 0 0; font-size: 16px;">Digital Library Platform</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">${title}</h2>
                        
                        <div style="background-color: ${this.getEmailTypeColor(type)}; border-left: 4px solid ${this.getEmailBorderColor(type)}; padding: 20px; margin: 20px 0;">
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">${message}</p>
                        </div>
                        
                        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                          You can view all your notifications in the LIBRA.ONE web application.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
                          © ${new Date().getFullYear()} LIBRA.ONE. All rights reserved.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                          This is an automated notification. Please do not reply to this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

      const info = await emailService.transporter.sendMail(mailOptions);
      console.log(`Email notification sent to ${user.email}:`, info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  // Send SMS notification
  async sendSMSNotification(user, message) {
    if (!this.twilioClient) {
      console.warn('Twilio not configured - SMS notification skipped');
      return;
    }

    try {
      const sms = await this.twilioClient.messages.create({
        body: `[LIBRA.ONE] ${message.substring(0, 160)}`, // SMS character limit
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone_number,
      });

      console.log(`SMS notification sent to ${user.phone_number}:`, sms.sid);
      return sms;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      throw error;
    }
  }

  // Check for upcoming due dates and send reminders
  async sendDueDateReminders() {
    try {
      console.log('Checking for upcoming due dates...');
      
      const today = new Date();
      const reminderThresholds = [7, 3, 1]; // Days before due date to send reminders
      
      for (const days of reminderThresholds) {
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + days);
        
        // Find borrows due on the reminder date
        const upcomingBorrows = await Borrow.findAll({
          where: {
            due_date: reminderDate,
            status: 'active',
          },
          include: [
            { model: User, as: 'user' },
            { model: Book, as: 'book' },
          ],
        });

        console.log(`Found ${upcomingBorrows.length} borrows due in ${days} days`);

        for (const borrow of upcomingBorrows) {
          const user = borrow.user;
          const book = borrow.book;
          
          if (!user || !book) continue;

          const dueDateFormatted = new Date(borrow.due_date).toLocaleDateString();
          const daysText = days === 1 ? 'tomorrow' : `in ${days} days`;
          
          const title = `Book Due Soon - ${book.title}`;
          const message = `Reminder: "${book.title}" by ${book.author} is due ${daysText} on ${dueDateFormatted}. Please return it on time.`;
          const type = days <= 3 ? 'warning' : 'info';

          // Check if reminder already sent for this borrow and threshold
          const existingNotification = await Notification.findOne({
            where: {
              user_id: user.id,
              related_entity_type: 'borrow',
              related_entity_id: borrow.id,
              title: title,
            },
          });

          if (!existingNotification) {
            await this.createNotification(
              user.id,
              title,
              message,
              type,
              'borrow',
              borrow.id
            );
            
            // Also notify admin about upcoming due dates
            await this.notifyAdminAboutUpcomingDue(borrow, user, book, days);
          }
        }
      }
    } catch (error) {
      console.error('Error sending due date reminders:', error);
    }
  }

  // Notify admin about upcoming due dates
  async notifyAdminAboutUpcomingDue(borrow, user, book, days) {
    try {
      const adminUsers = await User.findAll({
        where: { role: 'admin' },
      });

      const dueDateFormatted = new Date(borrow.due_date).toLocaleDateString();
      const daysText = days === 1 ? 'tomorrow' : `in ${days} days`;

      const title = `Upcoming Due Date Alert`;
      const message = `Student ${user.name} (${user.email}) has "${book.title}" due ${daysText} on ${dueDateFormatted}.`;

      for (const admin of adminUsers) {
        await this.createNotification(
          admin.id,
          title,
          message,
          'info',
          'borrow',
          borrow.id
        );
      }
    } catch (error) {
      console.error('Error notifying admin:', error);
    }
  }

  // Check for overdue books
  async sendOverdueNotifications() {
    try {
      console.log('Checking for overdue books...');
      
      const today = new Date();
      
      // Find overdue borrows
      const overdueBorrows = await Borrow.findAll({
        where: {
          due_date: { [require('sequelize').Op.lt]: today },
          status: 'active',
        },
        include: [
          { model: User, as: 'user' },
          { model: Book, as: 'book' },
        ],
      });

      console.log(`Found ${overdueBorrows.length} overdue borrows`);

      for (const borrow of overdueBorrows) {
        const user = borrow.user;
        const book = borrow.book;
        
        if (!user || !book) continue;

        const dueDateFormatted = new Date(borrow.due_date).toLocaleDateString();
        const daysOverdue = Math.floor((today - new Date(borrow.due_date)) / (1000 * 60 * 60 * 24));
        const daysText = daysOverdue === 1 ? '1 day' : `${daysOverdue} days`;
        
        const title = `OVERDUE: ${book.title}`;
        const message = `URGENT: "${book.title}" by ${book.author} was due on ${dueDateFormatted} (${daysText} overdue). Please return immediately to avoid fines.`;
        const type = 'error';

        // Check if overdue notification already sent
        const existingNotification = await Notification.findOne({
          where: {
            user_id: user.id,
            related_entity_type: 'borrow',
            related_entity_id: borrow.id,
            title: { [require('sequelize').Op.like]: 'OVERDUE%' },
          },
        });

        if (!existingNotification) {
          await this.createNotification(
            user.id,
            title,
            message,
            type,
            'borrow',
            borrow.id
          );
          
          // Notify admin about overdue books
          await this.notifyAdminAboutOverdue(borrow, user, book, daysOverdue);
        }
      }
    } catch (error) {
      console.error('Error sending overdue notifications:', error);
    }
  }

  // Notify admin about overdue books
  async notifyAdminAboutOverdue(borrow, user, book, daysOverdue) {
    try {
      const adminUsers = await User.findAll({
        where: { role: 'admin' },
      });

      const dueDateFormatted = new Date(borrow.due_date).toLocaleDateString();
      const daysText = daysOverdue === 1 ? '1 day' : `${daysOverdue} days`;

      const title = `Overdue Book Alert`;
      const message = `Student ${user.name} (${user.email}) has "${book.title}" overdue by ${daysText} (due: ${dueDateFormatted}).`;

      for (const admin of adminUsers) {
        await this.createNotification(
          admin.id,
          title,
          message,
          'error',
          'borrow',
          borrow.id
        );
      }
    } catch (error) {
      console.error('Error notifying admin about overdue:', error);
    }
  }

  // Helper methods
  getEmailTypeColor(type) {
    const colors = {
      info: '#dbeafe',
      warning: '#fef3c7',
      success: '#dcfce7',
      error: '#fee2e2',
    };
    return colors[type] || colors.info;
  }

  getEmailBorderColor(type) {
    const colors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      success: '#10b981',
      error: '#ef4444',
    };
    return colors[type] || colors.info;
  }
}

module.exports = new NotificationService();