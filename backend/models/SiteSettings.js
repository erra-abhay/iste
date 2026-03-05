const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'homepage', 'about', 'contact', 'social', 'footer'],
    default: 'general'
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
siteSettingsSchema.index({ key: 1 });
siteSettingsSchema.index({ category: 1 });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
