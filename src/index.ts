/**
 * fca-cat-bot barrel — single import surface for all exposed library APIs.
 *
 * Aggregates the public surface of both workspace libraries so bot consumers
 * never need to know whether a symbol lives in FB-Messenger-E2EE or
 * fca-unofficial. Everything is imported from this one file.
 *
 * Workspace libraries:
 *   @johnlester-0369/fb-messenger-e2ee  — E2EE Noise/Signal transport (TypeScript/ESM)
 *   @johnlester-0369/fca-unofficial     — FCA login + plaintext Messenger API (CommonJS)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// @johnlester-0369/fb-messenger-e2ee — runtime values
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * E2EE-only Messenger client facade. Handles Noise handshake, Signal protocol
 * session management, and DGW transport. Use fca-unofficial directly for
 * plaintext/non-E2EE surfaces (polls, history, thread management, etc.).
 */
export { FBClient } from "@johnlester-0369/fb-messenger-e2ee";

/**
 * Typed facade over the E2EE provider. Acts as an extension point between
 * the JS transport layer and a future native-addon or WASM Signal implementation.
 * Call setProvider() with a concrete E2EEClient to activate media send/receive.
 */
export { E2EEService } from "@johnlester-0369/fb-messenger-e2ee";

/**
 * Factory for consumer-controlled FME log routing. When emitLogger is true,
 * all internal library log output is routed through the returned fmeLogger
 * EventEmitter instead of console — mirrors fcaInstance() in fca-unofficial
 * so both libraries can share a single unified log sink without patching internals.
 */
export { fmeInstance } from "@johnlester-0369/fb-messenger-e2ee";

// ═══════════════════════════════════════════════════════════════════════════════
// @johnlester-0369/fb-messenger-e2ee — type-only surface
//
// Declared as `export type` to satisfy isolatedModules: true — TypeScript erases
// these entirely at emit time, preventing phantom runtime imports.
// ═══════════════════════════════════════════════════════════════════════════════

// Client lifecycle
export type { ClientOptions, SessionData, MessengerEventMap, ConnectE2EEOptions } from "@johnlester-0369/fb-messenger-e2ee";

// Configuration
export type { AuthConfig, AppEnv } from "@johnlester-0369/fb-messenger-e2ee";

// Domain model — attachments, threads, mentions, events
export type {
  Attachment,
  Mention,
  ReplyTo,
  Platform,
  MessengerEvent,
  E2EEMessage,
  E2EEMessageKind,
} from "@johnlester-0369/fb-messenger-e2ee";

// Messaging input shapes — passed into FBClient send methods
export type {
  SendMessageInput,
  SendMediaInput,
  SendReactionInput,
  TypingInput,
} from "@johnlester-0369/fb-messenger-e2ee";

// E2EE-specific option and result types — used by E2EEService and E2EEClient
export type {
  E2EESendTextOptions,
  E2EESendTextResult,
  E2EEEncryptMediaOptions,
  E2EEEncryptMediaResult,
  E2EEDecryptMediaOptions,
  E2EEDownloadOptions,
  E2EEDownloadResult,
} from "@johnlester-0369/fb-messenger-e2ee";

// Media upload pipeline types — used by MediaService and E2EEService
export type { MediaUploadConfig, MediaUploadResult, MmsTypeStr } from "@johnlester-0369/fb-messenger-e2ee";

// ═══════════════════════════════════════════════════════════════════════════════
// @johnlester-0369/fca-unofficial — runtime values
//
// fca-unofficial is a pure CommonJS module. Under NodeNext's ESM-to-CJS interop:
//   • The default import resolves to module.exports, which IS the login function.
//   • Named properties (login, fcaInstance) are accessible as module.exports.* —
//     we extract them explicitly with typed casts because the CJS module has no
//     generated .d.ts guarantees we can lean on from this ESM barrel.
//
// We expose three patterns to match every caller convention:
//   import login from "fca-cat-bot/src/index.ts"           ← default
//   import { login } from "fca-cat-bot/src/index.ts"       ← named
//   import { fcaInstance } from "fca-cat-bot/src/index.ts" ← factory
// ═══════════════════════════════════════════════════════════════════════════════

import fcaLogin from "@johnlester-0369/fca-unofficial";

// Type alias for the login function signature inferred from the CJS module.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FcaLoginFn = (loginData: any, options?: any, callback?: any) => any;

/**
 * FCA login — authenticates with Facebook using appState or email/password.
 * Returns a Promise<api> when no callback is provided.
 *
 * Named re-export so callers can use `import { login }` pattern.
 */
export const login: FcaLoginFn = fcaLogin as FcaLoginFn;

/**
 * Factory for consumer-controlled FCA log routing. When emitLogger is true,
 * all internal fca-unofficial log output is routed through the returned
 * fcaLogger EventEmitter instead of stderr. Combine with fmeInstance() to
 * pipe all logs (both libraries) into a single unified sink.
 *
 * @example
 *   const { login, fcaLogger } = fcaInstance({ emitLogger: true });
 *   fcaLogger.on("warn", ({ message }) => myLogger.warn(message));
 */
export const fcaInstance: (opts?: { emitLogger?: boolean }) => {
  login: FcaLoginFn;
  fcaLogger: import("node:events").EventEmitter;
  // Cast through unknown: module.exports.fcaInstance is a runtime-only property
  // not reflected in TypeScript's CJS-interop type inference for this package.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} = (fcaLogin as any).fcaInstance;

/**
 * Default export is the FCA login function — drop-in replacement for the
 * original `require("fca-unofficial")` call pattern in CommonJS bots.
 */
export default fcaLogin;
