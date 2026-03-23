const jwt = require('jsonwebtoken');
const { User, ActivityLog } = require('../models');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const { Op } = require('sequelize');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, student_id, department } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Generate verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      student_id,
      department,
      email_verification_token: emailVerificationToken,
      email_verification_expires: emailVerificationExpires,
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, name, emailVerificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    await ActivityLog.create({
      user_id: user.id,
      action: 'register',
      entity_type: 'user',
      entity_id: user.id,
      description: `${user.name} registered as ${user.role}`,
    });

    // Don't automatically log in - user needs to verify email first
    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await ActivityLog.create({
      user_id: user.id,
      action: 'login',
      entity_type: 'user',
      entity_id: user.id,
      description: `${user.name} logged in`,
    });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, department, student_id } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (department) user.department = department;
    if (student_id) user.student_id = student_id;

    await user.save();
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ message: 'Invalid verification link' });
    }

    const user = await User.findOne({ 
      where: { 
        email: email,
        email_verification_token: token,
        email_verification_expires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user as verified
    user.email_verified = true;
    user.email_verification_token = null;
    user.email_verification_expires = null;
    user.is_active = true;
    
    await user.save();

    await ActivityLog.create({
      user_id: user.id,
      action: 'email_verified',
      entity_type: 'user',
      entity_id: user.id,
      description: `${user.name} verified their email address`,
    });

    // Generate token for automatic login after verification
    const jwtToken = generateToken(user);
    
    res.status(200).json({
      message: 'Email verified successfully!',
      user,
      token: jwtToken
    });
  } catch (error) {
    next(error);
  }
};

exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Check if verification token is still valid
    if (user.email_verification_expires && user.email_verification_expires > new Date()) {
      return res.status(400).json({ 
        message: 'Verification email already sent. Please check your inbox or wait for token to expire.' 
      });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.email_verification_token = emailVerificationToken;
    user.email_verification_expires = emailVerificationExpires;
    
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, user.name, emailVerificationToken);
      res.status(200).json({ message: 'Verification email sent successfully!' });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
    }
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    await ActivityLog.create({
      user_id: user.id,
      action: 'password_change',
      entity_type: 'user',
      entity_id: user.id,
      description: `${user.name} changed their password`,
    });

    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    next(error);
  }
};

// Password Reset - Request reset code
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account exists with this email, a reset code has been sent.' 
      });
    }

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.password_reset_code = resetCode;
    user.password_reset_expires = resetCodeExpires;
    await user.save();

    // Send reset code via email
    try {
      await emailService.sendPasswordResetEmail(email, user.name, resetCode);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    res.status(200).json({ 
      message: 'If an account exists with this email, a reset code has been sent.' 
    });
  } catch (error) {
    next(error);
  }
};

// Password Reset - Verify code
exports.verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User.findOne({ 
      where: { 
        email,
        password_reset_code: code,
        password_reset_expires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    res.status(200).json({ message: 'Code verified successfully' });
  } catch (error) {
    next(error);
  }
};

// Password Reset - Reset password with verified code
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ 
      where: { 
        email,
        password_reset_code: code,
        password_reset_expires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Update password
    user.password = newPassword;
    user.password_reset_code = null;
    user.password_reset_expires = null;
    await user.save();

    await ActivityLog.create({
      user_id: user.id,
      action: 'password_reset',
      entity_type: 'user',
      entity_id: user.id,
      description: `${user.name} reset their password`,
    });

    res.json({ message: 'Password reset successfully! You can now login with your new password.' });
  } catch (error) {
    next(error);
  }
};
