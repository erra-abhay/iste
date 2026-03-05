const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  shortDescription: { type: String, required: true, maxlength: 200 },
  fullDescription: { type: String, required: true },
  eventDate: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, required: true },
  organizer: { type: String },
  coverImage: { type: String },
  galleryImages: [{ type: String }],
  brochurePDF: { type: String },
  chiefGuest: { type: String },
  eventType: { type: String, enum: ['Conference', 'Workshop', 'Seminar', 'Hackathon', 'Competition', 'Other'], default: 'Other' },
  year: { type: Number },
  isFeatured: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  archiveYear: { type: Number },
  isActive: { type: Boolean, default: true },
  attendees: { type: Number, default: 0 },
  registrationLink: { type: String },
  showOnDashboard: { type: Boolean, default: false }
}, { timestamps: true });

eventSchema.index({ eventDate: -1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ isArchived: 1 });
eventSchema.index({ isFeatured: 1 });
eventSchema.index({ year: 1 });

module.exports = mongoose.model('Event', eventSchema);
