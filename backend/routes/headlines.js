const express = require('express');
const router = express.Router();
const Headline = require('../models/Headline');
const { auth } = require('../middleware/auth');

// @route   GET /api/headlines
// @desc    Get all active headlines (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = {};
    if (active === 'true') {
      query.isActive = true;
    }

    const headlines = await Headline.find(query).sort({ order: 1 });
    res.json(headlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/headlines/all
// @desc    Get all headlines for admin (public)
// @access  Public
router.get('/all', auth, async (req, res) => {
  try {
    const headlines = await Headline.find().sort({ order: 1 });
    res.json(headlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/headlines
// @desc    Create new headline
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const headline = new Headline(req.body);
    await headline.save();
    res.status(201).json(headline);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/headlines/:id
// @desc    Update headline
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const headline = await Headline.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!headline) {
      return res.status(404).json({ message: 'Headline not found' });
    }
    res.json(headline);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/headlines/:id/toggle
// @desc    Toggle headline active status
// @access  Private
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const headline = await Headline.findById(req.params.id);
    if (!headline) {
      return res.status(404).json({ message: 'Headline not found' });
    }
    headline.isActive = !headline.isActive;
    await headline.save();
    res.json(headline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/headlines/reorder
// @desc    Reorder headlines
// @access  Private
router.put('/reorder', auth, async (req, res) => {
  try {
    const { ids } = req.body; // Array of headline IDs in new order
    
    for (let i = 0; i < ids.length; i++) {
      await Headline.findByIdAndUpdate(ids[i], { order: i });
    }
    
    res.json({ message: 'Headlines reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/headlines/:id
// @desc    Delete headline
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const headline = await Headline.findByIdAndDelete(req.params.id);
    if (!headline) {
      return res.status(404).json({ message: 'Headline not found' });
    }
    res.json({ message: 'Headline deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
