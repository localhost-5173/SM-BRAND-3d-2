# SM BRAND — API Contract & Specification

**Document Version:** 1.1.0  
**Base URL:** `/api`  
**Authentication Scheme:** Cookie-based JWT (`token` stored in `HttpOnly`, `SameSite=Lax`, `Secure` when `NODE_ENV=production`)  

---

## 1. Standard Response & Error Envelopes

### 1.1. Standard Error Envelope
Used for all `4xx` and `5xx` error responses across both public and admin routes:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary of the problem.",
    "details": [
      {
        "field": "whatsapp",
        "issue": "WhatsApp number must contain between 10 and 15 digits."
      }
    ]
  }
}
```

### Standard Error Codes
- `BAD_REQUEST` (400): Malformed JSON syntax or invalid parameter types.
- `UNAUTHORIZED` (401): Missing, expired, or invalid session token.
- `FORBIDDEN` (403): CSRF validation failure or insufficient permissions.
- `NOT_FOUND` (404): Entity or endpoint does not exist (including invalid slug or invalid MongoDB ObjectId).
- `CONFLICT` (409): Duplicate key (e.g. attempting to create a product with an existing slug).
- `VALIDATION_ERROR` (422): Payload field constraints violated (e.g. invalid category/tag pair, attempted slug mutation).
- `RATE_LIMITED` (429): Rate threshold exceeded (e.g. login brute-force or lead spam).
- `INTERNAL_SERVER_ERROR` (500): Unhandled server exception.

---

## 2. Security & Cross-Cutting Protocols

### 2.1. WhatsApp Number Normalization Rule
All WhatsApp numbers received by the backend (`POST /api/leads`, `PUT /api/admin/settings`, etc.) are processed through a single server-side normalization function:
1. Strip all non-digit characters (spaces, hyphens, parentheses, `+`).
2. If the resulting string starts with `03` and has 11 digits (e.g. `03102261760`), transform the prefix to Pakistan's country code: `923102261760`.
3. Validate that the final string contains **between 10 and 15 pure digits** (`/^\d{10,15}$/`).
*(Note: `contact.html` currently validates 10–14 digits on the client; this will be aligned to 10–15 digits during Phase 3).*

### 2.2. Authentication & Cookie Security
- The session JWT token is transmitted exclusively in an HTTP-only cookie named `token`.
- **`Secure` Flag:** Set to `true` when `process.env.NODE_ENV === 'production'`; set to `false` in development to permit local testing over `http://localhost`.
- **`SameSite` Flag:** Set to `Lax` to protect against cross-site request forgery while allowing top-level navigation.
- **CSRF Defense-in-Depth:** For all state-changing admin routes (`POST`, `PUT`, `PATCH`, `DELETE`), middleware verifies that the `Origin` or `Referer` header matches the server's own origin (`FRONTEND_URL` / `HOST`). Requests originating from foreign origins are rejected with `403 Forbidden` (`code: "FORBIDDEN"`).
- **Login Rate Limiter:** `POST /api/auth/login` is strictly rate-limited to **5 failed login attempts per IP per 15-minute window**. Exceeding this limit returns `429 Too Many Requests` with header `Retry-After: 900`.

### 2.3. Media Upload Security & Cloudinary Policy
- **File Signature (Magic Bytes) Verification:** Middleware checks the initial buffer bytes of uploaded images to verify genuine image headers (`image/jpeg`, `image/png`, `image/webp`). Extension spoofing is rejected with `VALIDATION_ERROR`.
- **Filename Sanitization:** Files are renamed to lowercase alphanumeric strings with timestamp suffixes (e.g. `sm-601-pro-1731850000.webp`) before piping to Cloudinary.
- **Orphan Media Policy:** When an image on a product is replaced via `PUT /api/admin/products/:id`, the controller schedules the old Cloudinary public ID for deletion. A periodic maintenance script or Cloudinary webhook handles permanent orphan cleanup.

---

## 3. Public API Endpoints

### 3.1. `GET /api/products`
Retrieves products for public catalog grids (`machines.html`, `rolls.html`, `tools.html`, `index.html`).

- **Auth Required:** No
- **Query Parameters:**
  - `category` (optional, string): Filter by category (`machines`, `rolls`, `battery`, `hand`).
  - `tag` (optional, string): Filter by subcategory tag (`semi`, `auto`, `high`, `pp`, `pet`, `acc`, `battery`, `hand`).
  - `compared` (optional, boolean): If `true`, returns only products with `is_compared: true`, sorted by `compare_order` ascending.
- **Filtering & Sorting Rules:**
  - Only returns products where `is_active: true`.
  - Default sort order: `sort_order` ascending, then `name` ascending.
  - If `compared=true` is passed: sorted by `compare_order` ascending.
