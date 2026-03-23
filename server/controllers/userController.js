const { User, Borrow, Fine } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { student_id: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Borrow,
          as: 'borrows',
          limit: 10,
          order: [['created_at', 'DESC']],
        },
        {
          model: Fine,
          as: 'fines',
          where: { status: 'pending' },
          required: false,
        },
      ],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.toggleActive = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ is_active: !user.is_active });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    console.log('Delete request received for user ID:', req.params.id);
    console.log('Request user (admin):', req.user);
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Found user to delete:', user.name, user.role);
    
    // Prevent deleting admin users
    if (user.role === 'admin') {
      console.log('Cannot delete admin user');
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    // Check if user has active borrows
    const { Borrow } = require('../models');
    const activeBorrows = await Borrow.count({
      where: { user_id: user.id, status: 'active' }
    });
    
    console.log('Active borrows count:', activeBorrows);
    
    if (activeBorrows > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with active borrows. Please return all books first.' 
      });
    }
    
    console.log('Deleting user...');
    await user.destroy();
    console.log('User deleted successfully');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, student_id, department, phone } = req.body;
    
    // Users can only update their own profile
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Check if student_id is already taken by another user
    if (student_id && student_id !== user.student_id) {
      const existingUser = await User.findOne({ where: { student_id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Student ID already in use' });
      }
    }
    
    const updateData = { name, email, department, phone };
    if (student_id) updateData.student_id = student_id;
    
    await user.update(updateData);
    
    res.json({ 
      message: 'Profile updated successfully',
      user: user.toJSON() 
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Configure multer storage
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
    
    // File filter
    const fileFilter = (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    };
    
    const upload = multer({ 
      storage: storage,
      fileFilter: fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    });
    
    // Handle single file upload
    upload.single('avatar')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Delete old avatar if exists
        if (user.avatar_url) {
          const oldAvatarPath = path.join(__dirname, '../uploads', path.basename(user.avatar_url));
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }
        
        // Update user with new avatar URL
        const avatarUrl = `/uploads/${req.file.filename}`;
        await user.update({ avatar_url: avatarUrl });
        
        res.json({ 
          message: 'Avatar uploaded successfully',
          avatar_url: avatarUrl
        });
      } catch (error) {
        // Delete uploaded file if database update fails
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};
