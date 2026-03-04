const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  albumTitle: { type: String, required: true, trim: true },
  coverImage: { type: String, required: true },
  eventReference: { type: String },
  images: [{ type: String }],
  description: { type: String },
  category: { type: String, enum: ['Convocation', 'Awards', 'Seminar', 'Workshop', 'Team', 'Event', 'Research', 'Achievement', 'Other'], default: 'Other' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

gallerySchema.index({ category: 1 });
gallerySchema.index({ order: 1 });
gallerySchema.index({ isActive: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
