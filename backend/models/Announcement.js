const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  showOnHomepage: {
    type: Boolean,
    default: false
  },
  expiryDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['notice', 'news', 'update', 'event'],
    default: 'notice'
  }
}, {
  timestamps: true
});

// Index for faster queries
announcementSchema.index({ isActive: 1 });
announcementSchema.index({ priority: -1 });
announcementSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
