/**
 * Centralized logging utility for FME.
 *
 * Controlled by process.env.DEBUG.
 *
 * When an emitter is registered via setEmitter(), all log output is routed
 * through EventEmitter events instead of console — identical to the pattern
 * used in fca-unofficial/func/logger.js so consumers can share a single unified
 * log sink across both libraries without patching any internal module.
 */

import { EventEmitter } from "node:events";

const isDebug = !!process.env.DEBUG || process.env.NODE_ENV === "development";

// Module-level emitter reference — intentionally a singleton so every internal
// module that imports logger.ts shares the same log sink without any call-site changes.
let _emitter: EventEmitter | null = null;

// Shared routing helper: formats variadic args into a single string and fires
// both the specific-level event and the catch-all "log" event so consumers can
// subscribe selectively (just "warn") or broadly (every message via "log").
function emit(level: string, args: unknown[]): void {
  const message = args.map(a => (typeof a === "string" ? a : String(a))).join(" ");
  _emitter!.emit(level, { level, message });
  _emitter!.emit("log", { level, message });
}

export const logger = {
  info: (...args: unknown[]) => {
    if (_emitter) { emit("info", args); return; }
    console.log(...args);
  },
  debug: (...args: unknown[]) => {
    if (_emitter) { emit("debug", args); return; }
    // Only write debug output when DEBUG env is set — avoids noise in production
    if (isDebug) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (_emitter) { emit("warn", args); return; }
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (_emitter) { emit("error", args); return; }
    console.error(...args);
  },

  /**
   * Wire an EventEmitter as the log sink — called by fmeInstance() in index.ts.
   * After this call, every logger.*() invocation anywhere in the library emits
   * events on this emitter instead of writing to console.
   */
  setEmitter: (emitter: EventEmitter): void => { _emitter = emitter; },

  /**
   * Restore default console behavior — useful for cleanup or testing teardown.
   */
  clearEmitter: (): void => { _emitter = null; },
};