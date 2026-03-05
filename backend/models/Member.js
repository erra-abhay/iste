const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String
  },
  designation: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  committee: {
    type: String,
    enum: ['Executive', 'Advisory', 'Technical', 'Student'],
    default: 'Executive'
  },
  year: {
    type: Number
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  bio: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  showOnDashboard: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
memberSchema.index({ committee: 1 });
memberSchema.index({ order: 1 });
memberSchema.index({ isActive: 1 });

module.exports = mongoose.model('Member', memberSchema);
