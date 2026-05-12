const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  emotions: [{
    type: String,
    trim: true
  }],
  note: {
    type: String,
    maxlength: 500,
    default: ''
  },
  activities: [{
    type: String,
    trim: true
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

moodEntrySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
