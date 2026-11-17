const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { isValidWhatsApp } = require('../utils/phoneNormalizer');

/**
 * Public: Log customer quotation inquiry.
 */
async function createLead(req, res, next) {
  try {
    const { name, whatsapp, city, need, message, source_page } = req.body;
    const errors = [];

    if (!name || String(name).trim().length < 2) {
      errors.push({ field: 'name', issue: 'Customer or company name must be at least 2 characters.' });
    }
    if (!whatsapp || !isValidWhatsApp(whatsapp)) {
      errors.push({ field: 'whatsapp', issue: 'WhatsApp number must contain between 10 and 15 digits after normalization.' });
    }
    if (!city || !String(city).trim()) {
      errors.push({ field: 'city', issue: 'City selection is required.' });
    }
    if (!need || !String(need).trim()) {
      errors.push({ field: 'need', issue: 'Equipment requirement is required.' });
    }

    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data.',
          details: errors
        }
      });
    }

    const lead = await Lead.create({
      name: String(name).trim(),
      whatsapp: String(whatsapp).trim(),
      city: String(city).trim(),
      need: String(need).trim(),
      message: message ? String(message).trim() : '',
      source_page: source_page ? String(source_page).trim() : 'contact.html'
    });

    return res.status(201).json({
      success: true,
      data: {
        lead_id: lead._id,
        message: 'Quotation request successfully logged.'
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Retrieve paginated quotation leads with status/search filtering.
 */
async function getAdminLeads(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      const q = String(req.query.search).trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { whatsapp: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ];
    }

    const [items, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(filter)
    ]);

    const total_pages = Math.ceil(total / limit) || 1;

    return res.json({
      success: true,
      data: {
        items: items,
        page: page,
        limit: limit,
        total: total,
        total_pages: total_pages
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update lead status or sales notes.
 */
async function updateAdminLead(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Lead with ID '${id}' not found.`
        }
      });
    }

    const { status, admin_notes } = req.body;
    const update = {};

    if (status !== undefined) {
      const allowed = ['new', 'contacted', 'quoted', 'closed', 'lost'];
      if (!allowed.includes(status)) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Status must be one of: ${allowed.join(', ')}`
          }
        });
      }
      update.status = status;
    }

    if (admin_notes !== undefined) {
      update.admin_notes = String(admin_notes).trim();
    }

    const updated = await Lead.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Lead with ID '${id}' not found.`
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

module.exports = {
  createLead,
  getAdminLeads,
  updateAdminLead
};
