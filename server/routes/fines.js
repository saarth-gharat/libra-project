const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const fineController = require('../controllers/fineController');

router.get('/', auth, fineController.getAll);
router.patch('/:id/pay', auth, adminOnly, fineController.payFine);
router.patch('/:id/waive', auth, adminOnly, fineController.waiveFine);

module.exports = router;
