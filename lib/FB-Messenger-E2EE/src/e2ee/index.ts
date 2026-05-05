/**
 * Public API for the E2EE module.
 * Import from here - don't import internal files directly.
 */

// Client orchestrator
export { E2EEClient } from "./application/e2ee-client.js";
export type {
  E2EESendTextOptions,
  E2EESendTextResult,
  E2EEEncryptMediaOptions,
  E2EEEncryptMediaResult,
  E2EEDecryptMediaOptions,
} from "./application/e2ee-client.js";

// Device store
export { DeviceStore } from "./store/device-store.js";
export type { DeviceJSON, NoiseKeyPair } from "./store/device-store.js";

// Media crypto (can be used standalone)
export { encryptMedia, decryptMedia, expandMediaKey, sha256, MediaType, MmsType } from "./media/media-crypto.js";
export type { MediaTypeKey, MediaKeys, EncryptMediaResult, DecryptMediaOptions } from "./media/media-crypto.js";

// Media upload
export { uploadMedia } from "./media/media-upload.js";
export type { MediaUploadConfig, MediaUploadResult, MmsTypeStr } from "./media/media-upload.js";

// Signal manager (lower level)
export {
  jidToAddress,
  addressToJidKey,
  establishSession,
  encryptDM,
  decryptDM,
  decryptDMPreKey,
  encryptGroup,
  decryptGroup,
  createSenderKeyDistributionMessage,
  processSKDM,
  hasSession,
} from "./signal/signal-manager.js";

// PreKey manager
export {
  generatePreKeys,
  generateSignedPreKey,
  buildPreKeyUploadPayload,
  buildPreKeyBundle,
  INITIAL_PREKEY_COUNT,
  WANTED_PREKEY_COUNT,
  MIN_PREKEY_COUNT,
} from "./signal/prekey-manager.js";
export type { GeneratedPreKey, PreKeyUploadPayload, RawPreKeyBundle } from "./signal/prekey-manager.js";

// Message builder
export {
  encodeTextMessage,
  encodeImageMessage,
  encodeVideoMessage,
  encodeAudioMessage,
  encodeDocumentMessage,
  encodeStickerMessage,
  encodeReactionMessage,
  encodeEditMessage,
  encodeRevokeMessage,
  encodeMessageApplication,
  encodeMessageTransport,
  FB_MESSAGE_VERSION,
  FB_MESSAGE_APPLICATION_VERSION,
  FB_CONSUMER_MESSAGE_VERSION,
} from "./message/message-builder.js";
export type { MediaFields, MessageTransportOptions } from "./message/message-builder.js";

// Noise handshake
export { doHandshake, WA_CERT_PUB_KEY, WA_HEADER } from "./transport/noise/noise-handshake.js";
export type { NoiseSocket, RawWebSocket, HandshakeResult } from "./transport/noise/noise-handshake.js";
