# ISTE Telangana - Dynamic Organization Portal

A fully dynamic organization portal with MongoDB backend, REST API, and professional admin control panel.

## Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)

### Installation

1. **Install Backend Dependencies**

```bash
cd iste-telangana/backend
npm install
```

2. **Start MongoDB**
   Make sure MongoDB is running on `localhost:27017`

3. **Seed the Database (First Time)**

```bash
node seed.js
```

4. **Start the Server**

```bash
npm start
```

   Server runs at: `http://localhost:3000`

### Alternative: Run from Root

```bash
cd iste-telangana
npm install
npm run seed
npm start
```

## Access Points

| URL | Description |
|-----|-------------|
| `http://localhost:3000/` | Frontend Website |
| `http://localhost:3000/admin/` | Admin Panel |
| `http://localhost:3000/api/` | API Base |

## Default Admin Credentials

- **Email:** admin@iste-telangana.org
- **Password:** isteadmin2025

## Features

- ✅ Events Management
- ✅ Committee/Members Management
- ✅ Awards Management
- ✅ Gallery Management
- ✅ Notifications/Announcements
- ✅ Headlines System
- ✅ Document Management
- ✅ Site Settings

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/members` | Get all members |
| GET | `/api/awards` | Get all awards |
| GET | `/api/gallery` | Get gallery items |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/headlines` | Get headlines |
| GET | `/api/settings` | Get site settings |

## Project Structure

```
iste-telangana/
├── index.html           # Homepage
├── about.html           # About page
├── events.html          # Events page
├── committee.html       # Committee page
├── awards.html          # Awards page
├── gallery.html         # Gallery page
├── contact.html         # Contact page
├── notifications.html   # Notifications page
├── api/
│   └── client.js        # API client
├── admin/
│   ├── index.html       # Admin dashboard
│   ├── login.html       # Admin login
│   └── pages/          # Admin pages
└── backend/
    ├── server.js        # Express server
    ├── models/          # Mongoose models
    ├── routes/          # API routes
    ├── middleware/      # Auth & upload
    └── config/          # DB config
```

## Technology Stack

- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Frontend:** HTML, CSS, JavaScript (Vanilla)

## Notes

- The frontend uses vanilla JavaScript to fetch data from the API
- All content is dynamically loaded from MongoDB
- Admin panel requires authentication
- File uploads are stored in `/backend/uploads/`
