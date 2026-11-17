# SM BRAND — AI Agent Operating Guidelines

**Document Version:** 1.0.0  
**Target Audience:** Any AI assistant, automated agent, or developer executing tasks in this repository.  

---

## 1. Golden Rules of the Repository

1. **Source of Truth Invariance:**
   - `docs/API_CONTRACT.md` and `docs/DATA_MODEL.md` are the **ONLY** source of truth for all API routes, payload structures, status codes, and database schemas.
   - **NEVER** invent new endpoints, rename existing fields, or alter response envelopes outside of these specifications.
   - If a feature genuinely requires an endpoint or schema adjustment: **stop**, update `docs/API_CONTRACT.md` and `docs/DATA_MODEL.md` first, document the change, and request approval from the user before writing implementation code.

2. **Frontend Protection Rule:**
   - Do **NOT** modify existing public frontend files (`index.html`, `machines.html`, `rolls.html`, `tools.html`, `service.html`, `contact.html`, `product.html`, `assets/css/sm.css`, `assets/js/sm-hero-3d.js`) unless the active task explicitly directs you to do so.
   - Do **NOT** redesign, refactor, or migrate the public site to React, Next.js, Vue, Tailwind, or any external framework.

3. **Task & Commit Atomicity:**
   - Strictly follow: **One feature per task, one Git commit per task**.
   - Keep commits small, descriptive, and atomic (e.g. `feat(api): implement products controller`, `fix(frontend): remove 280ms curtain delay`).

4. **Zero Hardcoded Secrets:**
   - **NEVER** hardcode database URIs, JWT secrets, passwords, or Cloudinary credentials into source files or documentation.
   - Always read credentials from `process.env` backed by `.env`.
   - Maintain `.env.example` with dummy values for reference.

5. **Design System Adherence:**
   - The approved theme is the **monochrome dark theme** (`#0a0a0b` background, white text, dark cards, dotted grid background).
   - The admin panel must use the exact same tokens declared in `docs/DESIGN_SYSTEM.md`.
   - Green (`#3ecf5a`) is strictly for active/in-stock status; Amber (`#f5a623`) is strictly for warnings/hot badges.
   - The 3D model retains its terracotta orange accents (`0xd96b32`) as an intentional visual focal point.

---

## 2. Pre-Completion Handover Checklist

Before finishing any turn or declaring a task complete, every AI agent must provide:
1. **List of Files Modified or Created:** Absolute or relative paths of every touched file.
2. **Verification & Testing Results:** Clear summary of what was executed, tested, and verified (e.g., test suite results, API endpoint cURL output, console logs, or syntax check).
3. **Open Questions / Regressions Noted:** Any edge case discovered that requires user input.
