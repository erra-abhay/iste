const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/members
// @desc    Get all members (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { committee, active, limit = 100, page = 1 } = req.query;

    let query = {};

    if (active === 'true') {
      query.isActive = true;
    }

    if (committee) {
      query.committee = committee;
    }

    const members = await Member.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Member.countDocuments(query);

    res.json({
      members,
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

// @route   GET /api/members/stats/count
// @desc    Get members count
// @access  Private
// NOTE: Must be defined BEFORE /:id to avoid Express matching "stats" as an id
router.get('/stats/count', auth, async (req, res) => {
  try {
    const total = await Member.countDocuments({ isActive: true });
    const executive = await Member.countDocuments({ committee: 'Executive', isActive: true });
    const advisory = await Member.countDocuments({ committee: 'Advisory', isActive: true });
    const technical = await Member.countDocuments({ committee: 'Technical', isActive: true });
    const student = await Member.countDocuments({ committee: 'Student', isActive: true });
    res.json({ total, executive, advisory, technical, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/members/:id
// @desc    Get single member (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/members
// @desc    Create new member
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/members/:id/photo
// @desc    Upload member photo
// @access  Private
router.post('/:id/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.photo = '/uploads/' + req.file.filename;
    await member.save();

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/members/:id/toggle
// @desc    Toggle member active status
// @access  Private
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    member.isActive = !member.isActive;
    await member.save();
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/members/:id
// @desc    Delete member
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
