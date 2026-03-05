const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/events
// @desc    Get all events (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { featured, eventType, archived, showOnDashboard, limit = 50, page = 1 } = req.query;

    let query = {};

    if (showOnDashboard === 'true') {
      query.showOnDashboard = true;
      query.isActive = true;
    } else if (featured === 'true') {
      query.isFeatured = true;
      query.isActive = true;
    } else if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = false;
      query.isActive = true;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    const events = await Event.find(query)
      .sort({ eventDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      events,
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

// @route   GET /api/events/stats/count
// @desc    Get events count
// @access  Private
// NOTE: Must be defined BEFORE /:id to avoid Express matching "stats" as an id
router.get('/stats/count', auth, async (req, res) => {
  try {
    const total = await Event.countDocuments({ isArchived: false, isActive: true });
    const archived = await Event.countDocuments({ isArchived: true });
    res.json({ total, archived });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', auth, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'brochurePDF', maxCount: 1 }]), async (req, res) => {
  try {
    const eventData = { ...req.body };
    if (req.files && req.files.coverImage) {
      eventData.coverImage = '/uploads/' + req.files.coverImage[0].filename;
    }
    if (req.files && req.files.brochurePDF) {
      eventData.brochurePDF = '/uploads/' + req.files.brochurePDF[0].filename;
    }
    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/events/:id/image
// @desc    Upload event image
// @access  Private
router.post('/:id/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.coverImage = '/uploads/' + req.file.filename;
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private
router.put('/:id', auth, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'brochurePDF', maxCount: 1 }]), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.files && req.files.coverImage) {
      updateData.coverImage = '/uploads/' + req.files.coverImage[0].filename;
    }
    if (req.files && req.files.brochurePDF) {
      updateData.brochurePDF = '/uploads/' + req.files.brochurePDF[0].filename;
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/events/:id/archive
// @desc    Archive event by year
// @access  Private
router.put('/:id/archive', auth, async (req, res) => {
  try {
    const { year } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, archiveYear: year },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
