const login = require("./module/login");
const EventEmitter = require("events");
const logger = require("./func/logger");

/**
 * Factory that gives the consumer control over the FCA logger.
 *
 * When emitLogger is true, all internal library log output (from every module
 * that requires func/logger.js) is routed through the returned fcaLogger
 * EventEmitter instead of being written to stderr. This lets the consumer
 * silence, forward, or format logs without patching any internal module.
 *
 * Events emitted on fcaLogger:
 *   "info"  — informational messages
 *   "warn"  — non-fatal warnings
 *   "error" — error messages
 *   "log"   — every message regardless of level, as { level, message }
 *
 * @param {object} opts
 * @param {boolean} [opts.emitLogger=false] — route logger output through fcaLogger events
 * @returns {{ login: Function, fcaLogger: EventEmitter }}
 */
function fcaInstance({ emitLogger = false } = {}) {
  const fcaLogger = new EventEmitter();

  if (emitLogger) {
    // Wire the module-level logger singleton to emit on fcaLogger.
    // Because logger.js is required as a singleton, this intercepts log calls
    // from every internal module (loginHelper, config, options, etc.) at once.
    logger.setEmitter(fcaLogger);
  }

  return { login, fcaLogger };
}

// CommonJS default export — preserves backward-compatible require("fca-unofficial")
module.exports = login;
// Support require("fca-unofficial").login named pattern
module.exports.login = login;
// Support ESM `import login from "fca-unofficial"` default interop
module.exports.default = login;
// Named factory export for consumer-controlled logging
module.exports.fcaInstance = fcaInstance;