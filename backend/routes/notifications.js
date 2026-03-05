const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET all notifications (public)
router.get('/', async (req, res) => {
  try {
    const { active, type, priority, limit = 20, page = 1 } = req.query;

    let query = {};

    if (active === 'true') {
      query.isActive = true;
      query.$or = [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ];
    }

    if (type) query.type = type;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
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

// GET single notification (public)
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create notification with optional file attachment (admin only)
router.post('/', auth, upload.single('attachment'), async (req, res) => {
  try {
    const notificationData = { ...req.body };
    if (req.file) {
      notificationData.attachment = '/uploads/' + req.file.filename;
    }
    // Handle checkbox values from FormData
    if (notificationData.isActive === 'true') notificationData.isActive = true;
    if (notificationData.isActive === 'false') notificationData.isActive = false;
    if (notificationData.expiryDate === '') notificationData.expiryDate = null;

    const notification = new Notification(notificationData);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update notification with optional file attachment (admin only)
router.put('/:id', auth, upload.single('attachment'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.attachment = '/uploads/' + req.file.filename;
    }
    // Handle checkbox values from FormData
    if (updateData.isActive === 'true') updateData.isActive = true;
    if (updateData.isActive === 'false') updateData.isActive = false;
    if (updateData.expiryDate === '') updateData.expiryDate = null;

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE notification (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH toggle active status (admin only)
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isActive = !notification.isActive;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
