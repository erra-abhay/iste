/**
 * Admin Dev Server — serves admin portal on port 3001
 * Proxies /api and /uploads requests to the backend on port 3000
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 3001;
const BACKEND = 'http://localhost:3000';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
};

function proxyRequest(req, res) {
    const url = new URL(req.url, BACKEND);
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: req.method,
        headers: { ...req.headers, host: url.host },
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
        res.writeHead(502);
        res.end('Backend not available');
    });

    req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0];

    // Proxy API and uploads to backend
    if (urlPath.startsWith('/api') || urlPath.startsWith('/uploads')) {
        return proxyRequest(req, res);
    }

    // Redirect root to admin login
    if (urlPath === '/') {
        res.writeHead(302, { Location: '/admin/login.html' });
        return res.end();
    }

    // Serve admin static files
    let filePath;
    if (urlPath.startsWith('/admin')) {
        filePath = path.join(__dirname, urlPath);
    } else {
        // Redirect non-admin paths to admin
        res.writeHead(302, { Location: '/admin/login.html' });
        return res.end();
    }

    const ext = path.extname(filePath).toLowerCase();

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Admin portal running on http://localhost:${PORT}`);
    console.log(`  → Admin login: http://localhost:${PORT}/admin/login.html`);
    console.log(`  → API proxied to ${BACKEND}`);
});
