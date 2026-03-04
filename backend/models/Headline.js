const mongoose = require('mongoose');

const headlineSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  link: {
    type: String
  },
  linkText: {
    type: String
  }
}, {
  timestamps: true
});

// Index for ordering
headlineSchema.index({ order: 1 });
headlineSchema.index({ isActive: 1 });

module.exports = mongoose.model('Headline', headlineSchema);
