const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ingredients: [{
    name: {
      type: String,
      trim: true
    },
    quantity: {
      type: String,
      trim: true
    },
    unit: {
      type: String,
      trim: true
    }
  }],
  calories: {
    type: Number,
    min: 0
  },
  protein: {
    type: Number,
    min: 0
  },
  carbs: {
    type: Number,
    min: 0
  },
  fats: {
    type: Number,
    min: 0
  },
  instructions: {
    type: String,
    trim: true
  },
  timing: {
    type: String,
    enum: ['breakfast', 'morning-snack', 'lunch', 'evening-snack', 'dinner', 'post-workout'],
    required: true
  }
}, { _id: true });

const dietPlanSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  goal: {
    type: String,
    enum: ['weight-loss', 'weight-gain', 'muscle-gain', 'maintenance', 'athletic-performance'],
    required: true
  },
  duration: {
    type: String,
    default: 'Ongoing'
  },
  dailyCalorieTarget: {
    type: Number,
    min: 0
  },
  macroTargets: {
    protein: {
      type: Number,
      min: 0
    },
    carbs: {
      type: Number,
      min: 0
    },
    fats: {
      type: Number,
      min: 0
    }
  },
  meals: [mealSchema],
  notes: {
    type: String,
    trim: true
  },
  restrictions: [{
    type: String,
    trim: true
  }],
  supplements: [{
    name: String,
    dosage: String,
    timing: String,
    instructions: String
  }],
  waterIntake: {
    type: Number,
    default: 8,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated on save
dietPlanSchema.pre('save', function() {
  this.lastUpdated = new Date();
});

// Index for efficient queries
dietPlanSchema.index({ client: 1, isActive: 1 });
dietPlanSchema.index({ createdBy: 1 });

module.exports = mongoose.model('DietPlan', dietPlanSchema);