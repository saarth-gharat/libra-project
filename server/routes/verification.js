const router = require('express').Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Verify email endpoint (no auth required as it's for verification)
router.get('/verify-email', authController.verifyEmail);

// Resend verification email (can be called without auth for unverified users)
router.post('/resend-verification', authController.resendVerificationEmail);

// Check if user is verified (for protected routes)
router.get('/check-verification', auth, async (req, res) => {
  try {
    res.json({ 
      verified: req.user.email_verified,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        email_verified: req.user.email_verified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking verification status' });
  }
});

module.exports = router;