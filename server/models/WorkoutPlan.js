const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
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
  exercises: [{
    name: {
      type: String,
      required: true
    },
    sets: {
      type: Number,
      required: true
    },
    reps: {
      type: String, // Could be "10-12" or "10" or "30 seconds"
      required: true
    },
    weight: {
      type: String // Could be "bodyweight" or "20kg" or "10-15kg"
    },
    restTime: {
      type: String // e.g., "60 seconds", "2 minutes"
    },
    notes: {
      type: String
    }
  }],
  daysPerWeek: {
    type: Number,
    min: 1,
    max: 7,
    default: 3
  },
  duration: {
    type: String // e.g., "4 weeks", "8 weeks"
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

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);