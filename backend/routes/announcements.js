const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { auth } = require('../middleware/auth');

// @route   GET /api/announcements
// @desc    Get all announcements (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { active, homepage, category, limit = 50, page = 1 } = req.query;

    let query = {};

    if (active === 'true') {
      query.isActive = true;
      // Also check expiry date
      query.$or = [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ];
    }

    if (homepage === 'true') {
      query.showOnHomepage = true;
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    const announcements = await Announcement.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/announcements/stats/count
// @desc    Get announcements count
// @access  Private
// NOTE: Must be defined BEFORE /:id to avoid Express matching "stats" as an id
router.get('/stats/count', auth, async (req, res) => {
  try {
    const total = await Announcement.countDocuments();
    const active = await Announcement.countDocuments({ isActive: true });
    res.json({ total, active });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get single announcement (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/announcements/:id/toggle
// @desc    Toggle announcement active status
// @access  Private
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    announcement.isActive = !announcement.isActive;
    await announcement.save();
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
