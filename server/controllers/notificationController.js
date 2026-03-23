const { Notification } = require('../models');
const notificationService = require('../services/notificationService');
const schedulerService = require('../services/schedulerService');

exports.getAll = async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    const unreadCount = await Notification.count({
      where: { user_id: req.user.id, is_read: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    await notification.update({ is_read: true });
    res.json({ notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Trigger manual notification check (for testing/admin)
exports.triggerNotificationCheck = async (req, res, next) => {
  try {
    // Only allow admins to trigger manual checks
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await schedulerService.runManualCheck();
    
    res.json({ 
      message: 'Notification check completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Get scheduler status (admin only)
exports.getSchedulerStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const status = schedulerService.getStatus();
    
    res.json({ 
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
