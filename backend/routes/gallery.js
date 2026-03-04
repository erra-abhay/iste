const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/gallery
// @desc    Get all gallery items (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, active, limit = 100, page = 1 } = req.query;

    let query = {};

    if (active === 'true') {
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    const gallery = await Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Gallery.countDocuments(query);

    res.json({
      gallery,
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

// @route   GET /api/gallery/stats/count
// @desc    Get gallery count
// @access  Private
// NOTE: Must be defined BEFORE /:id to avoid Express matching "stats" as an id
router.get('/stats/count', auth, async (req, res) => {
  try {
    const total = await Gallery.countDocuments({ isActive: true });
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/gallery/upload
// @desc    Upload gallery image
// @access  Private
// NOTE: Must be defined BEFORE /:id to avoid Express matching "upload" as an id
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { albumTitle, category, description, eventReference } = req.body;
    const galleryItem = new Gallery({
      albumTitle,
      category,
      description,
      eventReference,
      coverImage: '/uploads/' + req.file.filename
    });

    await galleryItem.save();
    res.status(201).json(galleryItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/gallery/:id
// @desc    Get single gallery item (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(galleryItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/gallery
// @desc    Create new gallery item
// @access  Private
router.post('/', auth, upload.single('coverImage'), async (req, res) => {
  try {
    const galleryData = { ...req.body };
    if (req.file) {
      galleryData.coverImage = '/uploads/' + req.file.filename;
    }
    const galleryItem = new Gallery(galleryData);
    await galleryItem.save();
    res.status(201).json(galleryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery item
// @access  Private
router.put('/:id', auth, upload.single('coverImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.coverImage = '/uploads/' + req.file.filename;
    }
    const galleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(galleryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
