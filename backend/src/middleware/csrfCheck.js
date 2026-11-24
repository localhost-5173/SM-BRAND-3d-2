/**
 * SM BRAND — CSRF Defense-in-Depth Middleware
 * Validates Origin or Referer header for state-changing admin requests (POST, PUT, PATCH, DELETE).
 */

function csrfCheck(req, res, next) {
  const method = req.method.toUpperCase();
  // Safe methods do not require origin check
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const host = req.headers.host;
  const allowedOrigin = process.env.FRONTEND_URL;

  // Extract host from referer if origin header is omitted by browser
  let refererHost = null;
  if (referer) {
    try {
      refererHost = new URL(referer).host;
    } catch (e) {}
  }

  let originHost = null;
  if (origin) {
    try {
      originHost = new URL(origin).host;
    } catch (e) {}
  }

  // Verification: matches server host or configured FRONTEND_URL
  const isSameHost = (originHost && originHost === host) || (refererHost && refererHost === host);
  const isAllowedOrigin = allowedOrigin && (origin === allowedOrigin || (referer && referer.startsWith(allowedOrigin)));

  // If running in development without strict origin or matches same origin
  if (isSameHost || isAllowedOrigin || (!origin && !referer && process.env.NODE_ENV !== 'production')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Cross-origin state-changing request blocked by CSRF policy.'
    }
  });
}

module.exports = csrfCheck;
