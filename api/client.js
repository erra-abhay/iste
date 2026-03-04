// API Client for ISTE Telangana Frontend
// Use relative URL so it works in both dev (localhost:3000) and production
const API_BASE_URL = '/api';

// ========== FETCH FUNCTIONS ==========

async function fetchEvents(limit) {
  limit = limit || 10;
  try {
    const response = await fetch(API_BASE_URL + '/events?limit=' + limit);
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return { events: [] };
  }
}

async function fetchEventById(id) {
  try {
    const response = await fetch(API_BASE_URL + '/events/' + id);
    return await response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

async function fetchAnnouncements(limit) {
  limit = limit || 10;
  try {
    const response = await fetch(API_BASE_URL + '/announcements?active=true&limit=' + limit);
    return await response.json();
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return { announcements: [] };
  }
}

async function fetchHeadlines() {
  try {
    const response = await fetch(API_BASE_URL + '/headlines?active=true');
    return await response.json();
  } catch (error) {
    console.error('Error fetching headlines:', error);
    return [];
  }
}

async function fetchMembers(committee, limit) {
  limit = limit || 20;
  try {
    var url = API_BASE_URL + '/members?active=true&limit=' + limit;
    if (committee) url += '&committee=' + committee;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching members:', error);
    return { members: [] };
  }
}

async function fetchGallery(category, limit) {
  limit = limit || 20;
  try {
    var url = API_BASE_URL + '/gallery?active=true&limit=' + limit;
    if (category) url += '&category=' + category;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return { gallery: [] };
  }
}

async function fetchDocuments(type, limit) {
  limit = limit || 20;
  try {
    var url = API_BASE_URL + '/documents?active=true&limit=' + limit;
    if (type) url += '&type=' + type;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching documents:', error);
    return { documents: [] };
  }
}

async function fetchSettings() {
  try {
    const response = await fetch(API_BASE_URL + '/settings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {};
  }
}

async function fetchNotifications(limit) {
  limit = limit || 10;
  try {
    const response = await fetch(API_BASE_URL + '/notifications?active=true&limit=' + limit);
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [] };
  }
}

async function fetchAwards(limit) {
  limit = limit || 10;
  try {
    const response = await fetch(API_BASE_URL + '/awards?active=true&limit=' + limit);
    return await response.json();
  } catch (error) {
    console.error('Error fetching awards:', error);
    return { awards: [] };
  }
}

async function fetchDashboardStats() {
  try {
    const response = await fetch(API_BASE_URL + '/dashboard/stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {};
  }
}

// ========== RENDER FUNCTIONS ==========

// Notification bar — show urgent notifications or fall back to headlines
async function renderUrgentNotifications() {
  var data = await fetchNotifications(20);
  var notificationBar = document.querySelector('.notification-bar');

  if (!notificationBar) return;

  var urgentNotifications = [];
  if (data.notifications) {
    urgentNotifications = data.notifications.filter(function (n) {
      return n.priority === 'urgent' || n.priority === 'high';
    });
  }

  if (urgentNotifications && urgentNotifications.length > 0) {
    notificationBar.style.background = 'linear-gradient(90deg, #dc3545, #c82333)';

    var track = document.getElementById('notificationTrack');
    if (track) {
      var html = '';
      for (var i = 0; i < urgentNotifications.length; i++) {
        html += '<span class="notification-item">🚨 ' + urgentNotifications[i].title + '</span>';
      }
      track.innerHTML = html + html;
    }
  } else {
    await renderHeadlines();
  }
}

async function renderHeadlines() {
  var headlines = await fetchHeadlines();
  var track = document.getElementById('notificationTrack');
  var notificationBar = document.querySelector('.notification-bar');

  if (!track) return;

  if (!headlines || headlines.length === 0) {
    // Show default welcome message instead of hiding bar
    track.innerHTML = '<span class="notification-item">📢 Welcome to ISTE Telangana Chapter</span><span class="notification-item">📢 Welcome to ISTE Telangana Chapter</span>';
    return;
  }

  if (notificationBar) {
    notificationBar.style.background = 'linear-gradient(90deg, #dc3545, #c82333)';
  }

  var html = '';
  for (var i = 0; i < headlines.length; i++) {
    html += '<span class="notification-item">📢 ' + headlines[i].text + '</span>';
  }
  track.innerHTML = html + html;
}

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  var date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Events grid
async function renderEvents(containerId, limit) {
  limit = limit || 6;
  var data = await fetchEvents(limit);
  var container = document.getElementById(containerId);
  if (!container) return;

  if (!data.events || data.events.length === 0) {
    container.innerHTML = '<p class="no-data" style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">No events available at the moment.</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < data.events.length; i++) {
    var event = data.events[i];
    var eventDate = event.eventDate ? formatEventDate(event.eventDate) : '';
    var coverImage = event.coverImage ? '<img src="' + event.coverImage + '" alt="' + event.title + '" style="width:100%;height:100%;object-fit:cover;">' : '📅';
    var shortDesc = event.shortDescription ? event.shortDescription.substring(0, 80) + '...' : '';

    html += '<a href="event-details.html?id=' + event._id + '" class="event-card" style="display:block;text-decoration:none;color:inherit;">';
    html += '<div class="event-image">' + coverImage + '<div class="event-date">' + eventDate + '</div></div>';
    html += '<div class="event-content">';
    html += '<span class="event-category">' + (event.eventType || 'Event') + '</span>';
    html += '<h3>' + event.title + '</h3>';
    html += '<p>' + shortDesc + '</p>';
    html += '<div class="event-meta">';
    html += '<span>📍 ' + (event.location || 'TBA') + '</span>';
    html += '<span>👥 ' + (event.attendees || 0) + '+</span>';
    html += '</div>';
    if (event.registrationLink) {
      html += '<a href="' + event.registrationLink + '" target="_blank" style="display:inline-block;margin-top:10px;padding:8px 20px;background:#FF6B35;color:white;border-radius:25px;font-size:13px;font-weight:600;text-decoration:none;">Register Now →</a>';
    }
    html += '</div></a>';
  }
  container.innerHTML = html;
}

// Members grid
async function renderMembers(containerId, committee, limit) {
  limit = limit || 8;
  var data = await fetchMembers(committee, limit);
  var container = document.getElementById(containerId);
  if (!container) return;

  if (!data.members || data.members.length === 0) {
    container.innerHTML = '<p class="no-data" style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">No committee members available.</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < data.members.length; i++) {
    var member = data.members[i];
    var photo = member.photo ? '<img src="' + member.photo + '" alt="' + member.name + '" style="width:100%;height:100%;object-fit:cover;">' : '👤';

    html += '<div class="committee-card">';
    html += '<div class="committee-image">' + photo + '</div>';
    html += '<div class="committee-info">';
    html += '<h3>' + member.name + '</h3>';
    html += '<div class="committee-role">' + member.designation + '</div>';
    html += '<div class="committee-org">' + member.organization + '</div>';
    html += '</div></div>';
  }
  container.innerHTML = html;
}

// Awards grid
async function renderAwards(containerId, limit) {
  limit = limit || 10;
  var data = await fetchAwards(limit);
  var container = document.getElementById(containerId);
  if (!container) return;

  if (!data.awards || data.awards.length === 0) {
    container.innerHTML = '<p class="no-data" style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">No awards available.</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < data.awards.length; i++) {
    var award = data.awards[i];

    html += '<div class="award-card">';
    html += '<div class="award-icon">🏆</div>';
    html += '<div class="award-content">';
    html += '<h3>' + award.awardTitle + '</h3>';
    html += '<p>' + (award.recipientName || '') + '</p>';
    html += '<p style="font-size:13px;color:#666;margin-top:5px;">' + (award.description || '') + '</p>';
    html += '<div class="award-year">' + (award.year || '') + '</div>';
    html += '</div></div>';
  }
  container.innerHTML = html;
}

// Gallery grid
async function renderGallery(containerId, limit) {
  limit = limit || 8;
  var data = await fetchGallery(null, limit);
  var container = document.getElementById(containerId);
  if (!container) return;

  if (!data.gallery || data.gallery.length === 0) {
    container.innerHTML = '<p class="no-data" style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">No gallery albums available.</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < data.gallery.length; i++) {
    var album = data.gallery[i];
    var coverImage = album.coverImage
      ? '<img src="' + album.coverImage + '" alt="' + album.albumTitle + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">'
      : '<span style="font-size:40px;">📷</span><p style="color:#333;margin-top:10px;">' + album.albumTitle + '</p>';

    html += '<div class="gallery-item">' + coverImage + '</div>';
  }
  container.innerHTML = html;
}

// Announcements list
async function renderAnnouncements(containerId, limit) {
  limit = limit || 5;
  var data = await fetchAnnouncements(limit);
  var container = document.getElementById(containerId);
  if (!container) return;

  if (!data.announcements || data.announcements.length === 0) {
    container.innerHTML = '<p class="no-data" style="text-align:center;padding:40px;color:#666;">No announcements available.</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < data.announcements.length; i++) {
    var ann = data.announcements[i];
    html += '<div class="notice-card notice-' + (ann.priority || 'medium') + '">';
    html += '<h4>' + ann.title + '</h4>';
    html += '<p>' + ann.content + '</p>';
    html += '<span class="notice-date">' + new Date(ann.createdAt).toLocaleDateString() + '</span>';
    html += '</div>';
  }
  container.innerHTML = html;
}

// Documents list
async function renderDocuments(containerId, limit) {
  limit = limit || 10;
  var data = await fetchDocuments(null, limit);
  var container = document.getElementById(containerId);
  if (!container) return;

  if (!data.documents || data.documents.length === 0) {
    container.innerHTML = '<p class="no-data" style="text-align:center;padding:40px;color:#666;">No documents available.</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < data.documents.length; i++) {
    var doc = data.documents[i];
    html += '<div class="document-item">';
    html += '<span class="doc-icon">📄</span>';
    html += '<div class="doc-info">';
    html += '<h4>' + doc.title + '</h4>';
    html += '<a href="' + doc.file + '" download class="download-link">Download</a>';
    html += '</div></div>';
  }
  container.innerHTML = html;
}

// Notifications list (full page view for notifications.html)
async function renderNotificationsList(containerId) {
  var data = await fetchNotifications(50);
  var container = document.getElementById(containerId);
  if (!container) return;

  var notifications = data.notifications || [];

  if (notifications.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">No notifications available at the moment.</p>';
    return;
  }

  var html = '';
  for (var i = 0; i < notifications.length; i++) {
    var n = notifications[i];
    var priorityClass = n.priority || 'medium';
    var date = new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    html += '<div class="notification-card ' + priorityClass + '">';
    html += '<div class="notification-header">';
    html += '<span class="notification-title">' + n.title + '</span>';
    html += '<span class="notification-badge badge-' + priorityClass + '">' + (n.priority || 'Medium') + '</span>';
    html += '</div>';
    html += '<p class="notification-message">' + n.message + '</p>';
    html += '<div class="notification-meta">';
    html += '<span>📅 ' + date + '</span>';
    html += '<span>🏷️ ' + (n.type || 'Info') + '</span>';
    html += '</div></div>';
  }
  container.innerHTML = html;
}

// Site settings — update hero, footer contact info
async function renderSettings() {
  var settings = await fetchSettings();

  // Hero section (index.html)
  if (settings.heroTitle) {
    var heroTitle = document.getElementById('heroTitle');
    if (heroTitle) heroTitle.innerHTML = settings.heroTitle;
  }
  if (settings.heroSubtitle) {
    var heroSubtitle = document.getElementById('heroSubtitle');
    if (heroSubtitle) heroSubtitle.textContent = settings.heroSubtitle;
  }
  if (settings.ctaText) {
    var ctaBtn = document.getElementById('ctaButton');
    if (ctaBtn) ctaBtn.textContent = settings.ctaText;
  }

  // Footer contact info (all pages)
  if (settings.contactEmail) {
    var emailLinks = document.querySelectorAll('footer a[href^="mailto:"]');
    for (var i = 0; i < emailLinks.length; i++) {
      emailLinks[i].href = 'mailto:' + settings.contactEmail;
      emailLinks[i].textContent = settings.contactEmail;
    }
  }
  if (settings.contactPhone) {
    var phoneLinks = document.querySelectorAll('footer a[href^="tel:"]');
    for (var i = 0; i < phoneLinks.length; i++) {
      phoneLinks[i].href = 'tel:' + settings.contactPhone.replace(/\s/g, '');
      phoneLinks[i].textContent = settings.contactPhone;
    }
  }
}

// About page — load about content and real stats from DB
async function renderAbout() {
  var settings = await fetchSettings();

  // Update about text from settings
  if (settings.aboutTitle) {
    var titleEl = document.querySelector('.about-text h2');
    if (titleEl) titleEl.textContent = settings.aboutTitle;
  }
  var aboutDiv = document.getElementById('aboutContent');
  if (aboutDiv && settings.aboutContent) {
    aboutDiv.innerHTML = settings.aboutContent.split('\n').map(function (p) { return '<p>' + p + '</p>'; }).join('');
  } else if (aboutDiv && !settings.aboutContent) {
    aboutDiv.innerHTML = '<p>The Indian Society for Technical Education (ISTE) Telangana Chapter is dedicated to promoting technical excellence in education across the state.</p><p>We organize workshops, seminars, conferences, and hackathons to foster innovation and knowledge sharing among students, teachers, and professionals.</p><p>Our mission is to create a platform for technical education professionals to connect, learn, and grow together.</p>';
  }

  // Load real stats from dashboard API
  var stats = await fetchDashboardStats();
  var statMembers = document.getElementById('statMembers');
  var statEvents = document.getElementById('statEvents');
  var statAwards = document.getElementById('statAwards');
  var statGallery = document.getElementById('statGallery');

  if (statMembers && stats.members !== undefined) statMembers.textContent = stats.members + '+';
  if (statEvents && stats.events !== undefined) statEvents.textContent = stats.events + '+';
  if (statAwards && stats.awards !== undefined) statAwards.textContent = stats.awards + '+';
  if (statGallery && stats.gallery !== undefined) statGallery.textContent = stats.gallery + '+';
}

// Contact page — load contact info from settings
async function renderContact() {
  var settings = await fetchSettings();

  if (settings.contactEmail) {
    var emailEl = document.getElementById('contactEmail');
    if (emailEl) emailEl.textContent = settings.contactEmail;
  }
  if (settings.contactPhone) {
    var phoneEl = document.getElementById('contactPhone');
    if (phoneEl) phoneEl.textContent = settings.contactPhone;
  }
  if (settings.contactAddress) {
    var addressEl = document.getElementById('contactAddress');
    if (addressEl) addressEl.textContent = settings.contactAddress;
  }
}

// ========== AUTO-INIT ==========
// Automatically detect which page we're on and load the right content

async function initDynamicContent() {
  // Show loading state on grid containers
  var containers = ['eventsGrid', 'committeeGrid', 'galleryGrid', 'announcementsGrid', 'awardsGrid'];
  for (var i = 0; i < containers.length; i++) {
    var el = document.getElementById(containers[i]);
    if (el) el.innerHTML = '<p class="loading" style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">Loading...</p>';
  }

  // Always render notification bar
  await renderUrgentNotifications();

  // Render page-specific content
  if (document.getElementById('eventsGrid')) {
    await renderEvents('eventsGrid');
  }
  if (document.getElementById('committeeGrid')) {
    await renderMembers('committeeGrid', null);
  }
  if (document.getElementById('awardsGrid')) {
    await renderAwards('awardsGrid');
  }
  if (document.getElementById('galleryGrid')) {
    await renderGallery('galleryGrid');
  }
  if (document.getElementById('announcementsGrid')) {
    await renderAnnouncements('announcementsGrid');
  }

  if (document.getElementById('notificationsList')) {
    await renderNotificationsList('notificationsList');
  }

  // Always render settings (footer contact info) and page-specific data
  await renderSettings();
  await renderAbout();
  await renderContact();
}

// Auto-run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDynamicContent);
} else {
  initDynamicContent();
}
