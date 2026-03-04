const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  file: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['notice', 'report', 'syllabus', 'form', 'other'],
    default: 'other'
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['academic', 'administrative', 'forms', 'reports', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
documentSchema.index({ category: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Document', documentSchema);
