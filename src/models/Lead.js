const mongoose = require('mongoose');
const { normalizeWhatsApp, isValidWhatsApp } = require('../utils/phoneNormalizer');

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer or company name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name cannot exceed 120 characters']
    },
    whatsapp: {
      type: String,
      required: [true, 'WhatsApp phone number is required'],
      trim: true,
      set: normalizeWhatsApp,
      validate: {
        validator: function (val) {
          return isValidWhatsApp(val);
        },
        message: 'WhatsApp number must contain between 10 and 15 digits after normalization.'
      }
    },
    city: {
      type: String,
      required: [true, 'City selection is required'],
      trim: true,
      maxlength: [60, 'City cannot exceed 60 characters']
    },
    need: {
      type: String,
      required: [true, 'Equipment or material requirement is required'],
      trim: true,
      maxlength: [100, 'Need field cannot exceed 100 characters']
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    source_page: {
      type: String,
      trim: true,
      default: 'contact.html',
      maxlength: [60, 'Source page string cannot exceed 60 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'quoted', 'closed', 'lost'],
        message: 'Status must be one of: new, contacted, quoted, closed, lost'
      },
      default: 'new',
      index: true
    },
    admin_notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters']
    }
  },
  {
    timestamps: true
  }
);

LeadSchema.index({ createdAt: -1, status: 1 });

module.exports = mongoose.model('Lead', LeadSchema);
