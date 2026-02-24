const express = require('express');
const User = require('../models/User');
const Client = require('../models/Client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/clients
// @desc    Get all clients (trainer only)
// @access  Private/Trainer
router.get('/', auth, authorize('trainer'), async (req, res) => {
  try {
    const clients = await Client.find({})
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      clients
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/clients/my-profile
// @desc    Get current client's profile
// @access  Private/Client
router.get('/my-profile', auth, authorize('client'), async (req, res) => {
  try {
    const client = await Client.findOne({ user: req.user._id })
      .populate('user', 'username email');
    
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    res.json({
      success: true,
      client
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/clients
// @desc    Create new client (trainer only)
// @access  Private/Trainer
router.post('/', auth, authorize('trainer'), async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      emergencyContact,
      membershipType
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Create user account for client
    const user = new User({
      username,
      email,
      password,
      role: 'client'
    });

    await user.save();

    // Create client profile
    const client = new Client({
      user: user._id,
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      emergencyContact,
      membershipType
    });

    await client.save();

    // Populate user data
    await client.populate('user', 'username email');

    res.status(201).json({
      success: true,
      client
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('user', 'username email');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Clients can only access their own profile
    if (req.user.role === 'client' && client.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      client
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check permissions
    if (req.user.role === 'client' && client.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      emergencyContact,
      membershipType,
      isActive
    } = req.body;

    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    
    // Only trainers can update membership type and active status
    if (req.user.role === 'trainer') {
      if (membershipType) updateData.membershipType = membershipType;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'username email');

    res.json({
      success: true,
      client: updatedClient
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client (trainer only)
// @access  Private/Trainer
router.delete('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Delete client profile
    await Client.findByIdAndDelete(req.params.id);
    
    // Delete user account
    await User.findByIdAndDelete(client.user);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;