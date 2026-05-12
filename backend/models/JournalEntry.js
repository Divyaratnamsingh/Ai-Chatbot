const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  aiSummary: {
    type: String,
    default: ''
  },
  emotions: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ content: 'text', title: 'text' });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
