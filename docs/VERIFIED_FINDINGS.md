# SM BRAND — Verified Technical Findings

**Date of Audit:** November 17, 2026  
**Auditor:** Senior Software Architect  
**Scope:** Verified source code inspection of `c:\Users\Ali\Desktop\SM-BRAND-3d\SM-BRAND-3D`  

---

## 1. Product Catalog Truth (`assets/js/sm-data.js`)

An earlier audit reported "18 products" because `README.md` claimed "18+ items", yet its category breakdown totaled 24.
Inspection of the actual source array `window.SM_FALLBACK` in `assets/js/sm-data.js` reveals **exactly 24 product objects**.

### Complete Category & Tag Breakdown

| # | Slug | Product Name | Category | Tag | Badge | Price Label |
|---|---|---|---|---|---|---|
| 1 | `sm450` | SM-450 Eco Semi-Auto | `machines` | `semi` | Starter | Rs 195,000 |
| 2 | `sm601` | SM-601 Pro Semi-Auto | `machines` | `semi` | Best Seller | Rs 285,000 |
| 3 | `sm801` | SM-801 Auto Arch | `machines` | `auto` | Auto | Rs 895,000 |
| 4 | `sm950` | SM-950 High-Speed | `machines` | `high` | High-Speed | Rs 1,250,000 |
| 5 | `sm620` | SM-620 Low Table | `machines` | `semi` | Low Table | Rs 310,000 |
| 6 | `sm810` | SM-810 Side Seal Auto | `machines` | `auto` | Auto | Rs 945,000 |
| 7 | `pp-roll-12mm-virgin` | PP Roll 12mm Virgin | `rolls` | `pp` | PP | Rs 185 / kg |
| 8 | `pp-roll-15mm-virgin` | PP Roll 15mm Virgin | `rolls` | `pp` | PP | Rs 185 / kg |
| 9 | `pp-roll-19mm-heavy` | PP Roll 19mm Heavy | `rolls` | `pp` | PP | Rs 185 / kg |
| 10 | `pet-roll-12mm-green` | PET Roll 12mm Green | `rolls` | `pet` | Export | Rs 310 / kg |
| 11 | `pet-roll-15mm-green` | PET Roll 15mm Green | `rolls` | `pet` | Export | Rs 310 / kg |
| 12 | `pet-roll-19mm-black` | PET Roll 19mm Black | `rolls` | `pet` | Heavy | Rs 310 / kg |
| 13 | `metal-seals-12mm` | Metal Seals 12mm | `rolls` | `acc` | Seals | Rs 2.5 / pc |
| 14 | `plastic-buckles-15mm` | Plastic Buckles 15mm | `rolls` | `acc` | Buckles | Rs 1.8 / pc |
| 15 | `stretch-film-23mic` | Stretch Film 23mic | `rolls` | `acc` | Film | Rs 520 / kg |
| 16 | `zp-19-battery-tool` | ZP-19 Battery Tool | `battery` | `battery` | Cordless | Rs 148,000 |
| 17 | `zp-16-compact-tool` | ZP-16 Compact Tool | `battery` | `battery` | Compact | Rs 125,000 |
| 18 | `xt-32-pneumatic-combo` | XT-32 Pneumatic Combo | `battery` | `battery` | Pneumatic | Rs 92,000 |
| 19 | `pp-tensioner-h-19` | PP Tensioner H-19 | `hand` | `hand` | Manual | Rs 8,500 |
| 20 | `pet-sealer-s-19` | PET Sealer S-19 | `hand` | `hand` | Manual | Rs 9,800 |
| 21 | `combo-kit-starter` | Combo Kit Starter | `hand` | `hand` | Kit | Rs 18,500 |
| 22 | `cutter-spare-blades` | Cutter / Spare Blades | `hand` | `hand` | Spares | Rs 1,200 |
| 23 | `dispenser-cart` | Dispenser Cart | `hand` | `hand` | Cart | Rs 22,000 |
| 24 | `seals-12-15-19mm` | Seals 12/15/19mm | `hand` | `hand` | Seals | From Rs 1.8 |

### Category Subtotals
- **`machines`**: 6 products
- **`rolls`**: 9 products
- **`battery`**: 3 products
- **`hand`**: 6 products
- **Total:** **24 products**

---

## 2. Hardcoded Phone, WhatsApp, Email, Address & Hours

The primary contact details are currently hardcoded across multiple HTML files and JavaScript scripts.

### 2.1. WhatsApp & Phone Number (`923102261760` / `+92 310 2261760`)

