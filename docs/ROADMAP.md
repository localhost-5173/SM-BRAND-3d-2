# SM BRAND — Implementation Roadmap

**Document Version:** 1.1.0  
**Status:** Planning & Architectural Approval Phase  

---

## Phase 1: Frontend Fixes, Theme Harmonization & Owner Decision Items

Clean up legacy bugs and dead animation loops without altering the visual design or breaking any public pages.

- [ ] **1.1. Eliminate 280ms Navigation Latency:**
  - File: `assets/js/sm.js` (lines 130–144)
  - Action: Remove the curtain click listener that halts link navigation via `setTimeout(..., 280)`.
  - *Definition of Done:* Clicking internal navigation links transfers instantly between pages with zero artificial delay.
- [ ] **1.2. Deactivate Inactive Cursor Glow Loop:**
  - File: `assets/js/sm.js` (lines 146–162)
  - Action: Wrap the `requestAnimationFrame` loop in an explicit check verifying `.cursor-glow` is rendered and not `display: none`.
  - *Definition of Done:* Browser performance profiler shows zero RAF cycles consumed by `.cursor-glow` on fine-pointer devices.
- [ ] **1.3. Fix Lucide Icon Rendering in `product.html` 404 State:**
  - File: `product.html` (lines 207–211)
  - Action: Add `if (window.lucide) lucide.createIcons();` inside `show('notfound')`.
  - *Definition of Done:* Navigating to `product.html?slug=invalid-slug` displays "Browse All Machines" button with fully rendered SVG arrow icon.
- [ ] **1.4. Token & Inline Style Sanitization:**
  - Files: `assets/css/sm.css`, all 7 HTML files, `assets/js/sm.js`
  - Action: Replace obsolete `--orange` token with `--accent`, update mobile menu link inline styles, and standardize `.status-pill.hot`.
  - *Definition of Done:* Zero instances of `--orange` or `.status-pill.orange` exist in the codebase.
- [ ] **1.5. Update `README.md` to Reflect Monochrome Theme:**
  - File: `README.md`
  - Action: Rewrite Design System section to document the approved `#0a0a0b` monochrome dark theme.
  - *Definition of Done:* README documentation matches `assets/css/sm.css` truth.
- [ ] **1.6. Duplicate Seals Catalog Decision Item (Owner Decision):**
  - Files: `assets/js/sm-data.js`
  - Action: Resolve whether to merge `metal-seals-12mm` (in category `rolls`, tag `acc`) and `seals-12-15-19mm` (in category `hand`, tag `hand`) or preserve both with distinct slugs and descriptions.
  - *Definition of Done:* Owner decision recorded in `docs/DECISIONS.md`; seed catalog aligned accordingly.

---

## Phase 2: Backend Core, Seed Report & Admin Account Setup

Set up the Express server, MongoDB Atlas connection, Mongoose models, and populate the database with the verified 24 catalog products.

- [ ] **2.1. Project Initialization & Dependencies:**
  - Action: Create `package.json`, install `express`, `mongoose`, `dotenv`, `cors`, `helmet`, `cookie-parser`, `bcryptjs`, `jsonwebtoken`, `multer`, `cloudinary`, `file-type`.
  - *Definition of Done:* `npm run dev` boots the server without syntax or runtime errors.
- [ ] **2.2. Mongoose Schemas & Database Connection:**
  - Files: `src/models/Product.js`, `Lead.js`, `Settings.js`, `Spare.js`, `AdminUser.js`
  - Actions: Enforce category/tag matrix validator, slug immutability, Settings singleton key, and WhatsApp phone normalization.
  - *Definition of Done:* Connects to MongoDB Atlas using `MONGODB_URI` and creates collections with specified indexes.
- [ ] **2.3. Database Seed Script & Validation Diagnostic Report:**
  - File: `src/utils/seed.js`
  - Action: Read all 24 product definitions from `assets/js/sm-data.js` and validate each item against Mongoose schema rules before writing.
  - Action: Print a detailed diagnostic report listing every validated product and highlighting any schema validation failures (e.g. spec over maxlength) instead of silently skipping.
  - Action: Execute idempotent upsert by `slug` (`findOneAndUpdate`).
  - Action: Seed initial 6 spare parts from `service.html` and default singleton settings document.
  - *Definition of Done:* Running `npm run seed` outputs a clean validation report and populates 24 products, 6 spares, and 1 settings document in MongoDB.
- [ ] **2.4. Interactive Admin User Creation Script:**
  - File: `src/utils/createAdmin.js`
  - Action: Implement `npm run create-admin` CLI command prompting for admin name, email, and password, hashing via bcrypt (cost 12), and upserting into `AdminUser` collection.
  - *Definition of Done:* Running `npm run create-admin` creates an authenticated admin user in MongoDB without a public registration endpoint.
- [ ] **2.5. Public REST API Endpoints:**
  - Endpoints: `GET /api/products`, `GET /api/products/:slug`, `GET /api/spares`, `GET /api/settings`, `POST /api/leads`
  - Actions: Support `compared=true` query parameter; return 404 for inactive slugs and malformed IDs.
  - *Definition of Done:* All endpoints return valid JSON matching the shapes in `docs/API_CONTRACT.md`.

---

## Phase 3: Frontend Dynamic Integration & Data Attribute Conversion

Switch the public frontend from static fallback data to live backend API data.

