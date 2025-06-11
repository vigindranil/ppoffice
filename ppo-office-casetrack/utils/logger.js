// utils/logger.js
const logger = {
  info: (...args) => console.log("[INFO]", ...args),
  debug: (...args) => console.debug("[DEBUG]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};

module.exports = logger;