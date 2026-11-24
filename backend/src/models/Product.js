const mongoose = require('mongoose');

const CATEGORY_TAG_MAP = {
  machines: ['semi', 'auto', 'high'],
  rolls: ['pp', 'pet', 'acc'],
  battery: ['battery'],
  hand: ['hand']
};

const ProductSchema = new mongoose.Schema(
  {
    // --- EXACT BACKWARD-COMPATIBLE FIELDS ---
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      immutable: true, // Slug cannot be changed after creation
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be valid URL-kebab-case (e.g. sm-601-pro)']
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    price_label: {
      type: String,
      required: [true, 'Price display label is required'],
      trim: true,
      default: 'Price on request'
    },
    spec: {
      type: String,
      required: [true, 'Summary specification line is required'],
      trim: true,
      maxlength: [160, 'Summary specification line cannot exceed 160 characters']
    },
    badge: {
      type: String,
      trim: true,
      default: '' // e.g. "Best Seller", "Starter", "Export", "Cordless"
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      enum: {
        values: ['machines', 'rolls', 'battery', 'hand'],
        message: 'Invalid category. Must be one of: machines, rolls, battery, hand'
      }
    },
    tag: {
      type: String,
      required: [true, 'Filter tag is required'],
      trim: true,
      validate: {
        validator: function (val) {
          const cat = this.category;
          const allowedTags = CATEGORY_TAG_MAP[cat];
          return Array.isArray(allowedTags) && allowedTags.includes(val);
        },
        message: function (props) {
          const cat = this.category;
          const allowed = CATEGORY_TAG_MAP[cat] ? CATEGORY_TAG_MAP[cat].join(', ') : 'none';
          return `Tag '${props.value}' is not valid for category '${cat}'. Allowed tags: ${allowed}`;
        }
      }
    },
    img: {
      type: String,
      required: [true, 'Product image URL or path is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    specs: {
      type: [[String]], // Array of [Label, Value] tuples, e.g. [["Speed", "24/min"], ["Power", "220V"]]
      default: []
    },

    // --- ARCHITECTURAL ADDITIONS (NON-BREAKING) ---
    price_numeric: {
      type: Number,
      default: 0,
      index: true
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true
    },
    sort_order: {
      type: Number,
      default: 0,
      index: true
    },
    is_compared: {
      type: Boolean,
      default: false,
      index: true
    },
    compare_order: {
      type: Number,
      default: 0,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes for optimal catalog query performance
ProductSchema.index({ is_active: 1, category: 1, sort_order: 1, name: 1 });
ProductSchema.index({ is_active: 1, is_compared: 1, compare_order: 1 });

module.exports = mongoose.model('Product', ProductSchema);
