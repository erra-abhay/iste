const express = require('express');
const router = express.Router();
const Award = require('../models/Award');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const uploadFields = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'photos', maxCount: 20 }
]);

// GET all awards (public)
router.get('/', async (req, res) => {
  try {
    const { active, category, year, showOnDashboard, limit = 50, page = 1 } = req.query;
    let query = {};
    if (active === 'true') query.isActive = true;
    if (category) query.category = category;
    if (year) query.year = parseInt(year);
    if (showOnDashboard === 'true') query.showOnDashboard = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const awards = await Award.find(query)
      .sort({ year: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Award.countDocuments(query);
    res.json({
      awards,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single award (public)
router.get('/:id', async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);
    if (!award) return res.status(404).json({ message: 'Award not found' });
    res.json(award);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create award (admin only)
router.post('/', auth, uploadFields, async (req, res) => {
  try {
    const data = {
      awardTitle: req.body.awardTitle,
      recipientName: req.body.recipientName,
      year: parseInt(req.body.year),
      description: req.body.description,
      category: req.body.category || 'other',
      icon: req.body.icon || '🏆',
      isActive: req.body.isActive === 'true' || req.body.isActive === true
    };

    if (req.files && req.files.coverImage) {
      data.coverImage = '/uploads/' + req.files.coverImage[0].filename;
    }
    if (req.files && req.files.photos) {
      data.photos = req.files.photos.map(f => '/uploads/' + f.filename);
    }

    const award = new Award(data);
    await award.save();
    res.status(201).json(award);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update award (admin only)
router.put('/:id', auth, uploadFields, async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);
    if (!award) return res.status(404).json({ message: 'Award not found' });

    if (req.body.awardTitle) award.awardTitle = req.body.awardTitle;
    if (req.body.recipientName) award.recipientName = req.body.recipientName;
    if (req.body.year) award.year = parseInt(req.body.year);
    if (req.body.description) award.description = req.body.description;
    if (req.body.category) award.category = req.body.category;
    if (req.body.icon) award.icon = req.body.icon;
    if (req.body.isActive !== undefined) award.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    if (req.body.showOnDashboard !== undefined) award.showOnDashboard = req.body.showOnDashboard === 'true' || req.body.showOnDashboard === true;

    if (req.files && req.files.coverImage) {
      award.coverImage = '/uploads/' + req.files.coverImage[0].filename;
    }

    // Merge existing photos with new uploads
    let existingPhotos = [];
    if (req.body.existingPhotos) {
      try {
        existingPhotos = JSON.parse(req.body.existingPhotos);
      } catch (e) {
        existingPhotos = Array.isArray(req.body.existingPhotos) ? req.body.existingPhotos : [];
      }
    }
    let newPhotos = [];
    if (req.files && req.files.photos) {
      newPhotos = req.files.photos.map(f => '/uploads/' + f.filename);
    }
    award.photos = [...existingPhotos, ...newPhotos];

    await award.save();
    res.json(award);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE award (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const award = await Award.findByIdAndDelete(req.params.id);
    if (!award) return res.status(404).json({ message: 'Award not found' });
    res.json({ message: 'Award deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
