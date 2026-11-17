# SM BRAND — System Architecture Specification

**Document Version:** 1.1.0  
**Architectural Style:** Monolithic Single-Origin Server (Express.js) hosting Vanilla Public Site, Embedded Admin Dashboard, and REST API  

---

## 1. Technology Stack & Single-Origin Hosting

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS SINGLE-ORIGIN SERVER                      │
│                 (e.g., https://smbrand.pk or localhost:5000)            │
│                                                                         │
│  ┌───────────────────────┐  ┌────────────────────┐  ┌────────────────┐  │
│  │   Public Website      │  │   REST API Layer   │  │  Admin Panel   │  │
│  │   (HTML/CSS/JS)       │  │   (Express.js)     │  │  (HTML/JS SPA) │  │
│  │   Served at `/`       │  │   Mounted at       │  │  Served at     │  │
│  │   - Three.js r128     │  │   `/api/*`         │  │  `/admin`      │  │
│  │   - GSAP 3 + Lenis    │  │   - Rate limiting  │  │  - Zero CORS   │  │
│  │   - Lucide Icons      │  │   - JWT Auth       │  │  - Same-origin │  │
│  │   - 5s Offline Fallback│ │   - CSRF check     │  │  - HttpOnly    │  │
│  └───────────────────────┘  └─────────┬──────────┘  └────────────────┘  │
└───────────────────────────────────────┼─────────────────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
              ┌─────────────────────┐       ┌────────────────────┐
              │    MongoDB Atlas    │       │     Cloudinary     │
              │   Database Storage  │       │   Media CDN / Host │
              │   (Mongoose Models) │       │   (Optimized WebP) │
              └─────────────────────┘       └────────────────────┘
```

### 1.1. Core Components

1. **Public Website Frontend:**
   - Pure HTML5 semantic documents.
   - Vanilla CSS3 design system (`assets/css/sm.css`) with CSS custom properties.
   - Vanilla ES5/ES6 JavaScript (`assets/js/sm.js`, `sm-config.js`, `sm-data.js`).
   - Client-side 3D rendering with Three.js r128 (`sm-hero-3d.js`).
   - Smooth inertia scrolling via Lenis v1.0.x and motion via GSAP 3.12.5.
   - **Offline Resilience & Cold-Start Fallback:** Free cloud hosting platforms (e.g. Render, Railway hobby tiers) routinely put inactive web services to sleep. A waking container may take 15–30 seconds to spin up. Because of this, the frontend's **5000ms AbortController timeout and automatic fallback to `assets/js/sm-data.js` must permanently remain in place**. If the backend is asleep when a visitor lands on the site, the catalog renders instantly from local mock data without hanging. Subsequent user actions seamlessly query the live API once the container wakes.

2. **Backend API (Node.js + Express):**
   - Express 4.x application serving JSON REST endpoints under `/api`.
   - Security middleware: `helmet` for HTTP headers, `express-rate-limit` against brute-force attacks.
   - **No CORS Needed:** Because the public website, admin panel, and API are served from the **exact same host origin and port**, cross-origin resource sharing (CORS) is entirely bypassed in production. Browsers make standard same-origin requests without issuing preflight `OPTIONS` requests, reducing request overhead.
   - Session & Auth: Stateless JSON Web Tokens (JWT) transferred via `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) cookies.
   - CSRF Defense-in-Depth: Origin / Referer validation on state-changing admin routes.
   - Image Upload Pipeline: `multer` memory storage with magic-bytes file signature verification, streaming directly to Cloudinary.

3. **Admin Dashboard (Embedded Single-Origin SPA):**
   - Served by the same Express server at `/admin`.
   - Built as a clean, dependency-free HTML/JS dashboard using the exact same CSS tokens and Lucide vector icons as the public website.
   - Eliminates third-party cookie blocking (e.g. Safari ITP) and token storage in `localStorage`.

4. **Persistence & Media Storage:**
   - **Database:** MongoDB Atlas (Mongoose 8.x ODM) storing Products, Quotation Leads, Settings, Spare Parts, and Admin Credentials.
   - **Media Storage:** Cloudinary CDN for persistent product photography, asset optimization, and automatic WebP transformation.

---

## 2. Backend & Repository Directory Structure

