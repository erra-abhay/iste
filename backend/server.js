require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const announcementsRoutes = require('./routes/announcements');
const headlinesRoutes = require('./routes/headlines');
const membersRoutes = require('./routes/members');
const galleryRoutes = require('./routes/gallery');
const documentsRoutes = require('./routes/documents');
const settingsRoutes = require('./routes/settings');
const notificationsRoutes = require('./routes/notifications');
const awardsRoutes = require('./routes/awards');

// Import models for seeding initial admin
const Admin = require('./models/Admin');
const { auth } = require('./middleware/auth');

const app = express();

// Connect to MongoDB
connectDB();

// --- SECURITY MIDDLEWARE ---

// Helmet: sets various HTTP security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow uploaded files to load
  contentSecurityPolicy: false // handled by nginx in production
}));

// CORS: restrict to allowed origins only
const allowedOrigins = [
  'https://iste.brikienlabs.tech',
  'https://administe.brikienlabs.tech'
];
// In development, also allow localhost
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000');
}
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (same-origin, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Disable X-Powered-By header (extra layer, helmet also does this)
app.disable('x-powered-by');

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve admin static files
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/admin/pages', express.static(path.join(__dirname, '../admin/pages')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/headlines', headlinesRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/awards', awardsRoutes);

// Dashboard stats route — now requires authentication
app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    const Event = require('./models/Event');
    const Member = require('./models/Member');
    const Announcement = require('./models/Announcement');
    const Headline = require('./models/Headline');
    const Gallery = require('./models/Gallery');
    const Document = require('./models/Document');
    const Notification = require('./models/Notification');
    const Award = require('./models/Award');

    const eventsCount = await Event.countDocuments({ isActive: true, isArchived: false });
    const membersCount = await Member.countDocuments({ isActive: true });
    const announcementsCount = await Announcement.countDocuments({ isActive: true });
    const headlinesCount = await Headline.countDocuments({ isActive: true });
    const galleryCount = await Gallery.countDocuments({ isActive: true });
    const documentsCount = await Document.countDocuments({ isActive: true });
    const notificationsCount = await Notification.countDocuments({ isActive: true });
    const awardsCount = await Award.countDocuments({ isActive: true });

    res.json({
      events: eventsCount,
      members: membersCount,
      announcements: announcementsCount,
      headlines: headlinesCount,
      gallery: galleryCount,
      documents: documentsCount,
      notifications: notificationsCount,
      awards: awardsCount
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ISTE Telangana API is running' });
});

// Create uploads directory if not exists
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Seed initial admin account (password from env, NOT hardcoded)
const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@iste-telangana.org' });
    if (!adminExists) {
      const seedPassword = process.env.ADMIN_SEED_PASSWORD || 'ChangeMe@2025!';
      const admin = new Admin({
        email: 'admin@iste-telangana.org',
        password: seedPassword,
        name: 'Super Admin',
        role: 'superadmin'
      });
      await admin.save();
      console.log('Initial admin account created. Change the default password immediately!');
    }
  } catch (error) {
    console.error('Error seeding admin:', error.message);
  }
};

// Global error handler — hide details in production
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy: origin not allowed' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seedAdmin();
});

module.exports = app;
