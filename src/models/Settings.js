const mongoose = require('mongoose');
const { normalizeWhatsApp, isValidWhatsApp } = require('../utils/phoneNormalizer');

const DepotSubSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    hub_name: { type: String, required: true, trim: true }, // e.g. "Karachi Central"
    address: { type: String, required: true, trim: true },  // e.g. "Plot 14, S.I.T.E Industrial Area, Karachi"
    hub_type: { type: String, default: 'Depot & Spares Hub' },
    hours: { type: String, default: 'Mon–Sat 9:00 AM – 9:00 PM PKT' },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const SettingsSchema = new mongoose.Schema(
  {
    singleton_key: {
      type: String,
      required: true,
      unique: true,
      default: 'main',
      immutable: true
    },
    whatsapp_number: {
      type: String,
      required: true,
      trim: true,
      set: normalizeWhatsApp,
      validate: {
        validator: function (val) {
          return isValidWhatsApp(val);
        },
        message: 'WhatsApp number must contain between 10 and 15 digits after normalization.'
      },
      default: '923102261760'
    },
    phone_display: {
      type: String,
      required: true,
      trim: true,
      default: '+92 310 2261760'
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: 'ar7776845@gmail.com'
    },
    operating_hours: {
      type: String,
      default: 'Monday – Saturday: 9:00 AM – 9:00 PM PKT'
    },
    emergency_hours: {
      type: String,
      default: 'Sunday: 11:00 AM – 5:00 PM (Emergency WhatsApp Dispatch)'
    },
    response_time_note: {
      type: String,
      default: 'Average response ~6 min • Mon–Sat 9am – 9pm PKT'
    },
    depots: {
      type: [DepotSubSchema],
      default: [
        {
          city: 'Karachi',
          hub_name: 'Karachi Central',
          address: 'Plot 14, S.I.T.E Industrial Area, Karachi',
          hub_type: 'Direct Display & Spares Depot',
          hours: 'Mon–Sat 9:00 AM – 9:00 PM PKT',
          note: 'Central warehouse with walk-in machine showroom'
        },
        {
          city: 'Lahore',
          hub_name: 'Lahore Hub',
          address: 'Sundar Industrial Estate, Lahore',
          hub_type: 'Technician Base & Spares Stock',
          hours: 'Mon–Sat 9:00 AM – 7:00 PM PKT',
          note: 'Field engineering support for Punjab'
        },
        {
          city: 'Faisalabad',
          hub_name: 'Faisalabad Hub',
          address: 'Khurrianwala Industrial Corridor, Faisalabad',
          hub_type: 'Regional Service Hub',
          hours: 'Mon–Sat 9:00 AM – 6:00 PM PKT',
          note: 'Textile & manufacturing client support'
        }
      ]
    }
  },
  {
    timestamps: true
  }
);

// Method to retrieve or initialize the singleton settings document
SettingsSchema.statics.getSingleton = async function () {
  return await this.findOneAndUpdate(
    { singleton_key: 'main' },
    { $setOnInsert: { singleton_key: 'main' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model('Settings', SettingsSchema);
