const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after a minute.'
  }
});

// Stricter rate limit for command submissions to prevent spamming
const commandLimiter = rateLimit({
  windowMs: 10000, // 10 seconds
  max: 30, // max 30 commands per 10s
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Command rate limit exceeded. Please wait a moment before sending more commands.'
  }
});

module.exports = {
  apiLimiter,
  commandLimiter
};
