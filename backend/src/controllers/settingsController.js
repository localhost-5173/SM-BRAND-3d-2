const Settings = require('../models/Settings');
const { normalizeWhatsApp, isValidWhatsApp } = require('../utils/phoneNormalizer');

/**
 * Public: Get global contact coordinates, phone numbers, and depot locations.
 */
async function getPublicSettings(req, res, next) {
  try {
    const settings = await Settings.getSingleton();
    return res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Get full editable settings document.
 */
async function getAdminSettings(req, res, next) {
  try {
    const settings = await Settings.getSingleton();
    return res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Update global contact coordinates, phone numbers, and depot addresses.
 */
async function updateAdminSettings(req, res, next) {
  try {
    const { whatsapp_number, phone_display, email, operating_hours, emergency_hours, response_time_note, depots } = req.body;
    const update = {};

    if (whatsapp_number !== undefined) {
      if (!isValidWhatsApp(whatsapp_number)) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'WhatsApp number must contain between 10 and 15 digits after normalization.'
          }
        });
      }
      update.whatsapp_number = normalizeWhatsApp(whatsapp_number);
    }

    if (phone_display !== undefined) update.phone_display = String(phone_display).trim();
    if (email !== undefined) update.email = String(email).trim().toLowerCase();
    if (operating_hours !== undefined) update.operating_hours = String(operating_hours).trim();
    if (emergency_hours !== undefined) update.emergency_hours = String(emergency_hours).trim();
    if (response_time_note !== undefined) update.response_time_note = String(response_time_note).trim();

    if (depots !== undefined && Array.isArray(depots)) {
      update.depots = depots;
    }

    const updated = await Settings.findOneAndUpdate(
      { singleton_key: 'main' },
      { $set: update },
      { new: true, runValidators: true, upsert: true }
    );

    return res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings
};
