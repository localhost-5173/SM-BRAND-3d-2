# SM BRAND — Architectural Decisions Log & Open Questions

**Document Version:** 1.1.0  
**Status:** Living Record of Architectural Decisions & Project Direction  

---

## 1. Owner-Approved Architectural Decisions

### ADR-01: Approved Final Theme is Monochrome Dark
- **Status:** APPROVED BY OWNER
- **Context:** An earlier version of the site and documentation (`README.md`) specified an industrial safety orange theme (`#08090C` background, `#FF6B16` orange accents). Commit `df4c045` overhauled the stylesheet into a minimal monochrome dark theme (`#0a0a0b`, crisp white text, dotted background, white primary buttons).
- **Decision:** The monochrome dark theme is officially approved as the permanent visual identity of SM BRAND. The legacy orange theme in `README.md` is deprecated and marked obsolete.
- **Rules:**
  - UI chrome (buttons, cards, headers, borders) is strictly monochrome.
  - Green (`#3ecf5a`) is used exclusively for active / in-stock status indicators.
  - Amber (`#f5a623`) is used exclusively for warnings, low stock, or "hot" highlight badges.
  - The procedural Three.js 3D hero model intentionally retains its terracotta accents (`0xd96b32`) to act as the physical centerpiece.

---

### ADR-02: Single-Origin Hosting Strategy (`/api`, `/admin`, `/`)
- **Status:** APPROVED BY OWNER
- **Context:** Hosting the admin panel on a separate domain or port introduces CORS latency, preflight requests, third-party cookie blocking, and complex deployment coordination.
- **Decision:** Express serves everything from one unified origin:
  - `/` $\rightarrow$ Public website static files.
  - `/admin` $\rightarrow$ Admin dashboard single-page app.
  - `/api` $\rightarrow$ REST API routes.
- **Consequences:** Zero CORS overhead in production, secure `HttpOnly` cookie authentication, and deployment managed inside a single Node.js runtime container.

---

### ADR-03: Comparison Table Driven by `is_compared` Flag
- **Status:** APPROVED BY OWNER
- **Context:** `machines.html` currently has a hardcoded HTML table comparing 4 machines.
- **Decision:** Machines featured in the comparison matrix will be controlled dynamically via boolean flag `is_compared: true` and sorted by integer `compare_order`. The public endpoint `GET /api/products?compared=true` delivers these items.
- **Consequences:** The business owner can switch, reorder, or add models in the comparison table directly from the admin panel without editing `machines.html`. Products flagged as compared must maintain consistent spec keys (`Speed`, `Strap`, `Power`, `Tension`).

---

### ADR-04: Automated Lead Alerts Deferred to Post-Core Phase
- **Status:** APPROVED BY OWNER
- **Context:** Adding email/Telegram alerts during initial backend development adds third-party API dependencies before core inquiry capture is tested.
- **Decision:** Immediate WhatsApp customer redirection + database logging (`POST /api/leads`) constitutes the core requirement. Automated email/Telegram alert dispatching is scheduled as a future enhancement once the core backend and admin panel are validated in production.

---

### ADR-05: Equipment Finder Wizard Decision Logic & Dynamic Prices
- **Status:** APPROVED BY OWNER
- **Context:** The homepage machine recommendation wizard (`SM.initFinder()`) contains recommendation rules and hardcoded prices in `assets/js/sm.js`.
- **Decision:** The recommendation heuristics remain in client-side JavaScript, but the wizard will look up prices dynamically from the loaded catalog array (`list.find(p => p.name === rec.n)?.price_label`) rather than reading hardcoded string literals. If a recommended SKU is missing or inactive, it gracefully falls back without breaking.

---

### ADR-06: Catalog Photography Phasing
- **Status:** APPROVED BY OWNER
- **Context:** The catalog currently has only 5 generic JPEG images shared across all 24 products.
- **Decision:** Keep the seeded 5 fallback images for the initial backend launch. Prioritize replacement of mismatched photos first (hardware seals, plastic buckles, stretch film, and dispenser carts) as authentic inventory photography becomes available, followed by individual machine models.

---

### ADR-07: Single Admin Role Model
- **Status:** APPROVED BY OWNER
- **Context:** Evaluating whether multi-tier role-based access control (RBAC) is needed.
- **Decision:** A single administrative role (`role: 'admin'`) is used. Admin accounts are provisioned exclusively via server-side CLI (`npm run create-admin`). No public registration endpoint exists.

---

## 2. Open Questions for Owner Decision

The following operational questions remain open for owner clarification:

1. **Cloudinary Account Status:**
   - *Question:* Do you already have active Cloudinary API credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`), or will a new free-tier Cloudinary account need to be created during Phase 2 setup?
2. **Merging Duplicate Seals Products:**
   - *Context:* The catalog currently defines both `metal-seals-12mm` (in category `rolls`, tag `acc`, priced at `Rs 2.5 / pc`) and `seals-12-15-19mm` (in category `hand`, tag `hand`, priced at `From Rs 1.8`). Both share the same image (`rolls.jpg`).
   - *Question:* Would you prefer to merge these into a single product (e.g. `galvanized-metal-seals-12-15-19mm` in category `rolls`), or keep them separate as distinct SKUs in their respective pages?
3. **Public Email Display:**
   - *Context:* The email `ar7776845@gmail.com` is currently displayed in the footer of all 7 pages.
   - *Question:* Should this public email display continue to be shown on the website, or do you prefer directing all customer inquiries exclusively to WhatsApp and phone numbers to minimize spam?