| File | Line | Code Snippet | Purpose |
|---|---|---|---|
| `assets/js/sm.js` | 8 | `var WA = '923102261760';` | Global default WhatsApp number for `SM.waLink()` |
| `contact.html` | 139 | `+92 310 2261760<br>` | Office coordinates panel |
| `contact.html` | 147 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20quote%20chahiye"` | Direct chat CTA button |
| `contact.html` | 177 | `+92 310 2261760<br>` | Footer contact column |
| `contact.html` | 209 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20quote%20chahiye"` | Floating WhatsApp widget (`#waFloat`) |
| `index.html` | 75 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20industrial%20strapping%20machine%20quote%20chahiye"` | Hero primary CTA |
| `index.html` | 456 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20packaging%20audit%20quote%20chahiye"` | Direct engineering desk CTA |
| `index.html` | 460 | `Direct Line: +92 310 2261760` | Direct engineering desk subtext |
| `index.html` | 480 | `+92 310 2261760<br>` | Footer contact column |
| `index.html` | 515 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20quote%20chahiye"` | Floating WhatsApp widget (`#waFloat`) |
| `machines.html` | 172 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20machine%20selection%20help%20chahiye"` | Consultation CTA |
| `machines.html` | 176 | `Direct Line: +92 310 2261760` | Consultation subtext |
| `machines.html` | 196 | `+92 310 2261760<br>` | Footer contact column |
| `machines.html` | 228 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20machine%20quote%20chahiye"` | Floating WhatsApp widget (`#waFloat`) |
| `product.html` | 154 | `+92 310 2261760<br>` | Footer contact column |
| `product.html` | 186 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20quote%20chahiye"` | Floating WhatsApp widget (`#waFloat`) |
| `rolls.html` | 94 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20rolls%20bulk%20rate%20chahiye"` | Swatches bulk rate button |
| `rolls.html` | 131 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%2050%2B%20rolls%20bulk%20order%20chahiye"` | Bulk procurement CTA |
| `rolls.html` | 154 | `+92 310 2261760<br>` | Footer contact column |
| `rolls.html` | 186 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20rolls%20quote%20chahiye"` | Floating WhatsApp widget (`#waFloat`) |
| `service.html` | 183 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20machine%20breakdown%20video%20bhej%20raha%20hoon"` | Video breakdown helpline CTA |
| `service.html` | 187 | `Hotline: +92 310 2261760` | Video breakdown hotline subtext |
| `service.html` | 207 | `+92 310 2261760<br>` | Footer contact column |
| `service.html` | 239 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20service%20chahiye"` | Floating WhatsApp widget (`#waFloat`) |
| `tools.html` | 105 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20battery%20vs%20manual%20tool%20guidance%20chahiye"` | Tool guidance CTA |
| `tools.html` | 128 | `+92 310 2261760<br>` | Footer contact column |
| `tools.html` | 160 | `href="https://wa.me/923102261760?text=Salam%20SM%20Brand,%20tools%20quote%20chahiye"` | Floating WhatsApp widget (`#waFloat`) |

### 2.2. Email Address (`ar7776845@gmail.com`)

| File | Line | Code Snippet |
|---|---|---|
| `contact.html` | 140 | `<a href="mailto:ar7776845@gmail.com"...>ar7776845@gmail.com</a>` |
| `contact.html` | 178 | `<a href="mailto:ar7776845@gmail.com"...>ar7776845@gmail.com</a>` (footer) |
| `index.html` | 481 | `<a href="mailto:ar7776845@gmail.com"...>ar7776845@gmail.com</a>` (footer) |
| `machines.html` | 197 | `<a href="mailto:ar7776845@gmail.com"...>ar7776845@gmail.com</a>` (footer) |
| `product.html` | 155 | `<a href="mailto:ar7776845@gmail.com"...>ar7776845@gmail.com</a>` (footer) |
| `rolls.html` | 155 | `<a href="mailto:ar7776845@gmail.com"...>ar7776845@gmail.com</a>` (footer) |
| `service.html` | 208 | `<a href="mailto:ar7776845@gmail.com"...>ar7776845@gmail.com</a>` (footer) |
| `tools.html` | 129 | `<a href="mailto:ar7776845@gmail.com"...>ar7776845@gmail.com</a>` (footer) |

### 2.3. Depot Addresses & Regional References

- **Karachi Central Depot:** "Plot 14, S.I.T.E Industrial Area, Karachi"
  - `contact.html` (lines 137, 143, 179)
  - `index.html` (line 482)
  - `machines.html` (line 198)
  - `product.html` (line 156)
  - `rolls.html` (line 156)
  - `service.html` (line 209)
  - `tools.html` (line 130)
- **Lahore Hub:** "Sundar Industrial Estate (Technician Base)"
  - `contact.html` (line 144)
  - Testimonial references in `index.html` (lines 418, 421)
