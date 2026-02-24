const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Registration disabled - trainer is predefined
// @access  Disabled
router.post('/register', async (req, res) => {
  return res.status(403).json({ 
    message: 'Registration is disabled. Please contact the administrator.' 
  });
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Found user:', user.email);
    console.log('Stored password hash:', user.password);
    console.log('Input password:', password);

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    console.log('Password match result:', isPasswordMatch);
    
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    let userData = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    };

    // If user is a client, get their client profile
    if (req.user.role === 'client') {
      const clientProfile = await Client.findOne({ user: req.user._id });
      if (clientProfile) {
        userData.clientProfile = clientProfile;
      }
    }

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;