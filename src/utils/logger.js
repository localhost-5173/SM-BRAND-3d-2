/**
 * SM BRAND — Central Logging Utility
 * Lightweight timestamped console logger.
 */

function formatTimestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (msg, meta) => {
    console.log(`[${formatTimestamp()}] [INFO] ${msg}`, meta ? meta : '');
  },
  warn: (msg, meta) => {
    console.warn(`[${formatTimestamp()}] [WARN] ${msg}`, meta ? meta : '');
  },
  error: (msg, err) => {
    console.error(`[${formatTimestamp()}] [ERROR] ${msg}`, err ? err : '');
  }
};

module.exports = logger;
