const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const { auth } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get all site settings (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }

    const settings = await SiteSettings.find(query);
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/settings/:key
// @desc    Get single setting (public)
// @access  Public
router.get('/:key', async (req, res) => {
  try {
    const setting = await SiteSettings.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/settings
// @desc    Create or update setting
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { key, value, category, description } = req.body;
    
    let setting = await SiteSettings.findOne({ key });
    
    if (setting) {
      setting.value = value;
      if (category) setting.category = category;
      if (description) setting.description = description;
      await setting.save();
    } else {
      setting = new SiteSettings({ key, value, category, description });
      await setting.save();
    }
    
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/settings/:key
// @desc    Update setting
// @access  Private
router.put('/:key', auth, async (req, res) => {
  try {
    const setting = await SiteSettings.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    const { value, category, description } = req.body;
    if (value !== undefined) setting.value = value;
    if (category) setting.category = category;
    if (description) setting.description = description;
    
    await setting.save();
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/settings/:key
// @desc    Delete setting
// @access  Private
router.delete('/:key', auth, async (req, res) => {
  try {
    const setting = await SiteSettings.findOneAndDelete({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/settings/bulk
// @desc    Update multiple settings at once
// @access  Private
router.post('/bulk', auth, async (req, res) => {
  try {
    const { settings } = req.body; // Array of { key, value, category }
    
    for (const item of settings) {
      let setting = await SiteSettings.findOne({ key: item.key });
      
      if (setting) {
        setting.value = item.value;
        if (item.category) setting.category = item.category;
        await setting.save();
      } else {
        setting = new SiteSettings({
          key: item.key,
          value: item.value,
          category: item.category || 'general'
        });
        await setting.save();
      }
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
