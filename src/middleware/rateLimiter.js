const rateLimit = require('express-rate-limit');

// Rate limiter for lead submissions: 10 submissions per 15 minutes per IP
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many quotation requests from this IP. Please wait 15 minutes before submitting again.'
      }
    });
  }
});

// Strict rate limiter for admin login: 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.set('Retry-After', '900');
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many failed login attempts. Account access is temporarily locked for 15 minutes.'
      }
    });
  }
});

module.exports = {
  leadLimiter,
  authLimiter
};
