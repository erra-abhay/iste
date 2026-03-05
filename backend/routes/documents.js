const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/documents
// @desc    Get all documents (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, type, active, limit = 50, page = 1 } = req.query;

    let query = {};

    if (active === 'true') {
      query.isActive = true;
    }

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Document.countDocuments(query);

    res.json({
      documents,
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

// @route   GET /api/documents/stats/count
// @desc    Get documents count
// @access  Private
// NOTE: Must be defined BEFORE /:id to avoid Express matching "stats" as an id
router.get('/stats/count', auth, async (req, res) => {
  try {
    const total = await Document.countDocuments({ isActive: true });
    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/documents/upload
// @desc    Upload document file
// @access  Private
// NOTE: Must be defined BEFORE /:id to avoid Express matching "upload" as an id
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, description, type, category } = req.body;
    const document = new Document({
      title,
      description,
      type,
      category,
      file: '/uploads/' + req.file.filename
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/documents
// @desc    Create new document
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const document = new Document(req.body);
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
