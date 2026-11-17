# SM BRAND — Database Data Model Specification

**Document Version:** 1.1.0  
**Database Engine:** MongoDB Atlas  
**Object Data Modeling (ODM):** Mongoose 8.x  

---

## 1. Overview & Architectural Rules

All data entities must adhere to the following strict principles:
1. **100% Backward Compatibility:** The `Product` schema must produce documents whose JSON representation exactly matches the existing offline object shape in `assets/js/sm-data.js`. The public frontend must consume API responses without requiring modifications to its card templates or detail rendering functions.
2. **Additions Only:** Extended attributes (e.g. `price_numeric`, `is_active`, `sort_order`, `is_compared`, `compare_order`, `timestamps`) are permitted as non-breaking additional fields.
3. **Data Sanitization & Trimming:** All strings must be trimmed. Slugs must be lowercased and stripped of invalid URL characters.
4. **Slug Immutability:** Once a product is created, its `slug` is immutable. Changing a slug would break existing external links, indexed URLs, and customer WhatsApp quote messages.
5. **Singleton Configuration Pattern:** Global settings (`Settings`) are strictly enforced as a single active document via a fixed `singleton_key: 'main'` with a unique index, queried and updated via `findOneAndUpdate` upsert.
6. **WhatsApp Number Normalization:** WhatsApp numbers must be normalized server-side to E.164-compatible pure digits (e.g. `923xx...`) matching `/^\d{10,15}$/`.

---

## 2. Category & Tag Controlled Vocabulary

To ensure consistent filtering in `machines.html`, `rolls.html`, and `tools.html`, the `category` and `tag` fields are restricted to this controlled vocabulary.

The `Product` schema enforces this matrix via a custom Mongoose validator: **a tag is only valid if it belongs to its parent category**.

| Category Value | Allowed Tag Values | Meaning & Usage | Target Page |
|---|---|---|---|
| `machines` | `semi`, `auto`, `high` | Semi-Automatic, Automatic Arch, High-Speed Conveyor | `machines.html` |
| `rolls` | `pp`, `pet`, `acc` | Polypropylene, PET Export, Seals/Buckles/Film/Cart | `rolls.html` |
| `battery` | `battery` | Cordless Battery Friction-Weld & Pneumatic Tools | `tools.html` |
| `hand` | `hand` | Manual Tensioners, Sealers, Replacement Blades | `tools.html` |

```javascript
const CATEGORY_TAG_MAP = {
  machines: ['semi', 'auto', 'high'],
  rolls: ['pp', 'pet', 'acc'],
  battery: ['battery'],
  hand: ['hand']
};
```

---

## 3. Mongoose Schemas

### 3.1. `Product` Schema (`src/models/Product.js`)

Represents all packaging equipment, strapping media, cordless tools, and hardware accessories.

```javascript
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
      immutable: true, // Immutable after creation; PUT /api/admin/products/:id cannot change this
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be valid URL-kebab-case (e.g. sm-601-pro)']
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 120
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
      maxlength: 160
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
      enum: ['machines', 'rolls', 'battery', 'hand']
    },
    tag: {
      type: String,
      required: [true, 'Filter tag is required'],
      trim: true,
      validate: {
        validator: function (val) {
          const allowedTags = CATEGORY_TAG_MAP[this.category];
          return Array.isArray(allowedTags) && allowedTags.includes(val);
        },
        message: props => `Tag '${props.value}' is not valid for category '${this.category}'. Allowed: ${CATEGORY_TAG_MAP[this.category]?.join(', ')}`
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
      type: [[String]], // Array of [Label, Value] tuples, e.g. [["Speed", "24 straps / min"], ["Power", "220V"]]
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
```

#### Comparison Matrix Spec Label Consistency Rule
When an admin marks a product with `is_compared: true`, its `specs` array **MUST** include consistent spec labels so that the `machines.html` comparison table can dynamically align columns:
- `Speed`: Strapping speed (e.g. `"24 straps / min"`)
- `Strap`: Compatible strap width/material (e.g. `"PP 9–15mm"`)
- `Daily Volume` or `Best for`: Daily box capacity (e.g. `"200 – 1,200 boxes / day"`)
- `Tension`: Tension range (e.g. `"15 – 65 kg adjustable"`)
- `Power`: Power supply requirement (e.g. `"220V Single Phase"`)

---

### 3.2. `Lead` Schema (`src/models/Lead.js`)

Stores quotation inquiries captured from `contact.html` and modal quotation triggers.

