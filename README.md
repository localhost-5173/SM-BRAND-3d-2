# SM BRAND — Industrial Strapping & Packaging Solutions

Premium international-grade B2B digital catalog and industrial equipment portal featuring a procedural **Three.js 3D Hero Experience**, **GSAP ScrollTrigger**, **Lenis Smooth Scroll**, **Lucide Icons**, and an integrated **Express.js + MongoDB backend**.

---

## Repository Structure

The project is structured into modular top-level workspaces:

```
SM-BRAND-3D/
├── frontend/                            # Public B2B digital catalog website
│   ├── contact.html                     # Direct RFQ quotation builder
│   ├── index.html                       # Homepage with 3D hero & interactive catalogue
│   ├── machines.html                    # Strapping machines & comparison table
│   ├── product.html                     # Dynamic product detail view (?slug=...)
│   ├── rolls.html                       # Strapping rolls & specifications
│   ├── service.html                     # Field service & spare parts catalog
│   ├── tools.html                       # Manual & cordless battery tools
│   └── assets/                          # Design tokens, photography, scripts
│       ├── css/sm.css                   # Complete design system stylesheet
│       ├── img/                         # Industrial machine photography
│       └── js/                          # 3D engine, motion, offline data, & API client
│
├── admin/                               # Admin management portal
│   └── index.html                       # Admin dashboard interface (Phase 4)
│
├── backend/                             # Express.js 4.x REST API & MongoDB Atlas
│   ├── server.js                        # Unified single-origin application server
│   ├── package.json                     # Backend dependencies & operational scripts
│   ├── package-lock.json                # Deterministic dependency lockfile
│   ├── .env.example                     # Environment variables template
│   ├── README.md                        # Backend server and setup guide
│   └── src/
│       ├── config/                      # Database (db.js) & Cloudinary setup
│       ├── controllers/                 # Auth, lead, media, product, settings, spare controllers
│       ├── middleware/                  # Auth JWT, CSRF check, error handler, sanitize, upload
│       ├── models/                      # Mongoose models: Product, Lead, Settings, Spare, AdminUser
│       ├── routes/                      # publicRoutes, authRoutes, adminRoutes
│       └── utils/                       # Seeding script, admin CLI, logger, phone normalizer
│
├── docs/                                # Technical specifications & architecture
│   ├── ADMIN_PANEL_SPEC.md              # Admin dashboard specification
│   ├── AGENTS.md                        # AI agent protocols & operational boundaries
│   ├── API_CONTRACT.md                  # Complete Public & Admin REST API specification
│   ├── ARCHITECTURE.md                  # Single-origin server & monorepo architecture
│   ├── DATA_MODEL.md                    # Database schemas, validation & seeding rules
│   ├── DECISIONS.md                     # Architectural Decision Records (ADRs)
│   ├── DESIGN_SYSTEM.md                 # Design tokens, color palette, typography
│   ├── PROJECT_OVERVIEW.md              # Scope, objectives & system overview
│   ├── ROADMAP.md                       # Phase-by-phase implementation roadmap
│   └── VERIFIED_FINDINGS.md             # Codebase audit & verified catalog data
│
├── package.json                         # Root convenience workspace scripts
├── .gitignore                           # Repository gitignore rules
└── README.md                            # Main project overview
```

---

## Quick Start & Installation

### 1. Install Dependencies
Run from the repository root:
```bash
cd backend
npm install
cd ..
```

### 2. Environment Configuration
Create the environment configuration file inside `backend/`:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your MongoDB connection URI and Cloudinary credentials.

### 3. Database Seeding & Administrator Setup
From the repository root:
```bash
# Seed the catalog (24 products, singleton settings, 6 spares)
npm run seed

# Create initial administrator user account
npm run create-admin
```

### 4. Running the Application
From the repository root:
```bash
# Development mode (with hot-reload)
npm run dev

# Production mode
npm start
```

