const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkOut: {
    type: Date
  },
  duration: {
    type: Number // in minutes
  },
  notes: {
    type: String
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create compound index to prevent duplicate entries for same client on same day
attendanceSchema.index({ client: 1, date: 1 }, { 
  unique: true,
  partialFilterExpression: { date: { $exists: true } }
});

module.exports = mongoose.model('Attendance', attendanceSchema);