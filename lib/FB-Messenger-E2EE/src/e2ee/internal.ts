/**
 * Internal/dev barrel for E2EE implementation details.
 *
 * Public consumers should prefer `src/e2ee/index.js` or the package root.
 * This file intentionally exposes lower-level protocol modules for tests,
 * debugging, and advanced integrations.
 */

export * from "./application/e2ee-client.js";
export * from "./application/fanout-planner.js";
export * from "./application/outbound-message-cache.js";
export * from "./application/prekey-maintenance.js";
export * from "./application/retry-manager.js";
export * from "./store/device-json.js";
export * from "./store/device-repository.js";
export * from "./store/device-store.js";
export * from "./transport/binary/wa-binary.js";
export * from "./transport/dgw/dgw-socket.js";
export * from "./transport/noise/noise-handshake.js";
export * from "./transport/noise/noise-socket.js";
export * from "./signal/prekey-manager.js";
export * from "./signal/signal-manager.js";
export * from "./message/message-builder.js";
export * from "./media/media-crypto.js";
export * from "./media/media-upload.js";
export * from "./facebook/facebook-protocol-utils.js";
export { encodeICDCIdentityList as encodeFacebookICDCIdentityList, encodeSignedICDCIdentityList as encodeFacebookSignedICDCIdentityList } from "./facebook/icdc-payload.js";
