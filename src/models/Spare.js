const mongoose = require('mongoose');

const SpareSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Spare part name is required'],
      trim: true,
      maxlength: [120, 'Part name cannot exceed 120 characters']
    },
    compatible_models: {
      type: String,
      required: [true, 'Compatible models string is required'],
      trim: true,
      maxlength: [160, 'Compatible models string cannot exceed 160 characters']
    },
    price_label: {
      type: String,
      required: [true, 'Price display label is required'],
      trim: true
    },
    price_numeric: {
      type: Number,
      default: 0
    },
    status_badge: {
      type: String,
      enum: {
        values: ['in_stock', 'low_stock', 'on_order'],
        message: 'Status badge must be one of: in_stock, low_stock, on_order'
      },
      default: 'in_stock'
    },
    sort_order: {
      type: Number,
      default: 0,
      index: true
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

SpareSchema.index({ is_active: 1, sort_order: 1 });

module.exports = mongoose.model('Spare', SpareSchema);