- **Faisalabad Hub:** "Khurrianwala Industrial Corridor"
  - `contact.html` (line 145)

### 2.4. Operating Hours

- **Monday – Saturday:** 9:00 AM – 9:00 PM PKT
  - `contact.html` (line 124, 155)
  - `index.html` (line 455)
  - `machines.html` (line 171)
  - `service.html` (line 178)
- **Sunday:** 11:00 AM – 5:00 PM (Emergency WhatsApp Dispatch)
  - `contact.html` (line 156)

---

## 3. Hardcoded Prices & Specs in HTML

### 3.1. Machine Comparison Matrix (`machines.html`, lines 93–156)

| Field | SM-450 Eco | SM-601 Pro (Best Seller) | SM-801 Auto Arch | SM-950 High-Speed |
|---|---|---|---|---|
| **Speed** | 15 straps / min | 24 straps / min | 35 straps / min | 45 straps / min |
| **Strap** | PP 9–12mm | PP 9–15mm | PP / PET 9–15mm | PP / PET 9–15mm |
| **Daily Volume** | Under 200 boxes / day | 200 – 1,200 boxes / day | 1,200+ boxes / day | Continuous line (2,500+) |
| **Tension** | 15 – 45 kg mechanical | 15 – 65 kg adjustable | 10 – 70 kg digital | 10 – 80 kg electronic |
| **Power** | 220V Single Phase | 220V Single Phase | 220V / 380V 3-Phase | 380V 3-Phase Heavy |
| **Price** | **Rs 195,000** | **Rs 285,000** | **Rs 895,000** | **Rs 1,250,000** |

### 3.2. Replacement Spare Parts Table (`service.html`, lines 111–167)

| Part Name | Compatible Models | Status | Estimated Price |
|---|---|---|---|
| Tungsten Heating Blade Assembly | SM-601 / SM-801 / SM-450 | In Stock | **Rs 4,500** |
| Hardened Feed & Tension Wheel Set | All Semi-Automatic Models | In Stock | **Rs 3,200** |
| Integrated Digital PCB Mainboard | SM-601 Series | In Stock | **Rs 18,000** |
| ZP-19 Lithium Replacement Battery Pack | ZP-19 & ZP-16 Battery Tools | In Stock | **Rs 12,500** |
| Tool Sealer Blade & Cutter Set | Manual H-19 & S-19 Tools | In Stock | **Rs 1,200** |
| Heavy Duty Brake & Reel Spring | Automatic & Semi-Auto Dispensers | In Stock | **Rs 2,100** |

### 3.3. Homepage Product Showcases (`index.html`)

- Lines 181–184 (SM-801 Feature): `35 straps / min`, `PP / PET 9–15mm`, `Touchscreen Control`, `Conveyor Ready`.
- Lines 213–216 (SM-601 Pro): `24 straps / min`, `PP 9–15mm`, `Single Phase 220V`, `1 Year Warranty`.
- Lines 239–241 (ZP-19 Battery): `3,500N Tension`, `PET 13–19mm`, `2 Li-ion Packs`.

### 3.4. Equipment Finder Wizard (`assets/js/sm.js`, lines 523–542)

The wizard directly computes hardcoded recommendations with prices:
- `Combo Kit Starter`: Rs 18,500
- `SM-450 Eco Semi-Auto`: Rs 195,000
- `SM-601 Pro Semi-Auto`: Rs 285,000
- `SM-801 Auto Arch`: Rs 895,000
- `SM-950 High-Speed`: Rs 1,250,000
- `SM-810 Side Seal Auto`: Rs 945,000
- `ZP-19 Battery Tool`: Rs 148,000

---

## 4. Current Frontend API Expectations

The frontend interacts with backend endpoints strictly through logic in `assets/js/sm.js` and `assets/js/sm-config.js`.

### 4.1. `SM.fetchProducts(category)` (`assets/js/sm.js`, line 390)

- **Request:**
  - Method: `GET`
  - URL: `${SM_API_BASE}/api/products` or `${SM_API_BASE}/api/products?category=${encodeURIComponent(category)}`
  - Signal: AbortController with 5000ms timeout
- **Expected Success Response:**
  - Status: `200 OK`
  - Body: JSON Array of Product objects (`Product[]`)
- **Expected Object Shape:**
  ```javascript
  {
    "slug": "sm601",
    "name": "SM-601 Pro Semi-Auto",
    "price_label": "Rs 285,000",
    "spec": "24/min • PP 9-15mm • 220V",
    "badge": "Best Seller",
    "tag": "semi",
    "category": "machines",
    "img": "assets/img/machine-semi.jpg",
    "description": "Our most popular machine...",
    "specs": [
      ["Speed", "24 straps / min"],
      ["Strap", "PP 9–15mm"]
    ]
  }
  ```
