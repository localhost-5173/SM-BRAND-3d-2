const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const mongoSanitize = require('./src/middleware/mongoSanitize');
const errorHandler = require('./src/middleware/errorHandler');

const publicRoutes = require('./src/routes/publicRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// 1. Deployment proxy configuration (needed for rate-limit and secure cookies behind reverse proxies like Nginx/Cloudflare)
app.set('trust proxy', 1);

// 2. Security HTTP headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow procedural Three.js canvases, GSAP, and Google Fonts
    crossOriginEmbedderPolicy: false
  })
);

// 3. Body parsing & cookie middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. NoSQL injection attack mitigation (strips $ and . from query, params, body)
app.use(mongoSanitize);

// 5. Explicit protection against exposing sensitive repository files over HTTP
app.use((req, res, next) => {
  const normalizedPath = req.path.toLowerCase();
  const blockedPrefixes = [
    '/.env',
    '/.git',
    '/docs',
    '/backend',
    '/src',
    '/node_modules',
    '/package.json',
    '/package-lock.json',
    '/server.js',
    '/readme.md'
  ];

  for (const blocked of blockedPrefixes) {
    if (
      normalizedPath === blocked ||
      normalizedPath.startsWith(blocked + '/') ||
      normalizedPath.startsWith(blocked + '.')
    ) {
      return res.status(404).send('Not Found');
    }
  }
  next();
});

// 6. Mount REST API Routers
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// 7. Mount Admin Dashboard (Phase 4 placeholder)
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// 8. Serve Public Frontend Static Assets (Allowed: HTML files, assets/css, assets/js, assets/img)
app.use(
  express.static(path.join(__dirname, '../frontend'), {
    dotfiles: 'ignore',
    index: ['index.html'],
    extensions: ['html']
  })
);

// 9. API 404 Route Handler
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `API endpoint '${req.method} ${req.url}' was not found.`
    }
  });
});

// 10. Fallback for public SPA routing or static 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 11. Centralized JSON Error Handler
app.use(errorHandler);

// Start HTTP Server
const server = app.listen(PORT, () => {
  logger.info(`SM BRAND Server running on port ${PORT} [NODE_ENV: ${process.env.NODE_ENV || 'development'}]`);
  logger.info(`Public Website: http://localhost:${PORT}`);
  logger.info(`Admin Portal:   http://localhost:${PORT}/admin`);
  logger.info(`API Base URL:   http://localhost:${PORT}/api`);
});

module.exports = { app, server };
