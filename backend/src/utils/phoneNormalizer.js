/**
 * SM BRAND — WhatsApp Phone Number Normalizer Utility
 * Converts user input to pure E.164-compatible digits matching /^\d{10,15}$/.
 *
 * Rules:
 * 1. Strip spaces, +, dashes, parentheses, dots.
 * 2. Pakistani local numbers starting with "03" and length 11 (e.g. 03102261760)
 *    are normalized to international format: "923102261760".
 * 3. Validate normalized result contains between 10 and 15 digits.
 */

function normalizeWhatsApp(raw) {
  if (!raw) return '';
  let digits = String(raw).trim().replace(/\D/g, '');

  // Pakistani national prefix conversion (03xx -> 923xx)
  if (digits.startsWith('03') && digits.length === 11) {
    digits = '92' + digits.substring(1);
  }

  return digits;
}

function isValidWhatsApp(raw) {
  const normalized = normalizeWhatsApp(raw);
  return /^\d{10,15}$/.test(normalized);
}

module.exports = {
  normalizeWhatsApp,
  isValidWhatsApp
};
