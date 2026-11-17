require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const Spare = require('../models/Spare');
const logger = require('./logger');

// Initial comparison machines mapping
const COMPARISON_MAP = {
  sm450: 1,
  sm601: 2,
  sm801: 3,
  sm950: 4
};

// Initial replacement spare parts from service.html
const INITIAL_SPARES = [
  {
    name: 'Tungsten Heating Blade Assembly',
    compatible_models: 'SM-601 / SM-801 / SM-450',
    price_label: 'Rs 4,500',
    price_numeric: 4500,
    status_badge: 'in_stock',
    sort_order: 1,
    is_active: true
  },
  {
    name: 'Hardened Feed & Tension Wheel Set',
    compatible_models: 'All Semi-Automatic Models',
    price_label: 'Rs 3,200',
    price_numeric: 3200,
    status_badge: 'in_stock',
    sort_order: 2,
    is_active: true
  },
  {
    name: 'Integrated Digital PCB Mainboard',
    compatible_models: 'SM-601 Series',
    price_label: 'Rs 18,000',
    price_numeric: 18000,
    status_badge: 'in_stock',
    sort_order: 3,
    is_active: true
  },
  {
    name: 'ZP-19 Lithium Replacement Battery Pack',
    compatible_models: 'ZP-19 & ZP-16 Battery Tools',
    price_label: 'Rs 12,500',
    price_numeric: 12500,
    status_badge: 'in_stock',
    sort_order: 4,
    is_active: true
  },
  {
    name: 'Tool Sealer Blade & Cutter Set',
    compatible_models: 'Manual H-19 & S-19 Tools',
    price_label: 'Rs 1,200',
    price_numeric: 1200,
    status_badge: 'in_stock',
    sort_order: 5,
    is_active: true
  },
  {
    name: 'Heavy Duty Brake & Reel Spring',
    compatible_models: 'Automatic & Semi-Auto Dispensers',
    price_label: 'Rs 2,100',
    price_numeric: 2100,
    status_badge: 'in_stock',
    sort_order: 6,
    is_active: true
  }
];

function loadFallbackProducts() {
  const filePath = path.join(__dirname, '../../assets/js/sm-data.js');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fallback data file not found at ${filePath}`);
  }

  const rawCode = fs.readFileSync(filePath, 'utf8');
  const sandbox = {};
  const fn = new Function('window', rawCode);
  fn(sandbox);

  if (!Array.isArray(sandbox.SM_FALLBACK) || sandbox.SM_FALLBACK.length === 0) {
    throw new Error('Failed to parse SM_FALLBACK array from assets/js/sm-data.js');
  }

  return sandbox.SM_FALLBACK;
}

async function runSeed() {
  logger.info('==================================================');
  logger.info('SM BRAND — Database Seeding & Verification Process');
  logger.info('==================================================');

  await connectDB();

  // 1. Seed & Verify Products
  const rawProducts = loadFallbackProducts();
  logger.info(`Loaded ${rawProducts.length} products from assets/js/sm-data.js`);

  let validCount = 0;
  let invalidCount = 0;
  const validationReport = [];

  for (let i = 0; i < rawProducts.length; i++) {
    const item = { ...rawProducts[i] };

    // Apply comparison flags
    if (COMPARISON_MAP[item.slug]) {
      item.is_compared = true;
      item.compare_order = COMPARISON_MAP[item.slug];
    } else {
      item.is_compared = false;
      item.compare_order = 0;
    }

    item.is_active = true;
    item.sort_order = i + 1;

    // Validate against Mongoose schema
    const doc = new Product(item);
    const validationError = doc.validateSync();

    if (validationError) {
      invalidCount++;
      const issues = Object.keys(validationError.errors).map(k => validationError.errors[k].message);
      validationReport.push({
        slug: item.slug,
        name: item.name,
        status: 'FAILED',
        errors: issues
      });
      logger.error(`Validation failed for [${item.slug}] ${item.name}: ${issues.join('; ')}`);
    } else {
      validCount++;
      // Execute idempotent upsert
      await Product.findOneAndUpdate(
        { slug: item.slug },
        { $set: item },
        { upsert: true, new: true, runValidators: true }
      );
      validationReport.push({
        slug: item.slug,
        name: item.name,
        category: item.category,
        tag: item.tag,
        is_compared: item.is_compared,
        status: 'PASSED'
      });
    }
  }

  // Print Seed Diagnostic Summary
  console.log('\n--- PRODUCT VALIDATION REPORT ---');
  console.table(
    validationReport.map(r => ({
      Slug: r.slug,
      Name: r.name,
      Category: r.category || 'N/A',
      Tag: r.tag || 'N/A',
      Compared: r.is_compared ? 'YES' : 'NO',
      Status: r.status
    }))
  );

  logger.info(`Product Seeding Summary: ${validCount} passed, ${invalidCount} failed.`);
  if (invalidCount > 0) {
    logger.warn('WARNING: Some products failed schema validation. Inspect the table above.');
  }

  // 2. Seed Singleton Settings
  logger.info('Initializing singleton settings...');
  const settings = await Settings.getSingleton();
  logger.info(`Singleton settings initialized. WhatsApp: ${settings.whatsapp_number}, Depots: ${settings.depots.length}`);

  // 3. Seed Replacement Spare Parts
  logger.info('Seeding replacement spare parts...');
  for (const spare of INITIAL_SPARES) {
    await Spare.findOneAndUpdate(
      { name: spare.name },
      { $set: spare },
      { upsert: true, new: true, runValidators: true }
    );
  }
  logger.info(`Seeded ${INITIAL_SPARES.length} replacement spare parts.`);

  logger.info('==================================================');
  logger.info('Database seeding completed successfully.');
  logger.info('==================================================');

  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  logger.error('Seeding process encountered a fatal error:', err);
  process.exit(1);
});
