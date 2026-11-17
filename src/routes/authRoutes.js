const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const requireAuth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Login with strict rate limiter
router.post('/login', authLimiter, authController.login);

// Logout (Protected)
router.post('/logout', requireAuth, authController.logout);

// Session Verification (Protected)
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
