/* ------------------------------------------------------------------
   SM BRAND — site config
   Pages use only these globals.
   When served over HTTP/HTTPS, defaults to the same-origin API base.
   Falls back to offline catalog if unreachable.
   ------------------------------------------------------------------ */
var isHttp = typeof window !== 'undefined' && window.location && /^https?:/.test(window.location.protocol);
window.SM_API_BASE = typeof window.SM_API_BASE === 'string'
  ? window.SM_API_BASE
  : (isHttp ? window.location.origin : '');

// The ONLY hardcoded fallback WhatsApp number in the frontend codebase
window.SM_FALLBACK_WA = window.SM_FALLBACK_WA || '923102261760';

window.SM_ASSET_URL = window.SM_ASSET_URL || function (p) {
  if (!p || typeof p !== 'string') return '';
  var s = p.trim();
  if (/^https:\/\//i.test(s)) return s;
  if (/^\/(?!\/)/.test(s)) return s;
  if (/^assets\/[a-zA-Z0-9_\-\.\/]+$/i.test(s)) return s;
  return '';
};

window.SM_PRODUCT_URL = window.SM_PRODUCT_URL || function (slug) {
  return 'product.html?slug=' + encodeURIComponent(slug);
};
