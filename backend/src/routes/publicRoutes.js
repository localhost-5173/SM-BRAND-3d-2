const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const spareController = require('../controllers/spareController');
const settingsController = require('../controllers/settingsController');
const leadController = require('../controllers/leadController');
const { leadLimiter } = require('../middleware/rateLimiter');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok'
    }
  });
});

// Products
router.get('/products', productController.getPublicProducts);
router.get('/products/:slug', productController.getPublicProductBySlug);

// Spare Parts
router.get('/spares', spareController.getPublicSpares);

// Global Settings & Contact Coordinates
router.get('/settings', settingsController.getPublicSettings);

// Lead Inquiries (Rate Limited)
router.post('/leads', leadLimiter, leadController.createLead);

module.exports = router;
