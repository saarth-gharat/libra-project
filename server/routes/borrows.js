const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { auth, adminOnly } = require('../middleware/auth');
const borrowController = require('../controllers/borrowController');

router.get('/', auth, borrowController.getAll);
router.get('/my', auth, borrowController.getMyBorrows);

router.post(
  '/issue',
  auth,
  adminOnly,
  [
    body('user_id').isInt().withMessage('User ID is required'),
    body('book_id').isInt().withMessage('Book ID is required'),
  ],
  validate,
  borrowController.issueBook
);

router.patch('/:id/return', auth, adminOnly, borrowController.returnBook);

module.exports = router;
