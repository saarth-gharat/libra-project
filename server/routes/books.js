const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { auth, adminOnly } = require('../middleware/auth');
const bookController = require('../controllers/bookController');

router.get('/', auth, bookController.getAll);
router.get('/search', auth, bookController.search);
router.get('/:id', auth, bookController.getById);

router.post(
  '/',
  auth,
  adminOnly,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('total_copies').isInt({ min: 1 }).withMessage('At least 1 copy required'),
  ],
  validate,
  bookController.create
);

router.put('/:id', auth, adminOnly, bookController.update);
router.delete('/:id', auth, adminOnly, bookController.remove);

module.exports = router;
