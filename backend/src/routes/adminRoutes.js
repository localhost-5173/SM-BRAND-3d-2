const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const spareController = require('../controllers/spareController');
const settingsController = require('../controllers/settingsController');
const leadController = require('../controllers/leadController');
const mediaController = require('../controllers/mediaController');

const requireAuth = require('../middleware/auth');
const csrfCheck = require('../middleware/csrfCheck');
const { upload } = require('../middleware/upload');

// Enforce authentication & CSRF defense-in-depth across all admin routes
router.use(requireAuth);
router.use(csrfCheck);

// --- Product Management CRUD ---
router.get('/products', productController.getAdminProducts);
router.post('/products', productController.createAdminProduct);
router.put('/products/:id', productController.updateAdminProduct);
router.delete('/products/:id', productController.deleteAdminProduct);

// --- Spare Parts Management CRUD ---
router.get('/spares', spareController.getAdminSpares);
router.post('/spares', spareController.createAdminSpare);
router.put('/spares/:id', spareController.updateAdminSpare);
router.delete('/spares/:id', spareController.deleteAdminSpare);

// --- Global Settings Management ---
router.get('/settings', settingsController.getAdminSettings);
router.put('/settings', settingsController.updateAdminSettings);

// --- Leads Pipeline CRM ---
router.get('/leads', leadController.getAdminLeads);
router.patch('/leads/:id', leadController.updateAdminLead);

// --- Cloudinary Media Upload ---
router.post('/media/upload', upload.single('image'), mediaController.uploadImage);

module.exports = router;
