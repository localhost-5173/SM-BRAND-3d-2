# SM BRAND — Design System Specification

**Document Version:** 1.0.0  
**Theme Status:** APPROVED FINAL MONOCHROME DARK THEME  
**Obsolete Themes:** The legacy orange industrial palette described in `README.md` is deprecated and superseded by this specification.  

---

## 1. Visual Philosophy

SM BRAND employs a **precision industrial monochrome aesthetic**. High-contrast typography and subtle dark surface elevations create an engineered, technical environment suited for enterprise B2B procurement in Pakistan.

### 1.1. Core Rules of the Monochrome Theme
1. **Monochrome Dominance:** Backgrounds are obsidian black (`#0a0a0b`), cards are dark charcoal (`#111113`, `#161618`), and text is crisp high-contrast off-white (`#f4f4f5`).
2. **Strict Accent Color Allocation:**
   - **Green (`#3ecf5a`):** Strictly reserved for positive operational status indicators (e.g. "In Stock", "Ready Stock", live server status, operational beacons).
   - **Amber (`#f5a623`):** Strictly reserved for warnings, low stock notices, and "Best Seller" / "Hot" highlight badges.
   - **No Primary Orange Chrome:** The primary UI does not use bright safety orange for buttons, banners, or card borders. Buttons are crisp white with obsidian text (`.btn-primary`) or subtly bordered translucent grey (`.btn-ghost`).
3. **Intentional 3D Model Focal Point:** The Three.js 3D strapping machine model retains its warm terracotta accents (`#D96B32` / `0xd96b32`) on the strap coil, dispenser track, and rim contour. This makes the physical machine the sole colorful visual centerpiece on the page.
4. **Admin Panel Parity:** The administrative dashboard must reuse the exact same tokens, card styles, and button treatments so both client and owner interfaces feel unified.

---

## 2. Design Tokens (Extracted from `assets/css/sm.css`)

### 2.1. Color Tokens

```css
:root {
  /* Surface Layers */
  --bg: #0a0a0b;                     /* Main viewport background */
  --panel: #111113;                  /* Primary card & drawer background */
  --panel-2: #161618;                /* Secondary elevated surface */
  --panel-3: #1c1c20;                /* Hover state & input surface */

  /* Border Tokens */
  --border: #26262a;                 /* Subtle perimeter card line */
  --border-strong: #323238;          /* Input borders & active outlines */
  --border-hover: #4a4a52;           /* Hover border state */

  /* Text & Typography */
  --text: #f4f4f5;                   /* Primary high-contrast headings & text */
  --muted: #8e8e96;                  /* Secondary descriptions & subtitles */
  --muted-2: #6e6e76;                /* Timestamps, fine print, table metadata */

  /* Functional Status Accents */
  --green: #3ecf5a;                  /* In Stock / Ready Stock status LED */
  --green-soft: rgba(62, 207, 90, 0.12);
  --amber: #f5a623;                  /* Best Seller / Warning / Low Stock */
  --amber-soft: rgba(245, 166, 35, 0.12);

  /* 3D Focal Accent (Hero Three.js Model & Canvas Fallback Only) */
  --model-terracotta: #d96b32;       /* Procedural 3D strapping machine accents */
}
```

### 2.2. Background Dotted Grid Pattern

The hallmark background of SM BRAND is a fixed, subtle geometric dot pattern:

```css
body {
  background-color: #0a0a0b;
  background-image: radial-gradient(
    #3a3a40 1px,
    transparent 1.2px
  );
  background-size: 26px 26px;
  background-attachment: fixed;
}
```

### 2.3. Radius Tokens

```css
:root {
  --radius-xl: 18px;                 /* Main card containers, bento showcases */
  --radius-lg: 18px;                 /* Product cards, modal dialogs */
  --radius-md: 12px;                 /* Buttons, form inputs, image plates */
  --radius-sm: 8px;                  /* Status pills, spec chips, badges */
}
```

### 2.4. Typography & Scale

- **Primary Font Family:** `'Manrope', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- **Typographic Scale:**
  - `h1.h-display`: 44px–64px, weight 800, line-height 1.08, letter-spacing -0.035em
  - `h2.h-section`: 30px–42px, weight 700, line-height 1.15, letter-spacing -0.025em
  - `h3`: 20px–26px, weight 700, line-height 1.25
  - `h4`: 17px–20px, weight 600, line-height 1.3
  - Body text: 15px–16px, weight 400/500, line-height 1.6
  - Fine print / Metadata: 12px–13.5px, weight 500

---

## 3. UI Components

### 3.1. Buttons

```css
/* Primary Action Button (High Contrast White) */
.btn-primary {
  background: #f4f4f5;
  color: #0a0a0b;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease, background 0.2s ease;
}
.btn-primary:hover {
  background: #e4e4e7;
  transform: translateY(-1px);
}

/* Secondary Ghost Button (Outlined Obsidian) */
.btn-ghost {
  background: transparent;
  color: #f4f4f5;
  border: 1px solid var(--border-strong);
  font-weight: 500;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.btn-ghost:hover {
  border-color: var(--border-hover);
  background: rgba(255, 255, 255, 0.04);
}
```

### 3.2. Status Indicator Pills

```css
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--panel);
  border: 1px solid var(--border-strong);
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text);
}

.status-pill .led {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--amber); /* Warning / default state */
}

.status-pill.active .led {
  background: var(--green); /* In-stock / active live state */
}
```

### 3.3. Product Card Elevation

- Background: `#111113`
- Border: `1px solid #26262a`
- Radius: `18px`
- Hover state: `border-color: #4a4a52; transform: translateY(-3px);`

---

## 4. Leftover Orange Theme Cleanup Tasks

During Phase 1 of implementation, the following legacy references must be sanitized to match the monochrome theme:

1. **Remove / Rename `--orange` Token in `assets/css/sm.css`:**
   Lines 34–38 currently map `--orange: var(--text);`. Rename or standardize this to `--accent: var(--text);` or remove the dead aliases.
2. **Replace Inline `style="color:var(--orange)"`:**
   In `contact.html:54`, `index.html:56, 261, 273, 285`, `machines.html:54`, `product.html:54`, `rolls.html:54`, `service.html:54`, `tools.html:54`:
   Replace with class-based styles or standard text contrast color.
3. **Clean Up `assets/js/sm.js` Status Pill Class:**
   Line 440 calls `var pillClass = isHot ? 'status-pill orange' : 'status-pill active';`.
   Update to `var pillClass = isHot ? 'status-pill hot' : 'status-pill active';` and declare `.status-pill.hot .led { background: var(--amber); }`.
4. **Update `README.md` Documentation:**
   Rewrite the "Visual Design System" section in `README.md` to reflect the approved Monochrome Dark theme (`#0a0a0b` background) and remove obsolete references to `#FF6B16` orange.
