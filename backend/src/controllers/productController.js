const mongoose = require('mongoose');
const Product = require('../models/Product');

/**
 * Public: List active products for catalog grids.
 * Preserves raw JSON array response for backward compatibility with assets/js/sm.js.
 */
async function getPublicProducts(req, res, next) {
  try {
    const { category, tag, compared } = req.query;
    const filter = { is_active: true };

    if (category) {
      filter.category = String(category).trim();
    }
    if (tag) {
      filter.tag = String(tag).trim();
    }

    let sort = { sort_order: 1, name: 1 };
    if (compared === 'true') {
      filter.is_compared = true;
      sort = { compare_order: 1, name: 1 };
    }

    const products = await Product.find(filter).sort(sort).lean();
    // Return raw array directly to match frontend expectations
    return res.json(products);
  } catch (err) {
    next(err);
  }
}

/**
 * Public: Get single product by slug or id.
 * Returns raw JSON object for backward compatibility.
 */
async function getPublicProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    let product = await Product.findOne({ slug: slug, is_active: true }).lean();

    // Fallback lookup if key is a valid 24-character hex ObjectId
    if (!product && mongoose.Types.ObjectId.isValid(slug)) {
      product = await Product.findOne({ _id: slug, is_active: true }).lean();
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Product with slug '${slug}' not found.`
        }
      });
    }

    return res.json(product);
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: List all products (active and inactive) with optional filters.
 */
async function getAdminProducts(req, res, next) {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      const q = String(search).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ sort_order: 1, createdAt: -1 }).lean();
    return res.json({
      success: true,
      data: products
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Create a new product.
 */
async function createAdminProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update an existing product.
 * Enforces slug immutability: rejects with VALIDATION_ERROR if slug change is attempted.
 */
async function updateAdminProduct(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Product with ID '${id}' not found.`
        }
      });
    }

    const existing = await Product.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Product with ID '${id}' not found.`
        }
      });
    }

    // Reject slug modification
    if (req.body.slug && req.body.slug !== existing.slug) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product slug is immutable and cannot be changed after creation.'
        }
      });
    }

    // Exclude slug from update payload
    delete req.body.slug;

    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    return res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Delete a product permanently.
 */
async function deleteAdminProduct(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Product with ID '${id}' not found.`
        }
      });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Product with ID '${id}' not found.`
        }
      });
    }

    return res.json({
      success: true,
      data: {
        message: 'Product deleted successfully.'
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicProducts,
  getPublicProductBySlug,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct
};
