const express = require('express');
const router = express.Router();
const Award = require('../models/Award');
const { auth } = require('../middleware/auth');

// GET all awards (public)
router.get('/', async (req, res) => {
  try {
    const { active, category, year, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    if (active === 'true') {
      query.isActive = true;
    }
    
    if (category) query.category = category;
    if (year) query.year = parseInt(year);
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const awards = await Award.find(query)
      .sort({ year: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Award.countDocuments(query);
    
    res.json({
      awards,
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

// GET single award (public)
router.get('/:id', async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);
    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }
    res.json(award);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create award (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const award = new Award(req.body);
    await award.save();
    res.status(201).json(award);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update award (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const award = await Award.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }
    res.json(award);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE award (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const award = await Award.findByIdAndDelete(req.params.id);
    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }
    res.json({ message: 'Award deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
