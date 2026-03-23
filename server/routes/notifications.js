const router = require('express').Router();
const { auth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', auth, notificationController.getAll);
router.patch('/:id/read', auth, notificationController.markRead);
router.patch('/read-all', auth, notificationController.markAllRead);

// Admin routes
router.post('/trigger-check', auth, notificationController.triggerNotificationCheck);
router.get('/scheduler-status', auth, notificationController.getSchedulerStatus);

module.exports = router;
