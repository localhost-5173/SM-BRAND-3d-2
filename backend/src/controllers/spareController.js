const mongoose = require('mongoose');
const Spare = require('../models/Spare');

/**
 * Public: List active spare parts for service.html.
 */
async function getPublicSpares(req, res, next) {
  try {
    const spares = await Spare.find({ is_active: true }).sort({ sort_order: 1, name: 1 }).lean();
    return res.json({
      success: true,
      data: spares
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: List all spare parts (active and inactive).
 */
async function getAdminSpares(req, res, next) {
  try {
    const spares = await Spare.find().sort({ sort_order: 1, createdAt: -1 }).lean();
    return res.json({
      success: true,
      data: spares
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Create a replacement spare part.
 */
async function createAdminSpare(req, res, next) {
  try {
    const spare = await Spare.create(req.body);
    return res.status(201).json({
      success: true,
      data: spare
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update a replacement spare part.
 */
async function updateAdminSpare(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Spare part with ID '${id}' not found.`
        }
      });
    }

    const updated = await Spare.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Spare part with ID '${id}' not found.`
        }
      });
    }

    return res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Delete a replacement spare part.
 */
async function deleteAdminSpare(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Spare part with ID '${id}' not found.`
        }
      });
    }

    const deleted = await Spare.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Spare part with ID '${id}' not found.`
        }
      });
    }

    return res.json({
      success: true,
      data: {
        message: 'Spare part deleted successfully.'
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicSpares,
  getAdminSpares,
  createAdminSpare,
  updateAdminSpare,
  deleteAdminSpare
};
