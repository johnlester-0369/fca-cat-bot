const chalk = require("chalk");

// Module-level emitter reference — intentionally a singleton so that all callers
// (login.js, loginHelper.js, config.js, options.js, logAdapter.js) that require()
// this module share the same log sink without any of them needing to change.
let _emitter = null;

const logger = (text, type) => {
  const s = String(type || "info").toLowerCase();

  // When an emitter is registered, route all output through events and suppress
  // stderr writes — the consumer owns the logging pipeline entirely.
  if (_emitter) {
    // Emit on the specific level so consumers can subscribe selectively
    if (s === "warn" || s === "error" || s === "info") {
      _emitter.emit(s, { level: s, message: String(text) });
      return;
    }

    // emit undefined log type
    _emitter.emit("log", { level: s, message: String(text) });
    return;
  }

  // Default behavior: colorized stderr output (unchanged from original)
  if (s === "warn") {
    process.stderr.write(chalk.hex("#007bff")(`\r[ FCA-WARN ] > ${text}`) + "\n");
    return;
  }
  if (s === "error") {
    process.stderr.write(chalk.bold.hex("#ff0000")(`\r[ FCA-ERROR ]`) + ` > ${text}\n`);
    return;
  }
  if (s === "info") {
    process.stderr.write(chalk.bold(chalk.hex("#007bff")(`\r[ FCA-UNO ] > ${text}`)) + "\n");
    return;
  }
  process.stderr.write(chalk.bold(chalk.hex("#007bff")(`\r[ ${s.toUpperCase()} ] > ${text}`)) + "\n");
};

// Wires an EventEmitter as the log sink — called by fcaInstance() in index.js.
// After this call, every logger(text, type) invocation anywhere in the library
// emits events on this emitter instead of writing to stderr.
logger.setEmitter = (emitter) => { _emitter = emitter; };

// Restores default stderr behavior — useful for cleanup or testing teardown.
logger.clearEmitter = () => { _emitter = null; };

module.exports = logger;