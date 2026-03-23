const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/', auth, adminOnly, userController.getAll);
router.get('/:id', auth, adminOnly, userController.getById);
router.put('/profile', auth, userController.updateProfile);
router.post('/avatar', auth, userController.uploadAvatar);
router.patch('/:id/toggle-active', auth, adminOnly, userController.toggleActive);
router.delete('/:id', auth, adminOnly, userController.remove);

module.exports = router;
