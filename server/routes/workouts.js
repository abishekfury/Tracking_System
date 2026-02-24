const express = require('express');
const WorkoutPlan = require('../models/WorkoutPlan');
const Client = require('../models/Client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/workouts
// @desc    Get all workout plans (trainer only)
// @access  Private/Trainer
router.get('/', auth, authorize('trainer'), async (req, res) => {
  try {
    const { clientId, isActive, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (clientId) {
      query.client = clientId;
    }
    
    if (typeof isActive === 'string') {
      query.isActive = isActive === 'true';
    }

    const workoutPlans = await WorkoutPlan.find(query)
      .populate('client', 'firstName lastName')
      .populate('createdBy', 'username')
      .sort({ lastUpdated: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WorkoutPlan.countDocuments(query);

    res.json({
      success: true,
      workoutPlans,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/workouts/my-plan
// @desc    Get current client's workout plan
// @access  Private/Client
router.get('/my-plan', auth, authorize('client'), async (req, res) => {
  try {
    // Get client profile
    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    const workoutPlan = await WorkoutPlan.findOne({ 
      client: client._id, 
      isActive: true 
    }).populate('createdBy', 'username');

    if (!workoutPlan) {
      return res.status(404).json({ message: 'No active workout plan found' });
    }

    res.json({
      success: true,
      workoutPlan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/workouts
// @desc    Create workout plan (trainer only)
// @access  Private/Trainer
router.post('/', auth, authorize('trainer'), async (req, res) => {
  try {
    const { 
      clientId, 
      title, 
      description, 
      exercises, 
      daysPerWeek, 
      duration 
    } = req.body;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Deactivate existing workout plans for this client
    await WorkoutPlan.updateMany(
      { client: clientId, isActive: true },
      { isActive: false }
    );

    const workoutPlan = new WorkoutPlan({
      client: clientId,
      title,
      description,
      exercises,
      daysPerWeek,
      duration,
      createdBy: req.user._id
    });

    await workoutPlan.save();
    await workoutPlan.populate('client', 'firstName lastName');
    await workoutPlan.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      workoutPlan
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/workouts/:id
// @desc    Get workout plan by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id)
      .populate('client', 'firstName lastName user')
      .populate('createdBy', 'username');
    
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Clients can only access their own workout plans
    if (req.user.role === 'client' && workoutPlan.client.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      workoutPlan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/workouts/:id
// @desc    Update workout plan (trainer only)
// @access  Private/Trainer
router.put('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      exercises, 
      daysPerWeek, 
      duration, 
      isActive 
    } = req.body;

    const updateData = {
      lastUpdated: Date.now()
    };
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (exercises) updateData.exercises = exercises;
    if (daysPerWeek) updateData.daysPerWeek = daysPerWeek;
    if (duration) updateData.duration = duration;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const workoutPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('client', 'firstName lastName')
     .populate('createdBy', 'username');

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    res.json({
      success: true,
      workoutPlan
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete workout plan (trainer only)
// @access  Private/Trainer
router.delete('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findByIdAndDelete(req.params.id);
    
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    res.json({
      success: true,
      message: 'Workout plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/workouts/:id/activate
// @desc    Activate workout plan and deactivate others for the same client (trainer only)
// @access  Private/Trainer
router.put('/:id/activate', auth, authorize('trainer'), async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Deactivate all other workout plans for this client
    await WorkoutPlan.updateMany(
      { client: workoutPlan.client, _id: { $ne: req.params.id } },
      { isActive: false }
    );

    // Activate this workout plan
    workoutPlan.isActive = true;
    workoutPlan.lastUpdated = Date.now();
    await workoutPlan.save();

    await workoutPlan.populate('client', 'firstName lastName');
    await workoutPlan.populate('createdBy', 'username');

    res.json({
      success: true,
      workoutPlan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/workouts/:id
// @desc    Update workout plan (trainer only)
// @access  Private/Trainer
router.put('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const { title, description, exercises, daysPerWeek, duration, isActive } = req.body;
    
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    const updateData = { lastUpdated: Date.now() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (exercises !== undefined) updateData.exercises = exercises;
    if (daysPerWeek !== undefined) updateData.daysPerWeek = daysPerWeek;
    if (duration !== undefined) updateData.duration = duration;
    if (isActive !== undefined) {
      // If activating this plan, deactivate other plans for the same client
      if (isActive) {
        await WorkoutPlan.updateMany(
          { client: workoutPlan.client, _id: { $ne: req.params.id }, isActive: true },
          { isActive: false }
        );
      }
      updateData.isActive = isActive;
    }

    const updatedPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('client', 'firstName lastName')
     .populate('createdBy', 'username');

    res.json({
      success: true,
      workoutPlan: updatedPlan
    });
  } catch (error) {
    console.error('Update workout plan error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete workout plan (trainer only)
// @access  Private/Trainer
router.delete('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    await WorkoutPlan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Workout plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout plan error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;