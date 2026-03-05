// Seed Data for ISTE Telangana
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Models
const Admin = require('./models/Admin');
const Event = require('./models/Event');
const Announcement = require('./models/Announcement');
const Headline = require('./models/Headline');
const Member = require('./models/Member');
const Gallery = require('./models/Gallery');
const SiteSettings = require('./models/SiteSettings');
const Notification = require('./models/Notification');
const Award = require('./models/Award');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await Event.deleteMany({});
    await Announcement.deleteMany({});
    await Headline.deleteMany({});
    await Member.deleteMany({});
    await Gallery.deleteMany({});
    await SiteSettings.deleteMany({});
    await Notification.deleteMany({});
    await Award.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin — pass raw password; the model's pre-save hook will hash it
    await Admin.create({
      email: 'admin@iste-telangana.org',
      password: 'isteadmin2025',
      name: 'Super Admin',
      role: 'superadmin'
    });
    console.log('Admin created');

    // Create Events — field names match Event model schema
    await Event.create([
      {
        title: 'TechVision 2025 Conference',
        shortDescription: 'Annual technical conference bringing together industry experts and academics.',
        fullDescription: 'Annual technical conference bringing together industry experts and academics to discuss emerging technologies.',
        eventDate: new Date('2025-03-15'),
        location: 'Hyderabad International Convention Centre',
        eventType: 'Conference',
        attendees: 500,
        isActive: true
      },
      {
        title: 'AI & ML Workshop',
        shortDescription: 'Hands-on workshop on AI and Machine Learning fundamentals.',
        fullDescription: 'Hands-on workshop on Artificial Intelligence and Machine Learning fundamentals.',
        eventDate: new Date('2025-03-28'),
        location: 'JNTU Hyderabad',
        eventType: 'Workshop',
        attendees: 150,
        isActive: true
      },
      {
        title: 'Innovate Telangana Hackathon',
        shortDescription: '24-hour hackathon focused on solving real-world problems.',
        fullDescription: '24-hour hackathon focused on solving real-world problems using technology.',
        eventDate: new Date('2025-04-10'),
        location: 'T-Hub Hyderabad',
        eventType: 'Hackathon',
        attendees: 200,
        isActive: true
      },
      {
        title: 'Leadership Summit 2025',
        shortDescription: 'Annual leadership summit for student coordinators and chapter heads.',
        fullDescription: 'Annual leadership summit for student coordinators and chapter heads.',
        eventDate: new Date('2025-04-25'),
        location: 'CBIT Hyderabad',
        eventType: 'Seminar',
        attendees: 100,
        isActive: true
      },
      {
        title: 'Coding Bootcamp',
        shortDescription: 'Intensive coding training program for students.',
        fullDescription: 'Intensive coding training program for students.',
        eventDate: new Date('2025-05-05'),
        location: 'Virtual',
        eventType: 'Workshop',
        attendees: 250,
        isActive: true
      },
      {
        title: 'App Development Challenge',
        shortDescription: 'Mobile app development challenge for students.',
        fullDescription: 'Mobile app development challenge for students.',
        eventDate: new Date('2025-05-20'),
        location: 'Secunderabad',
        eventType: 'Competition',
        attendees: 100,
        isActive: true
      }
    ]);
    console.log('Events created');

    // Create Announcements
    await Announcement.create([
      {
        title: 'TechVision 2025 Registrations Open',
        content: 'Registration for TechVision 2025 Conference is now open. Last date to register is March 10, 2025.',
        priority: 'high',
        category: 'event',
        showOnHomepage: true,
        isActive: true
      },
      {
        title: 'New ISTE Chapter Guidelines',
        content: 'ISTE has released new guidelines for student chapters. Please download from documents section.',
        priority: 'medium',
        category: 'notice',
        showOnHomepage: true,
        isActive: true
      },
      {
        title: 'Membership Renewal Notice',
        content: 'All members are requested to renew their membership for the year 2025.',
        priority: 'urgent',
        category: 'notice',
        showOnHomepage: false,
        isActive: true
      }
    ]);
    console.log('Announcements created');

    // Create Headlines
    await Headline.create([
      { text: '📢 TechVision 2025 Conference - Registrations Open!', isActive: true, order: 1 },
      { text: '📢 AI & ML Workshop - 28th March 2025', isActive: true, order: 2 },
      { text: '📢 Innovate Telangana Hackathon - 10th April 2025', isActive: true, order: 3 },
      { text: '📢 ISTE Membership Drive - Join Today!', isActive: true, order: 4 },
      { text: '📢 New Awards Announced for 2025', isActive: true, order: 5 }
    ]);
    console.log('Headlines created');

    // Create Members
    await Member.create([
      {
        name: 'Dr. Ramesh Kumar',
        designation: 'State Chairman',
        organization: 'JNTU Hyderabad',
        committee: 'Executive',
        email: 'chairman@iste-telangana.org',
        isActive: true
      },
      {
        name: 'Prof. Sunita Rao',
        designation: 'Vice Chairperson',
        organization: 'OU Hyderabad',
        committee: 'Executive',
        email: 'vicechairman@iste-telangana.org',
        isActive: true
      },
      {
        name: 'Dr. Praveen Singh',
        designation: 'Secretary',
        organization: 'NIT Warangal',
        committee: 'Executive',
        email: 'secretary@iste-telangana.org',
        isActive: true
      },
      {
        name: 'Prof. Madhavi Devi',
        designation: 'Treasurer',
        organization: 'BITS Pilani Hyderabad',
        committee: 'Executive',
        email: 'treasurer@iste-telangana.org',
        isActive: true
      },
      {
        name: 'Dr. Venkatesh',
        designation: 'Joint Secretary',
        organization: 'IIT Hyderabad',
        committee: 'Executive',
        email: 'jointsecy@iste-telangana.org',
        isActive: true
      },
      {
        name: 'Prof. Raju Sharma',
        designation: 'Joint Secretary',
        organization: 'CBIT Hyderabad',
        committee: 'Executive',
        email: 'rajusharma@iste-telangana.org',
        isActive: true
      },
      {
        name: 'Dr. Anitha',
        designation: 'Executive Member',
        organization: 'Vasavi College',
        committee: 'Executive',
        email: 'anitha@iste-telangana.org',
        isActive: true
      },
      {
        name: 'Prof. Kiran Kumar',
        designation: 'Executive Member',
        organization: 'MGIT Hyderabad',
        committee: 'Executive',
        email: 'kirankumar@iste-telangana.org',
        isActive: true
      },
      {
        name: 'Dr. Swapna',
        designation: 'Executive Member',
        organization: 'GNITS Hyderabad',
        committee: 'Executive',
        email: 'swapna@iste-telangana.org',
        isActive: true
      }
    ]);
    console.log('Members created');

    // Create Gallery — field names match Gallery model (albumTitle, coverImage required)
    await Gallery.create([
      { albumTitle: 'Convocation 2024', coverImage: '/images/gallery/convocation.jpg', category: 'Convocation', isActive: true },
      { albumTitle: 'Annual Awards', coverImage: '/images/gallery/awards.jpg', category: 'Awards', isActive: true },
      { albumTitle: 'Tech Seminar', coverImage: '/images/gallery/seminar.jpg', category: 'Seminar', isActive: true },
      { albumTitle: 'AI Workshop', coverImage: '/images/gallery/workshop.jpg', category: 'Workshop', isActive: true },
      { albumTitle: 'Team Meeting', coverImage: '/images/gallery/team.jpg', category: 'Team', isActive: true },
      { albumTitle: 'Annual Event', coverImage: '/images/gallery/event.jpg', category: 'Event', isActive: true },
      { albumTitle: 'Research Symposium', coverImage: '/images/gallery/research.jpg', category: 'Research', isActive: true },
      { albumTitle: 'Achievement Award', coverImage: '/images/gallery/achievement.jpg', category: 'Achievement', isActive: true }
    ]);
    console.log('Gallery created');

    // Create Notifications
    await Notification.create([
      {
        title: 'TechVision 2025 Conference',
        message: 'Registrations Open! Join us for the biggest tech event of the year.',
        type: 'event',
        priority: 'urgent',
        isActive: true,
        expiryDate: new Date('2025-03-15')
      },
      {
        title: 'AI & ML Workshop',
        message: 'Learn AI & ML fundamentals from industry experts. Limited seats!',
        type: 'info',
        priority: 'high',
        isActive: true,
        expiryDate: new Date('2025-03-28')
      },
      {
        title: 'Innovate Hackathon',
        message: '24-hour hackathon. Solve real-world problems and win exciting prizes!',
        type: 'event',
        priority: 'high',
        isActive: true,
        expiryDate: new Date('2025-04-10')
      },
      {
        title: 'Membership Drive',
        message: 'Join ISTE today and unlock exclusive benefits for students and educators.',
        type: 'success',
        priority: 'medium',
        isActive: true,
        expiryDate: new Date('2025-12-31')
      }
    ]);
    console.log('Notifications created');

    // Create Awards — field names match Award model (awardTitle, recipientName required)
    await Award.create([
      {
        awardTitle: 'Best Teacher Award',
        recipientName: 'Dr. Ramesh Kumar',
        description: 'Recognizing excellence in technical education teaching.',
        category: 'teacher',
        year: 2024,
        isActive: true
      },
      {
        awardTitle: 'Best Student Award',
        recipientName: 'Priya Sharma',
        description: 'Honoring outstanding student achievements in technical education.',
        category: 'student',
        year: 2024,
        isActive: true
      },
      {
        awardTitle: 'Best College Award',
        recipientName: 'JNTU Hyderabad',
        description: 'Awarding institutions with exceptional technical education programs.',
        category: 'college',
        year: 2024,
        isActive: true
      },
      {
        awardTitle: 'Lifetime Achievement',
        recipientName: 'Prof. Sunita Rao',
        description: 'Recognizing lifelong contributions to technical education.',
        category: 'lifetime',
        year: 2024,
        isActive: true
      }
    ]);
    console.log('Awards created');

    // Create Site Settings
    await SiteSettings.create([
      { key: 'heroTitle', value: 'ISTE Telangana Chapter', category: 'homepage' },
      { key: 'heroSubtitle', value: 'Promoting Technical Excellence in Education', category: 'homepage' },
      { key: 'ctaText', value: 'Join Us Today', category: 'homepage' },
      { key: 'aboutTitle', value: 'About ISTE Telangana', category: 'about' },
      { key: 'aboutContent', value: 'The Indian Society for Technical Education (ISTE) is the leading National Professional Society for the Technical Education System in the country.', category: 'about' },
      { key: 'contactEmail', value: 'istetelangana@gmail.com', category: 'contact' },
      { key: 'contactPhone', value: '+91 98765 43210', category: 'contact' },
      { key: 'contactAddress', value: 'Hyderabad, Telangana, India', category: 'contact' },
      { key: 'socialFacebook', value: 'https://facebook.com/istetelangana', category: 'social' },
      { key: 'socialTwitter', value: 'https://twitter.com/istetelangana', category: 'social' },
      { key: 'socialLinkedin', value: 'https://linkedin.com/company/istetelangana', category: 'social' },
      { key: 'socialInstagram', value: 'https://instagram.com/istetelangana', category: 'social' }
    ]);
    console.log('Site settings created');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('   Email: admin@iste-telangana.org');
    console.log('   Password: isteadmin2025');
    console.log('\n🌐 Server running at: http://localhost:3000');
    console.log('📊 Admin Panel: http://localhost:3000/admin/login.html');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