- **Success Response (`200 OK`):** Raw JSON Array (preserving exact backward compatibility with `assets/js/sm.js`).
```json
[
  {
    "_id": "6739bc0123456789abcdef01",
    "slug": "sm601",
    "name": "SM-601 Pro Semi-Auto",
    "price_label": "Rs 285,000",
    "spec": "24/min • PP 9-15mm • 220V",
    "badge": "Best Seller",
    "tag": "semi",
    "category": "machines",
    "img": "https://res.cloudinary.com/smbrand/image/upload/v1/machine-semi.webp",
    "description": "Our most popular machine. Handles 200–1200 cartons a day with adjustable tension.",
    "specs": [
      ["Speed", "24 straps / min"],
      ["Strap", "PP 9–15mm"],
      ["Power", "220V"]
    ],
    "price_numeric": 285000,
    "is_active": true,
    "sort_order": 2,
    "is_compared": true,
    "compare_order": 2
  }
]
```

---

### 3.2. `GET /api/products/:slug`
Retrieves single product metadata for `product.html`.

- **Auth Required:** No
- **URL Parameters:**
  - `slug` (required, string): URL slug (or MongoDB ObjectId).
- **Behavior:**
  - Returns `404 Not Found` if the product does not exist, if `is_active` is `false`, or if `slug` is malformed. Never throws a 500 on invalid ObjectIds.
- **Success Response (`200 OK`):** Raw JSON Object.
```json
{
  "_id": "6739bc0123456789abcdef01",
  "slug": "sm601",
  "name": "SM-601 Pro Semi-Auto",
  "price_label": "Rs 285,000",
  "spec": "24/min • PP 9-15mm • 220V",
  "badge": "Best Seller",
  "tag": "semi",
  "category": "machines",
  "img": "https://res.cloudinary.com/smbrand/image/upload/v1/machine-semi.webp",
  "description": "Our most popular machine. Handles 200–1200 cartons a day with adjustable tension.",
  "specs": [
    ["Speed", "24 straps / min"],
    ["Strap", "PP 9–15mm"],
    ["Power", "220V"]
  ],
  "is_compared": true,
  "compare_order": 2
}
```
- **Error Response (`404 Not Found`):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product with slug 'sm-unknown' not found."
  }
}
```

---

### 3.3. `GET /api/spares`
Retrieves active spare parts for `service.html`.

- **Auth Required:** No
- **Filtering & Sorting:** Returns only `is_active: true`, sorted by `sort_order` ascending.
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6739c123456789abcdef0001",
      "name": "Tungsten Heating Blade Assembly",
      "compatible_models": "SM-601 / SM-801 / SM-450",
      "price_label": "Rs 4,500",
      "price_numeric": 4500,
      "status_badge": "in_stock",
      "sort_order": 1
    }
  ]
}
```

---

### 3.4. `GET /api/settings`
Provides global contact numbers, WhatsApp routing, depot locations, and operating hours.

- **Auth Required:** No
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "whatsapp_number": "923102261760",
    "phone_display": "+92 310 2261760",
    "email": "ar7776845@gmail.com",
    "operating_hours": "Monday – Saturday: 9:00 AM – 9:00 PM PKT",
    "emergency_hours": "Sunday: 11:00 AM – 5:00 PM (Emergency WhatsApp Dispatch)",
    "response_time_note": "Average response ~6 min • Mon–Sat 9am – 9pm PKT",
    "depots": [
      {
        "city": "Karachi",
        "hub_name": "Karachi Central",
        "address": "Plot 14, S.I.T.E Industrial Area, Karachi",
        "hub_type": "Direct Display & Spares Depot",
        "hours": "Mon–Sat 9:00 AM – 9:00 PM PKT",
        "note": "Central warehouse with walk-in machine showroom"
      }
    ]
  }
}
```

---

### 3.5. `POST /api/leads`
Submits a quotation inquiry from `contact.html`.

- **Auth Required:** No
- **Rate Limit:** 10 requests per IP per 15 minutes.
- **Request Body (JSON):**
```json
{
  "name": "Tariq Textiles",
  "whatsapp": "03102261760",
  "city": "Karachi",
  "need": "Automatic Arch Strapping Machine",
  "message": "Require 2 units with free installation in SITE Area.",
  "source_page": "contact.html"
}
```
- **Validation Rules:**
  - `name`: string, min 2, max 120 chars. Required.
  - `whatsapp`: string, normalized to 10–15 digits. Required.
  - `city`: string, max 60 chars. Required.
  - `need`: string, max 100 chars. Required.
  - `message`: string, optional, max 1000 chars.
  - `source_page`: string, optional, max 60 chars.
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "lead_id": "6739d456789abcdef0000001",
    "message": "Quotation request successfully logged."
  }
}
```
- **Error Response (`422 Unprocessable Entity`):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data.",
    "details": [
      {
        "field": "whatsapp",
        "issue": "WhatsApp number must contain between 10 and 15 digits after normalization."
      }
    ]
  }
}
```

---

### 3.6. `GET /api/health`
Health check endpoint for container uptime monitoring and deployment smoke testing.

- **Auth Required:** No
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

---

## 4. Admin Authentication Endpoints

### 4.1. `POST /api/auth/login`
- **Rate Limit:** 5 attempts per IP per 15 minutes.
- **Request Body:** `{ "email": "admin@smbrand.pk", "password": "SecurePassword123!" }`
- **Success Response (`200 OK`):** Sets `token` cookie (`HttpOnly`, `SameSite=Lax`, `Secure` when production).
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6739e123456789abcdef0001",
      "name": "SM Admin",
      "email": "admin@smbrand.pk",
      "role": "admin"
    }
  }
}
```