- [ ] **3.1. Configure API Base URL & Fallback Settings:**
  - File: `assets/js/sm-config.js`
  - Action: Set `window.SM_API_BASE = ""` and declare `window.SM_FALLBACK_WA = "923102261760"`.
  - *Definition of Done:* Public frontend queries same-origin `/api` while maintaining local fallback if backend is asleep.
- [ ] **3.2. Data Attribute Conversion for Contact Details:**
  - Files: `contact.html`, `index.html`, `machines.html`, `product.html`, `rolls.html`, `service.html`, `tools.html`
  - Action: Convert all 27 hardcoded phone numbers, emails, and WhatsApp URLs (identified in `VERIFIED_FINDINGS.md`) to HTML data attributes: `data-wa-link`, `data-phone`, `data-email`.
  - Action: Implement `SM.fetchSettings()` in `sm.js` with `sessionStorage` caching; dynamically rewrite attributes on DOM load.
  - *Definition of Done:* Changing WhatsApp number in database updates every WhatsApp button and phone link across all 7 pages.
- [ ] **3.3. Equipment Finder Wizard Dynamic Prices:**
  - File: `assets/js/sm.js` (`SM.initFinder()`)
  - Action: Update `pickRecommendation()` to look up prices directly from `list.find(p => p.name === rec.n)?.price_label` rather than hardcoded string literals. Add graceful fallback if a recommended SKU is missing.
  - *Definition of Done:* Wizard displays live prices from database products.
- [ ] **3.4. Align Client Phone Validation in `contact.html`:**
  - File: `contact.html` & `assets/js/sm.js` (`SM.initQuoteForm()`)
  - Action: Update client validation rule from 10–14 digits to 10–15 digits to match server-side normalization rule (`/^\d{10,15}$/`).
  - *Definition of Done:* Valid 15-digit international numbers pass client validation.
- [ ] **3.5. Dynamic Spare Parts & Comparison Matrix Rendering:**
  - Files: `service.html`, `machines.html`
  - Action: Hydrate spare parts table from `GET /api/spares`. Hydrate machine comparison matrix from `GET /api/products?compared=true`.
  - *Definition of Done:* Spares and comparison rows update dynamically from the database.

---

## Phase 4: Admin Panel Implementation (Same-Origin)

Build the lightweight administrative dashboard served at `/admin`.

- [ ] **4.1. Admin Static Server, Routing & CSRF Check:**
  - Files: `src/routes/adminRoutes.js`, `src/routes/authRoutes.js`, `src/middleware/csrfCheck.js`
  - *Definition of Done:* Express serves `/admin` dashboard, verifies session via JWT cookie, and blocks state-changing requests lacking valid Origin/Referer.
- [ ] **4.2. Authentication View (`/admin/login.html`):**
  - Features: Email/password login form, error alerts, redirection on success, rate limit handling.
  - *Definition of Done:* Admin logs in, receives `HttpOnly` cookie, and is redirected to dashboard.
- [ ] **4.3. Product Management View (`/admin/#products`):**
  - Features: Data table, search bar, category filter, active toggle, add/edit modal with `is_compared` flag, delete confirmation.
  - Rule: Prevents editing product `slug` on existing items.
  - *Definition of Done:* Admin can create, edit, deactivate, and delete products in real-time.
- [ ] **4.4. Cloudinary Image Uploader:**
  - Features: Drag-and-drop file upload piping to `/api/admin/media/upload` with magic-byte validation and filename sanitization.
  - *Definition of Done:* Uploaded product photos are saved to Cloudinary and the resulting HTTPS URL is populated in the product form.
- [ ] **4.5. Leads Pipeline CRM (`/admin/#leads`):**
  - Features: Inquiries table with pagination (`items`, `page`, `limit`, `total`, `total_pages`), status dropdown, 1-click WhatsApp reply button, internal notes.
  - *Definition of Done:* Inquiries from `contact.html` display in the table; clicking WhatsApp launches chat with customer.
- [ ] **4.6. Settings Manager (`/admin/#settings`):**
  - Features: Form to update WhatsApp number, email, phone, depot addresses, and operating hours.
  - *Definition of Done:* Submitting changes immediately updates public site contact links.

---

## Phase 5: Quality Assurance & Security Verification

- [ ] **5.1. Backward Compatibility & Fallback Testing:**
  - Action: Stop backend server and reload public pages.
  - *Definition of Done:* All catalog grids gracefully fallback to `assets/js/sm-data.js` within 5 seconds without JavaScript console errors.
- [ ] **5.2. Responsive Testing:**
  - Viewports: 375px (iPhone SE), 414px (iPhone 11/13), 768px (iPad), 1440px (Desktop).
  - *Definition of Done:* Admin panel and public pages render without overflow or broken tap targets.
- [ ] **5.3. Security & Injection Audit:**
  - Verification: Test XSS payloads in lead form and product fields. Test brute-force login lockout via `rateLimiter`. Test CSRF origin blocking.
  - *Definition of Done:* All inputs sanitized; brute-force attacks blocked with HTTP 429; CSRF requests blocked with HTTP 403.

---

## Phase 6: Production Deployment

- [ ] **6.1. Environment Configuration:** Set production `MONGODB_URI`, `JWT_SECRET`, and Cloudinary keys on hosting provider.
- [ ] **6.2. Server Daemonization:** Run via PM2 with automatic process restart.
- [ ] **6.3. Domain & SSL Setup:** Bind production domain with Let's Encrypt SSL.
- [ ] **6.4. Final Production Smoke Test:** Submit test lead, verify WhatsApp redirection, confirm database entry in admin panel.
