const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
  awardTitle: { type: String, required: true, trim: true },
  recipientName: { type: String, required: true },
  year: { type: Number, required: true },
  description: { type: String, required: true },
  coverImage: { type: String },
  photos: [{ type: String }],
  category: { type: String, enum: ['teacher', 'student', 'college', 'lifetime', 'other'], default: 'other' },
  icon: { type: String, default: '🏆' },
  showOnDashboard: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

awardSchema.index({ year: -1 });
awardSchema.index({ category: 1 });

module.exports = mongoose.model('Award', awardSchema);