- **Fallback Behavior:** If `SM_API_BASE` is empty, or the fetch fails / times out, or response is not a non-empty array, it resolves to filtered `window.SM_FALLBACK`.

### 4.2. `SM.fetchProduct(key)` (`assets/js/sm.js`, line 418)

- **Request:**
  - Method: `GET`
  - URL: `${SM_API_BASE}/api/products/${encodeURIComponent(key)}`
- **Expected Success Response:**
  - Status: `200 OK`
  - Body: Single Product object matching the schema above.
- **Fallback Behavior:** Searches `window.SM_FALLBACK` for matching `p.slug === key || String(p.id) === key`.

### 4.3. Lead Submission (`assets/js/sm.js`, line 620)

- **Request:**
  - Method: `POST`
  - URL: `${SM_API_BASE}/api/leads`
  - Headers: `{ "Content-Type": "application/json" }`
  - Body:
    ```json
    {
      "name": "Ahmed Khan",
      "whatsapp": "+92 310 1234567",
      "city": "Karachi",
      "need": "Semi-Automatic Machine (SM-601 Pro)",
      "message": "Need delivery to SITE area next Monday.",
      "source_page": "contact.html"
    }
    ```
- **Handling in JS:** Fire-and-forget (`fetch().catch(...)`). The user interface opens WhatsApp synchronously and presents on-screen confirmation without waiting for the backend response.

---

## 5. Leftover Uses of Old Orange Theme

Commit `df4c045` migrated the visual direction to a monochrome dark theme (`#0a0a0b`, white text, muted grey borders), but several remnant references to the old orange theme remain.

### 5.1. CSS Custom Properties (`assets/css/sm.css`, lines 34–38)
```css
--orange: var(--text);                 /* Evaluates to #f4f4f5 (white) */
--orange-hover: #e4e4e7;
--orange-soft: var(--text);
--orange-subtle: rgba(255, 255, 255, 0.04);
--orange-border: var(--border-strong);
```

### 5.2. Inline Styles in HTML Calling `var(--orange)`
Because `--orange` was mapped to `var(--text)`, these links render as plain white instead of brand accents:
- `contact.html:54`: `<a href="#quote" style="color:var(--orange)">Get Instant Quote →</a>`
- `index.html:56`: `<a href="contact.html#quote" style="color:var(--orange)">Request Quote →</a>`
- `index.html:261`: `<a href="rolls.html" style="font-size:13.5px;font-weight:600;color:var(--orange);display:flex;align-items:center;gap:6px">`
- `index.html:273`: `<a href="service.html" style="font-size:13.5px;font-weight:600;color:var(--orange);display:flex;align-items:center;gap:6px">`
- `index.html:285`: `<a href="service.html" style="font-size:13.5px;font-weight:600;color:var(--orange);display:flex;align-items:center;gap:6px">`
- `machines.html:54`: `<a href="contact.html#quote" style="color:var(--orange)">Request Quote →</a>`
- `product.html:54`: `<a href="contact.html#quote" style="color:var(--orange)">Get Instant Quote →</a>`
- `rolls.html:54`: `<a href="contact.html#quote" style="color:var(--orange)">Get Instant Quote →</a>`
- `service.html:54`: `<a href="contact.html#quote" style="color:var(--orange)">Get Instant Quote →</a>`
- `tools.html:54`: `<a href="contact.html#quote" style="color:var(--orange)">Get Instant Quote →</a>`

### 5.3. JavaScript Status Pill Class
In `assets/js/sm.js` line 440:
```javascript
var pillClass = isHot ? 'status-pill orange' : 'status-pill active';
```
In `assets/css/sm.css`, `.status-pill.orange` no longer exists. The indicator light `.led` falls back to the default amber rule: `background: var(--amber);`.

### 5.4. Three.js 3D Model Accent Color (`assets/js/sm-hero-3d.js`)
The 3D model intentionally retains warm terracotta orange (`#D96B32` / `0xd96b32`) for the machine trim line, PP coil dispenser, inner track guide, and directional rim light (lines 5, 71, 74, 97, 100, 177, 270, 332, 437).

### 5.5. Static SVG Placeholder Fallback (`assets/js/sm.js`, line 461)
`SM.fallbackImg()` generates an inline SVG badge containing an icon square filled with `#d96b32`.

### 5.6. Consumable Color Swatch (`rolls.html`, line 102)
`<span class="swatch-dot" style="background:#D96B32"></span> Industrial Orange` is a physical product color (polypropylene strapping coil).
