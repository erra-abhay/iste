const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const { generateToken, auth } = require('../middleware/auth');

// Rate limiter for login: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Password complexity validation
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

// @route   POST /api/auth/register
// @desc    Register a new admin (superadmin only)
// @access  Private
router.post('/register', auth, async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can create admins' });
    }

    const { email, password, name, role } = req.body;

    // Validate password complexity
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    const admin = new Admin({ email, password, name, role });
    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate admin & get token
// @access  Public (rate limited)
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin);

    res.json({
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current admin
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (error) {
    console.error('Get admin error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate new password complexity
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const admin = await Admin.findById(req.admin.id);
    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
