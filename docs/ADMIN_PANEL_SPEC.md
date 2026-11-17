# SM BRAND — Admin Dashboard Specification

**Document Version:** 1.0.0  
**URL Mount Path:** `/admin`  
**Delivery Method:** Embedded Same-Origin SPA (HTML5, Vanilla ES6, CSS Tokens matching `sm.css`)  
**Target Viewports:** Desktop (1200px+), Tablet (768px–1024px), Mobile Smartphones (360px–480px)  

---

## 1. User Experience Principles

1. **Brand Parity:** The admin dashboard reuses the exact same CSS tokens (`#0a0a0b` background, `#111113` cards, `#26262a` borders, Manrope typography, Lucide icons) as the public website.
2. **Zero Build Dependency:** Implemented in pure HTML, vanilla JavaScript, and CSS. No Webpack, Vite, or node_modules compilation is required for the admin UI to run; it is served directly from the `/admin` folder.
3. **Mobile-First Utility:** Plant managers and business owners frequently review leads and adjust pricing on smartphones. Every screen, table, and form must be fully touch-friendly with minimum 44px tap targets.
4. **Immediate WhatsApp Action:** Every lead row has a prominent green WhatsApp button that opens a pre-composed reply directly on the owner's smartphone or desktop WhatsApp.

---

## 2. Navigation & Layout Structure

The admin interface consists of a persistent responsive layout:
- **Desktop:** Left navigation sidebar (width 260px) + Top header bar with active admin identity & logout button + Main scrollable content view.
- **Mobile (<768px):** Sticky top bar with brand logo and hamburger toggle + Off-canvas sliding drawer for navigation links.

### Navigation Tabs
1. **Dashboard** (`#overview`)
2. **Products** (`#products`)
3. **Spare Parts** (`#spares`)
4. **Leads / Quotes** (`#leads`)
5. **Settings & Contact** (`#settings`)

---

## 3. Screen Specifications

### 3.1. Login Screen (`/admin/login.html`)

A centered glassmorphic card on the dark dotted background.

- **Elements:**
  - SM Brand circular monogram logo + "Admin Portal" subtext.
  - Email input field (`type="email"`, autofocus, placeholder: `admin@smbrand.pk`).
  - Password input field (`type="password"`, placeholder: `••••••••••••`).
  - "Sign In to Dashboard" primary button.
  - Error banner (`#loginError`): hidden by default; displays error messages from `/api/auth/login`.
- **Validation:**
  - Email required, valid format.
  - Password required, minimum 8 characters.
- **Behavior:**
  - Submits via `fetch('/api/auth/login', { method: 'POST' })`.
  - On `200 OK`, redirects immediately to `/admin/`.
  - On `401 Unauthorized`, shakes the form and displays "Invalid email or password."

---

### 3.2. Dashboard Overview Screen (`#overview`)

Summary command center displaying key operational metrics.

- **KPI Cards Grid (4 Columns):**
  1. **New Leads Today:** Number of quotation inquiries received in the last 24 hours (with green highlight badge).
  2. **Total Leads Pipeline:** Total active inquiries awaiting quote or follow-up.
  3. **Active Products:** Count of active catalog items published on the public website.
  4. **Active Spare Parts:** Count of in-stock parts displayed on `service.html`.
- **Recent Leads Feed:**
  - Table showing the 5 latest leads with customer name, city, requirement, timestamp, and quick WhatsApp action.
- **Quick Shortcuts:**
  - "Add New Machine / Roll" button.
  - "Update WhatsApp Number" button.
  - "View Unread Leads" button.

---

### 3.3. Product Management (`#products`)

#### Product List View
- **Controls Bar:**
  - Search input (live client-side filter by name or slug).
  - Category dropdown filter (`All`, `Machines`, `Rolls`, `Battery Tools`, `Hand Tools`).
  - "Add Product" primary button (opens Product Form Modal).
- **Data Table Columns:**
  - Image thumbnail (48x48px rounded).
  - Product Name & Category.
  - Price Label & Tag.
  - Status Toggle (Interactive switch: Active / Hidden).
  - Actions: Edit (opens modal populated with item) and Delete (triggers confirmation dialog).
- **Empty State:** "No products found matching your search. Click 'Add Product' to create one."

