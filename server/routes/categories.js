const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

router.get('/', auth, categoryController.getAll);
router.post('/', auth, adminOnly, categoryController.create);
router.put('/:id', auth, adminOnly, categoryController.update);
router.delete('/:id', auth, adminOnly, categoryController.remove);

module.exports = router;
