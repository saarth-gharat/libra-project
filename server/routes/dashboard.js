const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/admin', auth, adminOnly, dashboardController.adminStats);
router.get('/student', auth, dashboardController.studentStats);

module.exports = router;