#### Product Form Modal / Drawer
- **Modal Fields:**
  1. **Category (Select):** `machines`, `rolls`, `battery`, `hand`.
  2. **Filter Tag (Select):** Contextually populated based on Category:
     - If machines: `semi`, `auto`, `high`.
     - If rolls: `pp`, `pet`, `acc`.
     - If battery: `battery`.
     - If hand: `hand`.
  3. **Product Name (Text input):** e.g. "SM-601 Pro Semi-Auto".
  4. **Slug (Text input):** Auto-generated from name via kebab-case, but manually editable.
  5. **Price Label (Text input):** e.g. "Rs 285,000", "Rs 185 / kg", "From Rs 1.8".
  6. **Numeric Price (Number input):** Optional numeric value for sorting.
  7. **Status Badge (Text input):** e.g. "Best Seller", "Starter", "Export".
  8. **Summary Spec (Text input):** e.g. "24/min • PP 9-15mm • 220V".
  9. **Description (Textarea):** Full promotional and technical paragraph.
  10. **Image Uploader:**
      - Drag-and-drop file dropzone.
      - File input (accepts JPEG, PNG, WebP $\le$ 8 MB).
      - Immediate preview upon selection.
      - Progress indicator while uploading to `/api/admin/media/upload`.
      - Text input displaying resulting Cloudinary URL (allows manual paste as well).
  11. **Technical Specifications Table (Dynamic Rows):**
      - Repeater list of key-value pairs (e.g. `[Speed: "24 straps / min"]`, `[Power: "220V"]`).
      - "+ Add Specification Row" button.
      - "Remove" button per row.
  12. **Active Status Checkbox:** Checked by default.
  13. **Sort Order (Number input):** Default `0`.
- **Validation:**
  - Name, slug, category, tag, price_label, spec, description, and image URL are required.
  - Slugs must be unique and match `^[a-z0-9]+(?:-[a-z0-9]+)*$`.

---

### 3.4. Spare Parts Management (`#spares`)

Simple, high-efficiency interface for managing replacement parts on `service.html`.

- **Controls Bar:** "Add Spare Part" button.
- **Table Columns:**
  - Part Name (e.g. "Tungsten Heating Blade Assembly").
  - Compatible Models (e.g. "SM-601 / SM-801 / SM-450").
  - Price Label (e.g. "Rs 4,500").
  - Status Badge Select (`In Stock` [green], `Low Stock` [amber], `On Order` [muted]).
  - Sort Order & Active Toggle.
  - Actions: Edit & Delete.
- **Spare Part Modal:**
  - Part Name (required).
  - Compatible Models string (required).
  - Price Label (required).
  - Numeric Price (optional).
  - Status Badge dropdown.

---

### 3.5. Leads CRM / Quotation Requests (`#leads`)

The central inquiry hub capturing submissions from `contact.html` and modal quote buttons.

- **Filter Bar:**
  - Status tabs: `All Leads`, `New` (pill with count), `Contacted`, `Quoted`, `Closed`, `Lost`.
  - Search bar (filters by customer name, phone number, or city).
- **Leads Table:**
  - Date & Time (formatted PKT, e.g. "17 Nov 2026, 04:30 PM").
  - Customer / Company Name.
  - WhatsApp Phone Number.
  - City / Industrial Area.
  - Equipment Need.
  - Status Pill (colored dropdown: New, Contacted, Quoted, Closed, Lost).
  - **1-Click WhatsApp Action:** Prominent green button linking to:
    `https://wa.me/<digits>?text=Salam%20<CustomerName>,%20SM%20Brand%20se%20rabta%20kar%20rahe%20hain...`
  - Expand Row / Details Drawer:
    - Displays complete customer message (`message`).
    - Displays `source_page`.
    - Internal Sales Notes field (auto-saves on blur via `PATCH /api/admin/leads/:id`).

---

### 3.6. Settings & Contact Information (`#settings`)

Form for updating business coordinates without touching code.

- **Fields:**
  1. **Primary WhatsApp Number (Raw Digits):** e.g. `923102261760`. (Automatically updates all dynamic `wa.me` links on the public website).
  2. **Phone Display Text:** e.g. `+92 310 2261760`.
  3. **Official Email Address:** e.g. `ar7776845@gmail.com`.
  4. **Operating Hours Text:** e.g. `Monday – Saturday: 9:00 AM – 9:00 PM PKT`.
  5. **Emergency Hours Text:** e.g. `Sunday: 11:00 AM – 5:00 PM (Emergency WhatsApp Dispatch)`.
  6. **Depots Manager (Repeater):**
     - City (e.g. `Karachi`, `Lahore`, `Faisalabad`).
     - Hub Display Name (e.g. `Karachi Central Depot`).
     - Physical Street Address (e.g. `Plot 14, S.I.T.E Industrial Area, Karachi`).
     - Operational Note.
- **Action:** "Save All Settings" button (sends `PUT /api/admin/settings`).
- **Success State:** Instant toast notification "Settings saved successfully. Public website updated."

---

## 4. UI States & Feedback Patterns

- **Loading Skeletons:** Whenever data is being fetched from the API, tables render 3 pulsing skeleton rows (`background: #1c1c20; border-radius: 8px`).
- **Toast Notifications:** Fixed bottom-right popups (duration 3.5s):
  - Green Toast: "Product updated successfully."
  - Amber Toast: "Lead marked as Quoted."
  - Red Toast: "Upload failed: File exceeds 8 MB limit."
- **Confirm Modals:** Deleting a product or spare part displays an explicit modal: "Are you sure you want to permanently delete '[Name]'? This cannot be undone." with "Cancel" and "Confirm Delete" actions.