### 4.2. `POST /api/auth/logout`
- **Auth Required:** Yes
- **Success Response (`200 OK`):** Clears `token` cookie.
```json
{
  "success": true,
  "data": { "message": "Logged out successfully." }
}
```

### 4.3. `GET /api/auth/me`
- **Auth Required:** Yes
- **Success Response (`200 OK`):** Returns active user payload.

---

## 5. Admin Management Endpoints

All admin endpoints require a valid session cookie and pass CSRF origin checks.

### 5.1. Product Management

#### `GET /api/admin/products`
Lists all products including inactive items.
- **Query Params:** `category` (optional), `search` (optional).
- **Success Response (`200 OK`):** `{ "success": true, "data": [ ...Product ] }`

#### `POST /api/admin/products`
Creates a new product.
- **Validation Rules:**
  - `slug`: kebab-case, unique, immutable. Required.
  - `name`: max 120 chars. Required.
  - `category`: `machines`, `rolls`, `battery`, `hand`. Required.
  - `tag`: must belong to `category` per vocabulary table. Required.
  - `price_label`: required.
  - `spec`: max 160 chars. Required.
  - `img`: valid URL or relative path. Required.
  - `description`: required.
  - `specs`: array of `[label, value]` tuples.
  - `is_compared`: boolean.
  - `compare_order`: number.
- **Success Response (`201 Created`):** `{ "success": true, "data": { ...Product } }`
- **Error Response (`409 Conflict`):** Slug already exists.
- **Error Response (`422 Validation Error`):** Tag does not match category.

#### `PUT /api/admin/products/:id`
Updates an existing product.
- **IMMUTABLE SLUG RULE:** If the request body contains a `slug` different from the existing document, the request is rejected with `422 Unprocessable Entity`:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product slug is immutable and cannot be changed after creation."
  }
}
```
- **Success Response (`200 OK`):** `{ "success": true, "data": { ...UpdatedProduct } }`

#### `DELETE /api/admin/products/:id`
Permanently deletes a product.
- **Success Response (`200 OK`):** `{ "success": true, "data": { "message": "Product deleted successfully." } }`

---

### 5.2. Spare Parts Management

#### `GET /api/admin/spares`
Lists all spare parts.
- **Success Response (`200 OK`):** `{ "success": true, "data": [ ...Spare ] }`

#### `POST /api/admin/spares`
- **Request Body:** `{ "name": "Blade", "compatible_models": "SM-601", "price_label": "Rs 4,500", "price_numeric": 4500, "status_badge": "in_stock", "sort_order": 1, "is_active": true }`
- **Success Response (`201 Created`):** `{ "success": true, "data": { ...Spare } }`

#### `PUT /api/admin/spares/:id`
- **Success Response (`200 OK`):** `{ "success": true, "data": { ...UpdatedSpare } }`

#### `DELETE /api/admin/spares/:id`
- **Success Response (`200 OK`):** `{ "success": true, "data": { "message": "Spare part deleted successfully." } }`

---

### 5.3. Settings Management

#### `GET /api/admin/settings`
- **Success Response (`200 OK`):** Returns full settings document.

#### `PUT /api/admin/settings`
- **Request Body:**
```json
{
  "whatsapp_number": "03102261760",
  "phone_display": "+92 310 2261760",
  "email": "ar7776845@gmail.com",
  "operating_hours": "Monday – Saturday: 9:00 AM – 9:00 PM PKT",
  "emergency_hours": "Sunday: 11:00 AM – 5:00 PM (Emergency WhatsApp Dispatch)",
  "response_time_note": "Average response ~6 min • Mon–Sat 9am – 9pm PKT",
  "depots": [
    {
      "city": "Karachi",
      "hub_name": "Karachi Central",
      "address": "Plot 14, S.I.T.E Industrial Area, Karachi",
      "hub_type": "Direct Display & Spares Depot",
      "hours": "Mon–Sat 9:00 AM – 9:00 PM PKT",
      "note": "Main showroom"
    }
  ]
}
```
- **Server Behavior:** Normalizes `whatsapp_number` (converts `03102261760` to `923102261760`). Updates singleton document via `findOneAndUpdate`.
- **Success Response (`200 OK`):** `{ "success": true, "data": { ...Settings } }`

---

### 5.4. Media Upload (`POST /api/admin/media/upload`)
- **Headers:** `Content-Type: multipart/form-data`
- **Field:** `image` (JPEG, PNG, WebP $\le 8$ MB)
- **Validation:** Verifies magic bytes file signature. Sanitizes filename.
- **Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/smbrand/image/upload/v1731850000/sm-brand/products/sm601-pro-1731850000.webp",
    "public_id": "sm-brand/products/sm601-pro-1731850000",
    "format": "webp",
    "width": 1200,
    "height": 900
  }
}
```

