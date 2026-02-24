const express = require('express');
const DietPlan = require('../models/DietPlan');
const Client = require('../models/Client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/diet-plans
// @desc    Get all diet plans (trainer only)
// @access  Private/Trainer
router.get('/', auth, authorize('trainer'), async (req, res) => {
  try {
    const { clientId, isActive, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (clientId) {
      query.client = clientId;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const dietPlans = await DietPlan.find(query)
      .populate('client', 'firstName lastName')
      .populate('createdBy', 'username')
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DietPlan.countDocuments(query);

    res.json({
      success: true,
      dietPlans,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching diet plans:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/diet-plans/my-plan
// @desc    Get current client's diet plan
// @access  Private/Client
router.get('/my-plan', auth, authorize('client'), async (req, res) => {
  try {
    // Get client profile
    const client = await Client.findOne({ user: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    const dietPlan = await DietPlan.findOne({ 
      client: client._id, 
      isActive: true 
    }).populate('createdBy', 'username');

    if (!dietPlan) {
      return res.status(404).json({ message: 'No active diet plan found' });
    }

    res.json({
      success: true,
      dietPlan
    });
  } catch (error) {
    console.error('Error fetching client diet plan:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/diet-plans
// @desc    Create diet plan (trainer only)
// @access  Private/Trainer
router.post('/', auth, authorize('trainer'), async (req, res) => {
  try {
    const {
      clientId, 
      title, 
      description,
      goal,
      duration,
      dailyCalorieTarget,
      macroTargets,
      meals,
      notes,
      restrictions,
      supplements,
      waterIntake
    } = req.body;

    // Validate required fields
    if (!clientId || !title || !goal) {
      return res.status(400).json({ 
        message: 'Client, title, and goal are required' 
      });
    }

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Deactivate existing active diet plan for this client
    await DietPlan.updateMany(
      { client: clientId, isActive: true },
      { isActive: false }
    );

    const dietPlan = new DietPlan({
      client: clientId,
      title,
      description,
      goal,
      duration,
      dailyCalorieTarget,
      macroTargets,
      meals: meals || [],
      notes,
      restrictions: restrictions || [],
      supplements: supplements || [],
      waterIntake,
      createdBy: req.user._id
    });

    await dietPlan.save();

    await dietPlan.populate('client', 'firstName lastName');
    await dietPlan.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Diet plan created successfully',
      dietPlan
    });
  } catch (error) {
    console.error('Error creating diet plan:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/diet-plans/:id
// @desc    Get diet plan by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id)
      .populate('client', 'firstName lastName email phone')
      .populate('createdBy', 'username');

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    // Check permissions
    if (req.user.role === 'client') {
      const client = await Client.findOne({ user: req.user._id });
      if (!client || !client._id.equals(dietPlan.client._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({
      success: true,
      dietPlan
    });
  } catch (error) {
    console.error('Error fetching diet plan:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/diet-plans/:id
// @desc    Update diet plan (trainer only)
// @access  Private/Trainer
router.put('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id);
    
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    const {
      title,
      description,
      goal,
      duration,
      dailyCalorieTarget,
      macroTargets,
      meals,
      notes,
      restrictions,
      supplements,
      waterIntake,
      isActive
    } = req.body;

    // Update fields
    if (title) dietPlan.title = title;
    if (description !== undefined) dietPlan.description = description;
    if (goal) dietPlan.goal = goal;
    if (duration !== undefined) dietPlan.duration = duration;
    if (dailyCalorieTarget !== undefined) dietPlan.dailyCalorieTarget = dailyCalorieTarget;
    if (macroTargets) dietPlan.macroTargets = macroTargets;
    if (meals) dietPlan.meals = meals;
    if (notes !== undefined) dietPlan.notes = notes;
    if (restrictions) dietPlan.restrictions = restrictions;
    if (supplements) dietPlan.supplements = supplements;
    if (waterIntake !== undefined) dietPlan.waterIntake = waterIntake;
    if (isActive !== undefined) dietPlan.isActive = isActive;

    await dietPlan.save();

    await dietPlan.populate('client', 'firstName lastName');
    await dietPlan.populate('createdBy', 'username');

    res.json({
      success: true,
      message: 'Diet plan updated successfully',
      dietPlan
    });
  } catch (error) {
    console.error('Error updating diet plan:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/diet-plans/:id
// @desc    Delete diet plan (trainer only)
// @access  Private/Trainer
router.delete('/:id', auth, authorize('trainer'), async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id);
    
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    await DietPlan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Diet plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting diet plan:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/diet-plans/client/:clientId
// @desc    Get diet plans for specific client (trainer only)
// @access  Private/Trainer
router.get('/client/:clientId', auth, authorize('trainer'), async (req, res) => {
  try {
    const { clientId } = req.params;

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const dietPlans = await DietPlan.find({ client: clientId })
      .populate('createdBy', 'username')
      .sort({ lastUpdated: -1 });

    res.json({
      success: true,
      dietPlans,
      clientName: `${client.firstName} ${client.lastName}`
    });
  } catch (error) {
    console.error('Error fetching client diet plans:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;