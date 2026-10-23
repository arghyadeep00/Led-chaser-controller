const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route imports
const pagesRoutes = require('./routes/pages');
const dashboardRoutes = require('./routes/dashboard');
const deviceRoutes = require('./routes/device');
const effectsRoutes = require('./routes/effects');
const automationRoutes = require('./routes/automation');
const simulatorRoutes = require('./routes/simulator');

const app = express();

// Security headers with CSP tailored for local assets & dashboard charts
const isHttps = process.env.ENABLE_HTTPS === 'true' || process.env.USE_SSL === 'true';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: isHttps ? [] : null
      }
    },
    hsts: isHttps ? undefined : false,
    crossOriginEmbedderPolicy: false
  })
);

// Request logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// Mount routes
app.use('/', pagesRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api', effectsRoutes);
app.use('/api', automationRoutes);
app.use('/api', simulatorRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