---

### 5.5. Leads Pipeline Management

#### `GET /api/admin/leads`
Lists leads with pagination and filtering.
- **Query Parameters:**
  - `status` (optional): `new`, `contacted`, `quoted`, `closed`, `lost`.
  - `search` (optional): filter by customer name, phone, or city.
  - `page` (optional, default `1`): page number.
  - `limit` (optional, default `25`, max `100`): items per page.
- **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "6739d456789abcdef0000001",
        "name": "Tariq Textiles",
        "whatsapp": "923102261760",
        "city": "Karachi",
        "need": "Automatic Arch Strapping Machine",
        "message": "Need 2 units.",
        "source_page": "contact.html",
        "status": "new",
        "admin_notes": "",
        "createdAt": "2026-11-17T14:30:00.000Z"
      }
    ],
    "page": 1,
    "limit": 25,
    "total": 142,
    "total_pages": 6
  }
}
```

#### `PATCH /api/admin/leads/:id`
Updates lead status or notes.
- **Request Body:** `{ "status": "quoted", "admin_notes": "Sent quotation via WhatsApp." }`
- **Success Response (`200 OK`):** `{ "success": true, "data": { ...Lead } }`

---

## 6. Frontend Dynamic Settings Usage Specification

To eliminate hardcoded phone numbers, emails, and depot coordinates, the frontend will be converted in Phase 3 to consume dynamic settings.

### 6.1. Client Settings Client (`SM.fetchSettings()`)
```javascript
SM.fetchSettings = function () {
  var cached = sessionStorage.getItem('sm_settings');
  if (cached) {
    try {
      var parsed = JSON.parse(cached);
      SM.applySettings(parsed);
    } catch (e) {}
  }

  return fetch((window.SM_API_BASE || '') + '/api/settings')
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res && res.success && res.data) {
        sessionStorage.setItem('sm_settings', JSON.stringify(res.data));
        SM.applySettings(res.data);
      }
    })
    .catch(function () {
      // Fallback: retains hardcoded constants from sm-config.js
    });
};
```

### 6.2. HTML Data Attributes & Dynamic Rewriting
Static HTML templates will use data attributes:
- `data-wa-link`: Any link whose `href` should point to `https://wa.me/<whatsapp_number>?text=...`
- `data-phone`: Elements displaying the phone number
- `data-email`: Elements displaying or linking to the official email

### 6.3. Fallback Hierarchy
The **ONLY** hardcoded fallback WhatsApp number in the entire repository will live in [assets/js/sm-config.js](file:///c:/Users/Ali/Desktop/SM-BRAND-3d/SM-BRAND-3D/assets/js/sm-config.js):
```javascript
window.SM_FALLBACK_WA = "923102261760";
```

### 6.4. Target Conversion Locations (from `VERIFIED_FINDINGS.md`)

In Phase 3, these 27 hardcoded lines will be converted to data attributes:
- `contact.html`: lines 139, 140, 147, 177, 178, 209
- `index.html`: lines 75, 456, 460, 480, 481, 515
- `machines.html`: lines 172, 176, 196, 197, 228
- `product.html`: lines 154, 155, 186
- `rolls.html`: lines 94, 131, 154, 155, 186
- `service.html`: lines 183, 187, 207, 208, 239
- `tools.html`: lines 105, 128, 129, 160

---

## 7. Featured Products & Wizard Resilience Rule

1. **Homepage Featured Products Graceful Skip:** If `index.html` requests a specific slug (`want = [['machines','sm601'], ...]`) that has been deleted or deactivated in the database, `index.html` must filter out `null`/`undefined` items and fall back to the top available active products. It **must never crash or display an empty card**.
2. **Wizard Price Resolution from Data:** The Equipment Finder wizard on `index.html` must resolve product prices dynamically from the loaded catalog array (`p.price_label`) instead of reading hardcoded text values from `assets/js/sm.js`. If a recommended SKU is deactivated, the wizard falls back to the nearest active tier.
