const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// POST /api/messages — public, receive contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required.' });
        }
        const msg = new Message({ name, email, message });
        await msg.save();
        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/messages — admin only, list all messages
router.get('/', auth, async (req, res) => {
    try {
        const { read, limit = 50, page = 1 } = req.query;
        let query = {};
        if (read === 'true') query.isRead = true;
        if (read === 'false') query.isRead = false;

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Message.countDocuments(query);
        const unread = await Message.countDocuments({ isRead: false });

        res.json({ messages, unread, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/messages/:id/read — mark as read
router.patch('/:id/read', auth, async (req, res) => {
    try {
        const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!msg) return res.status(404).json({ message: 'Message not found' });
        res.json(msg);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/messages/:id — delete message
router.delete('/:id', auth, async (req, res) => {
    try {
        const msg = await Message.findByIdAndDelete(req.params.id);
        if (!msg) return res.status(404).json({ message: 'Message not found' });
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