### 5. Access Endpoints
Once started, the Express single-origin server serves:
- **Public Website:** [http://localhost:5000/](http://localhost:5000/)
- **Admin Portal:** [http://localhost:5000/admin](http://localhost:5000/admin)
- **API Base URL:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Visual Design System

- **Main Background:** `#08090C` (Deep industrial obsidian)
- **Secondary Background:** `#101216` (Charcoal surface)
- **Card Background:** `#15181F` (Dark glassmorphic elevation)
- **Primary Accent:** `#FF6B16` (High-visibility safety orange)
- **Secondary Accent:** `#FF8C32` (Warm amber glow)
- **Primary Text:** `#F5F5F5` (High-contrast crisp white)
- **Secondary Text:** `#A1A1AA` (Muted technical slate)
- **Borders & Highlights:** Subtle translucency (`rgba(255,255,255,0.08)`) with dynamic orange perimeter glow on hover

---

## 3D & Motion Technology

1. **Three.js Interactive 3D Hero (`frontend/assets/js/sm-hero-3d.js`)**:
   - High-fidelity procedural 3D model of an Industrial Automatic Strapping Machine (SM-801 Auto Arch).
   - Features: Industrial cabinet with orange brand accents, stainless steel roller bed, structural overhead arch, dual-segment status beacon tower, side-mounted strap dispenser reel with translucent flanges & orange PP coil, backlit operator console with start/e-stop buttons.
   - Cinematic 3-point lighting + orange rim contour spotlight + contact shadow plane + floating ambient dust particles.
   - Smooth mouse parallax tilt with lerp damping, continuous idle breathing, and interactive strapping cycle simulation.
   - Automatic WebGL capability detection with lightweight static fallback card for non-WebGL devices.

2. **GSAP & ScrollTrigger (`frontend/assets/js/vendor/gsap.min.js`, `ScrollTrigger.min.js`)**:
   - Word-by-word staggered heading reveals (`data-split`).
   - Viewport-triggered section reveals with scale and translateY transforms (`data-reveal`).
   - Staggered product cards entrance (`data-stagger`).
   - Dynamic metric counters with easing (`data-count`).
   - Velocity-responsive marquee ticker acceleration.
   - 3D card tilt and magnetic button physics (`data-tilt`, `data-magnetic`).
   - Full accessibility support: respects `prefers-reduced-motion: reduce`.

3. **Lenis Smooth Scroll (`frontend/assets/js/vendor/lenis.min.js`)**:
   - Ultra-smooth inertial scrolling synchronized with GSAP ticker and ScrollTrigger updates.

4. **Lucide Icons (`frontend/assets/js/vendor/lucide.min.js`)**:
   - Consistent, modern, crisp vector iconography across all navigation, cards, specs, and CTAs.

---

## Offline Resilience & Backend Integration

Configuration is located in `frontend/assets/js/sm-config.js`:
```javascript
window.SM_API_BASE = ""; // Default empty string serves from same Express origin
```

- When `SM_API_BASE` is left as `""` (empty string) on the same Express origin:
  - `GET /api/products` — loads live active products catalog from MongoDB Atlas.
  - `GET /api/products/:slug` — loads single product specifications.
  - `POST /api/leads` — captures quotation inquiries directly into the database.
- **Cold-Start Resilience:** Free cloud hosting tiers sleep when inactive. The frontend's 5-second timeout and offline fallback to `frontend/assets/js/sm-data.js` ensures that visitors always see a fully rendered, responsive catalog instantly even while the backend container spins up.

---

## Business Contacts & Configuration

- **WhatsApp & Phone:** `+92 310 2261760`
- **Email:** `ar7776845@gmail.com`
- **Depots & Facilities:**
  - Karachi: Plot 14, S.I.T.E Industrial Area
  - Lahore: Sundar Industrial Estate
  - Faisalabad: Khurrianwala Industrial Corridor
- **Operating Hours:** Monday–Saturday, 9:00 AM – 9:00 PM PKT
