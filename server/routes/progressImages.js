const express = require('express');
const ProgressImage = require('../models/ProgressImage');
const Client = require('../models/Client');
const { auth, authorize } = require('../middleware/auth');
const { upload, cloudinary } = require('../config/localStorage'); // Using local storage
const path = require('path');

const router = express.Router();

// @route   POST /api/progress-images/upload
// @desc    Upload progress image (client only)
// @access  Private/Client
router.post('/upload', auth, authorize('client'), upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('User:', req.user);
    console.log('File:', req.file);
    console.log('Body:', req.body);
    
    if (!req.file) {
      console.log('No file provided');
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Get client profile
    console.log('Looking for client with user ID:', req.user._id);
    const client = await Client.findOne({ user: req.user._id });
    console.log('Client found:', client);
    
    if (!client) {
      console.log('Client profile not found');
      return res.status(404).json({ message: 'Client profile not found' });
    }

    // Create progress image record
    const serverUrl = process.env.SERVER_URL || 'https://tracking-system-a7ib.onrender.com';
    const imageUrl = `${serverUrl}/uploads/${req.file.filename}`;
    console.log('Creating progress image with URL:', imageUrl);
    
    const progressImage = new ProgressImage({
      clientId: client._id,
      imageUrl: imageUrl,
      publicId: req.file.filename,
      description: req.body.description || ''
    });

    console.log('Saving progress image...');
    await progressImage.save();
    console.log('Progress image saved successfully');

    res.status(201).json({
      success: true,
      message: 'Progress image uploaded successfully',
      image: progressImage
    });
  } catch (error) {
    console.error('Error in progress image upload:', error);
    // If there was an error, delete the uploaded file from local storage
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Failed to delete file from local storage:', deleteError);
      }
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress-images/my-images
// @desc    Get current client's progress images
// @access  Private/Client
router.get('/my-images', auth, authorize('client'), async (req, res) => {
  try {
    // Get client profile
    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    const images = await ProgressImage.find({ clientId: client._id })
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      images
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress-images/client/:clientId
// @desc    Get progress images for specific client (trainer only)
// @access  Private/Trainer
router.get('/client/:clientId', auth, authorize('trainer'), async (req, res) => {
  try {
    const { clientId } = req.params;
    const { sortBy = 'uploadedAt', order = 'desc' } = req.query;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const images = await ProgressImage.find({ clientId })
      .sort({ [sortBy]: sortOrder });

    res.json({
      success: true,
      images,
      clientName: `${client.firstName} ${client.lastName}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/progress-images/all
// @desc    Get all progress images (trainer only)
// @access  Private/Trainer
router.get('/all', auth, authorize('trainer'), async (req, res) => {
  try {
    const images = await ProgressImage.find({})
      .populate('clientId', 'firstName lastName')
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      images
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/progress-images/:id
// @desc    Delete progress image (client can delete own, trainer can delete any)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await ProgressImage.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Progress image not found' });
    }

    // Check permissions
    if (req.user.role === 'client') {
      const client = await Client.findOne({ user: req.user._id });
      if (!client || !client._id.equals(image.clientId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    // Trainers can delete any image (no additional check needed)

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (cloudinaryError) {
      console.error('Failed to delete image from Cloudinary:', cloudinaryError);
    }

    // Delete from database
    await ProgressImage.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Progress image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
