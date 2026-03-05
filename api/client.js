// API Client for ISTE Telangana Frontend
// Use relative URL so it works in both dev (localhost:3000) and production
const API_BASE_URL = '/api';

// ========== FETCH FUNCTIONS ==========

async function fetchEvents(limit, showOnDashboard) {
  limit = limit || 10;
  try {
    var url = API_BASE_URL + '/events?limit=' + limit;
    if (showOnDashboard) url += '&showOnDashboard=true';
    const response = await fetch(url);
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

async function fetchMembers(committee, limit, showOnDashboard) {
  limit = limit || 20;
  try {
    var url = API_BASE_URL + '/members?active=true&limit=' + limit;
    if (committee) url += '&committee=' + committee;
    if (showOnDashboard) url += '&showOnDashboard=true';
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

async function fetchGalleryById(id) {
  try {
    const response = await fetch(API_BASE_URL + '/gallery/' + id);
    return await response.json();
  } catch (error) {
    console.error('Error fetching gallery album:', error);
    return null;
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

async function fetchAwards(limit, showOnDashboard) {
  limit = limit || 10;
  try {
    var url = API_BASE_URL + '/awards?active=true&limit=' + limit;
    if (showOnDashboard) url += '&showOnDashboard=true';
    const response = await fetch(url);
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
    var track = document.getElementById('notificationTrack');
    if (track) {
      var html = '';
      for (var i = 0; i < urgentNotifications.length; i++) {
        html += '<span class="notification-item">🚨 ' + urgentNotifications[i].title + '</span>';
      }
      fillTrack(track, html);
    }
  } else {
    await renderHeadlines();
  }
}

async function renderHeadlines() {
  var headlines = await fetchHeadlines();
  var track = document.getElementById('notificationTrack');

  if (!track) return;

  var html = '';
  if (!headlines || headlines.length === 0) {
    html = '<span class="notification-item">📢 Welcome to ISTE Telangana Chapter</span>';
  } else {
    for (var i = 0; i < headlines.length; i++) {
      html += '<span class="notification-item">📢 ' + headlines[i].text + '</span>';
    }
  }
  fillTrack(track, html);
}

// Fill the notification track with enough copies to cover full viewport width
function fillTrack(track, singleCopyHtml) {
  // Put one copy in to measure its width
  track.innerHTML = singleCopyHtml;
  var singleWidth = track.scrollWidth;
  var viewportWidth = window.innerWidth;
  // Need at least 2x viewport width for seamless scroll (we animate -50%)
  var minWidth = viewportWidth * 2;
  var copies = Math.max(2, Math.ceil(minWidth / Math.max(singleWidth, 1)) + 1);
  var fullHtml = '';
  for (var i = 0; i < copies; i++) {
    fullHtml += singleCopyHtml;
  }
  // Double it for seamless loop (animate first half, second half is duplicate)
  track.innerHTML = fullHtml + fullHtml;
}

function formatEventDate(dateStr) {
  if (!dateStr) return '';
  var date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Events grid
async function renderEvents(containerId, limit, showOnDashboard) {
  limit = limit || 6;
  var data = await fetchEvents(limit, showOnDashboard);
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
async function renderMembers(containerId, committee, limit, showOnDashboard) {
  limit = limit || 8;
  var data = await fetchMembers(committee, limit, showOnDashboard);
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
async function renderAwards(containerId, limit, showOnDashboard) {
  limit = limit || 10;
  var data = await fetchAwards(limit, showOnDashboard);
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

    // Cover image or icon fallback
    if (award.coverImage) {
      html += '<div class="award-cover-img" style="background-image:url(\'' + award.coverImage + '\')"></div>';
    } else {
      html += '<div class="award-icon">' + (award.icon || '🏆') + '</div>';
    }

    html += '<div class="award-content">';
    html += '<h3>' + award.awardTitle + '</h3>';
    html += '<p>' + (award.recipientName || '') + '</p>';
    html += '<p style="font-size:13px;color:#666;margin-top:5px;">' + (award.description || '') + '</p>';
    html += '<div class="award-year">' + (award.year || '') + '</div>';

    // Photo gallery thumbnails
    if (award.photos && award.photos.length > 0) {
      html += '<div class="award-photos">';
      var maxShow = Math.min(award.photos.length, 4);
      for (var j = 0; j < maxShow; j++) {
        html += '<img src="' + award.photos[j] + '" class="award-thumb" onclick="openAwardGallery(' + i + ', ' + j + ')">';
      }
      if (award.photos.length > 4) {
        html += '<span class="award-more" onclick="openAwardGallery(' + i + ', 4)">+' + (award.photos.length - 4) + '</span>';
      }
      html += '</div>';
    }

    html += '</div></div>';
  }

  container.innerHTML = html;

  // Store awards data for gallery lightbox
  window._awardsData = data.awards;
}

// Open award photo gallery lightbox
function openAwardGallery(awardIdx, photoIdx) {
  var awards = window._awardsData;
  if (!awards || !awards[awardIdx] || !awards[awardIdx].photos) return;
  var photos = awards[awardIdx].photos;
  var title = awards[awardIdx].awardTitle || 'Award Photos';

  var overlay = document.createElement('div');
  overlay.id = 'awardLightbox';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;flex-direction:column;';

  var currentIdx = photoIdx || 0;

  function render() {
    overlay.innerHTML = '<div style="position:absolute;top:20px;right:20px;cursor:pointer;color:white;font-size:32px;" onclick="document.getElementById(\'awardLightbox\').remove()">×</div>'
      + '<h3 style="color:white;margin-bottom:15px;font-family:inherit;">' + title + '</h3>'
      + '<img src="' + photos[currentIdx] + '" style="max-width:85vw;max-height:70vh;border-radius:10px;object-fit:contain;">'
      + '<div style="color:white;margin-top:15px;display:flex;gap:20px;align-items:center;">'
      + (photos.length > 1 ? '<button onclick="window._awardNav(-1)" style="background:rgba(255,255,255,0.2);color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:16px;">← Prev</button>' : '')
      + '<span>' + (currentIdx + 1) + ' / ' + photos.length + '</span>'
      + (photos.length > 1 ? '<button onclick="window._awardNav(1)" style="background:rgba(255,255,255,0.2);color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:16px;">Next →</button>' : '')
      + '</div>';
  }

  window._awardNav = function (dir) {
    currentIdx = (currentIdx + dir + photos.length) % photos.length;
    render();
  };

  render();
  document.body.appendChild(overlay);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.remove();
  });
}

// Gallery grid — shows album cards, click to open multi-image viewer
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
    var imageCount = (album.images && album.images.length) || 0;
    var coverStyle = album.coverImage
      ? 'background-image:url(' + album.coverImage + ');background-size:cover;background-position:center;'
      : 'background:linear-gradient(135deg,#003366,#004080);';

    html += '<div class="gallery-album-card" data-album-id="' + album._id + '" onclick="openAlbum(\'' + album._id + '\')" style="cursor:pointer;">';
    html += '<div class="gallery-album-cover" style="' + coverStyle + '">';
    if (imageCount > 0) {
      html += '<span class="gallery-album-count">' + imageCount + ' photos</span>';
    }
    html += '</div>';
    html += '<div class="gallery-album-info">';
    html += '<h3>' + album.albumTitle + '</h3>';
    html += '<span class="gallery-album-category">' + (album.category || '') + '</span>';
    if (album.description) {
      html += '<p>' + album.description + '</p>';
    }
    html += '</div></div>';
  }
  container.innerHTML = html;
}

// Open album — show all images in a lightbox overlay
async function openAlbum(albumId) {
  var album = await fetchGalleryById(albumId);
  if (!album) return;

  var allImages = [];
  if (album.coverImage) allImages.push(album.coverImage);
  if (album.images && album.images.length > 0) {
    for (var i = 0; i < album.images.length; i++) {
      if (album.images[i] !== album.coverImage) {
        allImages.push(album.images[i]);
      }
    }
  }

  if (allImages.length === 0) {
    alert('No images in this album yet.');
    return;
  }

  // Create lightbox overlay
  var overlay = document.createElement('div');
  overlay.className = 'gallery-lightbox-overlay';
  overlay.innerHTML = '<div class="gallery-lightbox-header">' +
    '<h2>' + album.albumTitle + '</h2>' +
    '<button class="gallery-lightbox-close" onclick="closeLightbox()">&times;</button>' +
    '</div>' +
    '<div class="gallery-lightbox-grid" id="lightboxGrid"></div>';

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  var gridHtml = '';
  for (var j = 0; j < allImages.length; j++) {
    gridHtml += '<div class="gallery-lightbox-item" onclick="viewImage(\'' + allImages[j] + '\')">' +
      '<img src="' + allImages[j] + '" alt="' + album.albumTitle + ' - Image ' + (j + 1) + '" loading="lazy">' +
      '</div>';
  }
  document.getElementById('lightboxGrid').innerHTML = gridHtml;
}

function viewImage(src) {
  var viewer = document.createElement('div');
  viewer.className = 'gallery-image-viewer';
  viewer.onclick = function () { viewer.remove(); };
  viewer.innerHTML = '<img src="' + src + '" alt="Full size image">';
  document.body.appendChild(viewer);
}

function closeLightbox() {
  var overlay = document.querySelector('.gallery-lightbox-overlay');
  if (overlay) overlay.remove();
  document.body.style.overflow = '';
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

    // Show attachment if present
    if (n.attachment) {
      var ext = n.attachment.split('.').pop().toLowerCase();
      var isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].indexOf(ext) !== -1;
      var isPdf = ext === 'pdf';

      html += '<div class="notification-attachment">';
      if (isImage) {
        html += '<a href="' + n.attachment + '" target="_blank" class="attachment-link">';
        html += '<img src="' + n.attachment + '" alt="Attachment" class="attachment-preview">';
        html += '<span>📎 View Image</span></a>';
      } else if (isPdf) {
        html += '<a href="' + n.attachment + '" target="_blank" class="attachment-link">';
        html += '<span>📄 View PDF Document</span></a>';
      } else {
        html += '<a href="' + n.attachment + '" target="_blank" class="attachment-link">';
        html += '<span>📎 Download Attachment</span></a>';
      }
      html += '</div>';
    }

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

// ========== FAST PAGE INIT ==========
// Renders notification bar FIRST (no waiting), then loads page content in PARALLEL

async function initPage() {
  // 1. Render notification bar immediately — highest priority
  renderUrgentNotifications();

  // 2. Gather all page-specific renders to run in PARALLEL
  var tasks = [];

  // Settings/footer (runs on every page)
  tasks.push(renderSettings());

  // Page-specific content — all loaded in parallel
  if (document.getElementById('eventsGrid')) {
    var isHome = !!document.querySelector('.hero');
    tasks.push(renderEvents('eventsGrid', isHome ? 6 : 50, isHome));
  }
  if (document.getElementById('committeeGrid')) {
    // Dashboard (index.html) shows only dashboard-selected members; committee page shows all
    var isHomePage = !!document.querySelector('.hero');
    var memberLimit = isHomePage ? 4 : 50;
    tasks.push(renderMembers('committeeGrid', null, memberLimit, isHomePage));
  }
  if (document.getElementById('awardsGrid')) {
    var isHomeAwards = !!document.querySelector('.hero');
    tasks.push(renderAwards('awardsGrid', isHomeAwards ? 10 : 50, isHomeAwards));
  }
  if (document.getElementById('galleryGrid')) {
    tasks.push(renderGallery('galleryGrid'));
  }
  if (document.getElementById('announcementsGrid')) {
    tasks.push(renderAnnouncements('announcementsGrid'));
  }
  if (document.getElementById('notificationsList')) {
    tasks.push(renderNotificationsList('notificationsList'));
  }
  if (document.getElementById('aboutContent')) {
    tasks.push(renderAbout());
  }
  if (document.getElementById('contactEmail') || document.getElementById('contactPhone')) {
    tasks.push(renderContact());
  }

  // 3. Wait for all tasks in parallel
  await Promise.all(tasks);
}

// Auto-run when DOM is ready — single clean init, no duplicates
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