```
sm-brand-project/
├── .env.example                         # Template environment variables
├── .gitignore                           # Git ignore rules
├── package.json                         # Node.js project manifest & dependencies
├── server.js                            # Application entry point & server setup
├── README.md                            # Project documentation
│
├── docs/                                # Architectural & specification documentation
│   ├── AGENTS.md
│   ├── ADMIN_PANEL_SPEC.md
│   ├── API_CONTRACT.md
│   ├── DATA_MODEL.md
│   ├── DECISIONS.md
│   ├── DESIGN_SYSTEM.md
│   ├── PROJECT_OVERVIEW.md
│   ├── ROADMAP.md
│   └── VERIFIED_FINDINGS.md
│
├── public/                              # Existing public website (served at `/`)
│   ├── contact.html
│   ├── index.html
│   ├── machines.html
│   ├── product.html
│   ├── rolls.html
│   ├── service.html
│   ├── tools.html
│   └── assets/
│       ├── css/
│       │   └── sm.css
│       ├── img/
│       │   ├── machine-auto.jpg
│       │   ├── machine-semi.jpg
│       │   ├── rolls.jpg
│       │   ├── tool-battery.jpg
│       │   └── tool-hand.jpg
│       └── js/
│           ├── sm-config.js
│           ├── sm-data.js
│           ├── sm-hero-3d.js
│           ├── sm.js
│           └── vendor/
│               ├── gsap.min.js
│               ├── lenis.min.js
│               ├── lucide.min.js
│               ├── ScrollTrigger.min.js
│               └── three.min.js
│
├── admin/                               # Admin dashboard files (served at `/admin`)
│   ├── index.html                       # Admin single-page dashboard
│   ├── login.html                       # Admin authentication view
│   ├── css/
│   │   └── admin.css                    # Admin styles leveraging sm.css design tokens
│   └── js/
│       └── admin.js                     # Admin API client, tab routing & DOM controllers
│
└── src/                                 # Express Backend Source Code
    ├── config/
    │   ├── db.js                        # Mongoose connection logic
    │   └── cloudinary.js                # Cloudinary SDK credentials configuration
    ├── controllers/
    │   ├── authController.js            # Login, logout, session verification
    │   ├── leadController.js            # Lead submission & admin lead management
    │   ├── mediaController.js           # Cloudinary upload handler
    │   ├── productController.js         # Public listing & admin product CRUD
    │   ├── settingsController.js        # Contact info & depot management
    │   └── spareController.js           # Spare parts CRUD
    ├── middleware/
    │   ├── auth.js                      # JWT cookie verification middleware
    │   ├── csrfCheck.js                 # Origin/Referer verification on state-changing requests
    │   ├── errorHandler.js              # Centralized JSON error response handler
    │   ├── rateLimiter.js               # Rate limiting for auth & submission routes
    │   └── upload.js                    # Multer memory storage & magic byte check
    ├── models/
    │   ├── AdminUser.js                 # Admin user schema & bcrypt hash hook
    │   ├── Lead.js                      # Quotation inquiry schema
    │   ├── Product.js                   # Packaging machinery & consumables schema
    │   ├── Settings.js                  # Global contact coordinates singleton schema
    │   └── Spare.js                     # Replacement parts schema
    ├── routes/
    │   ├── adminRoutes.js               # Protected /api/admin/* endpoints
    │   ├── authRoutes.js                # /api/auth/* endpoints
    │   └── publicRoutes.js              # Public /api/products, /api/settings, /api/leads
    └── utils/
        ├── logger.js                    # Minimal console logger with timestamps
        ├── seed.js                      # Database seed script populating sm-data.js items
        └── createAdmin.js               # CLI interactive script to create admin user
```

---

## 3. Environment Variables Specification

The backend requires the following configuration keys declared in `.env`:

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Local port for Express web server |
| `NODE_ENV` | Yes | `development` | Environment mode (`development` or `production`) |
| `MONGODB_URI` | Yes | — | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | — | High-entropy cryptographic string for signing session JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime (e.g. `7d`, `24h`) |
| `CLOUDINARY_CLOUD_NAME`| Yes | — | Cloudinary account identifier |
| `CLOUDINARY_API_KEY` | Yes | — | Cloudinary public API key |
| `CLOUDINARY_API_SECRET` | Yes | — | Cloudinary secret API key |
| `FRONTEND_URL` | No | `http://localhost:5000` | Server host origin for CSRF Origin checks |

---

## 4. Single-Origin Server & Routing Strategy

In `server.js`, Express mounts both static assets and API routers to eliminate origin fragmentation:

```javascript
// 1. Parse JSON bodies & cookies
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// 2. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// 3. Serve Admin Panel Static Assets
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// 4. Serve Public Website Static Assets
app.use(express.static(path.join(__dirname, 'public')));

// 5. Fallback 404 & Centralized Error Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } });
});
app.use(errorHandler);
```

---

## 5. Future Module: Automated Lead Notifications

As decided in [docs/DECISIONS.md](file:///c:/Users/Ali/Desktop/SM-BRAND-3d/SM-BRAND-3D/docs/DECISIONS.md), automated server-side lead notification is deferred as a future enhancement once the core backend and admin panel are stable.

When scheduled for implementation, the notification module will be designed as an event-driven service (`src/services/notificationService.js`):
- **Email Channel:** Nodemailer dispatching email notifications to `ar7776845@gmail.com` via SendGrid / Resend / SMTP.
- **Telegram Channel:** Telegram Bot API firing an instant message to a private SM Brand staff channel with lead details and customer phone number.
- **Non-Blocking Architecture:** Notification dispatch must execute asynchronously *after* the lead document is committed to MongoDB, ensuring that third-party notification delivery failures never block or slow down customer inquiry responses.