```javascript
const mongoose = require('mongoose');

// Helper to normalize phone numbers
function normalizeWhatsApp(num) {
  if (!num) return '';
  let digits = String(num).replace(/\D/g, '');
  // Pakistani national number conversion: 03xx -> 923xx
  if (digits.startsWith('03') && digits.length === 11) {
    digits = '92' + digits.substring(1);
  }
  return digits;
}

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
          return /^\d{10,15}$/.test(val);
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
      enum: ['new', 'contacted', 'quoted', 'closed', 'lost'],
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
```

---

### 3.3. `Settings` Schema (`src/models/Settings.js`)

Single-document configuration collection storing contact details, depot coordinates, and business hours. Enforces the singleton pattern via a fixed `singleton_key: 'main'` with a unique index.

```javascript
const mongoose = require('mongoose');

function normalizeWhatsApp(num) {
  if (!num) return '';
  let digits = String(num).replace(/\D/g, '');
  if (digits.startsWith('03') && digits.length === 11) {
    digits = '92' + digits.substring(1);
  }
  return digits;
}

const DepotSubSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    hub_name: { type: String, required: true, trim: true }, // e.g. "Karachi Central"
    address: { type: String, required: true, trim: true },  // e.g. "Plot 14, S.I.T.E Industrial Area, Karachi"
    hub_type: { type: String, default: 'Depot & Spares Hub' },
    hours: { type: String, default: 'Mon–Sat 9:00 AM – 9:00 PM PKT' }, // New: depot-specific hours
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
          return /^\d{10,15}$/.test(val);
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

// Method to get or create the singleton settings document
SettingsSchema.statics.getSingleton = async function () {
  return await this.findOneAndUpdate(
    { singleton_key: 'main' },
    { $setOnInsert: { singleton_key: 'main' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model('Settings', SettingsSchema);
```

---

### 3.4. `Spare` Schema (`src/models/Spare.js`)

Manages replacement parts listed on `service.html`.

```javascript
const mongoose = require('mongoose');

const SpareSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Spare part name is required'],
      trim: true,
      maxlength: 120
    },
    compatible_models: {
      type: String,
      required: [true, 'Compatible models string is required'],
      trim: true,
      maxlength: 160 // e.g. "SM-601 / SM-801 / SM-450"
    },
    price_label: {
      type: String,
      required: [true, 'Price display label is required'],
      trim: true // e.g. "Rs 4,500"
    },
    price_numeric: {
      type: Number,
      default: 0
    },
    status_badge: {
      type: String,
      enum: ['in_stock', 'low_stock', 'on_order'],
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
```

---

### 3.5. `AdminUser` Schema (`src/models/AdminUser.js`)

Stores administrative user accounts with encrypted passwords.

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Administrator name is required'],
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: [true, 'Administrator email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email required']
    },
    password_hash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin'
    },
    last_login: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

AdminUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = mongoose.model('AdminUser', AdminUserSchema);
```

---

## 4. Seeding Process (`src/utils/seed.js`)

The database seed script must execute cleanly via `npm run seed`:
1. **Source of Truth:** Reads `assets/js/sm-data.js` offline catalog (`window.SM_FALLBACK`).
2. **Schema Validation & Reporting:**
   - Evaluates every product through Mongoose schema validation *before* saving.
   - If any product fails schema validation (e.g. `spec` length $> 160$, invalid category/tag pair, malformed slug), it prints a detailed formatted diagnostic report to `console.error` detailing the exact field and error. It **never fails silently**.
3. **Idempotent Upsert:**
   - Uses `findOneAndUpdate({ slug: item.slug }, { $set: item }, { upsert: true, new: true, runValidators: true })`.
   - Running the seed script multiple times will safely update existing items without creating duplicates.
4. **Initial Comparisons Flagging:**
   - Flags the 4 primary machines (`sm450`, `sm601`, `sm801`, `sm950`) with `is_compared: true` and `compare_order: 1..4` to match the existing comparison table in `machines.html`.
5. **Initial Spares Seeding:**
   - Seeds the 6 spare parts from `service.html` into the `spares` collection using idempotent upsert by `name`.
6. **Initial Settings Seeding:**
   - Seeds the default `settings` document using `Settings.getSingleton()`.

---

## 5. Admin User Creation (`npm run create-admin`)

There is **NO public registration endpoint** (`/api/auth/register` does not exist).  
Admin users are created strictly via a CLI command on the server:

```bash
npm run create-admin
```

### Execution Flow:
1. Prompts for Admin Name (default: `SM Admin`).
2. Prompts for Email (validates email syntax).
3. Prompts for Password securely with masked input (minimum 8 characters, at least 1 number/symbol).
4. Generates a bcrypt salt (`cost: 12`) and computes `password_hash`.
5. Upserts the `AdminUser` document in MongoDB Atlas.
6. Prints success confirmation with user email and timestamp.
