import { EventEmitter } from "node:events";
import { logger } from "./utils/logger.ts";
export { FBClient } from "./core/client.ts";
export { E2EEService } from "./services/e2ee.service.ts";

export type { ClientOptions, SessionData, MessengerEventMap } from "./models/client.ts";
export type { AuthConfig, AppEnv } from "./models/config.ts";
export type {
  Attachment,
  Mention,
  ReplyTo,
  Platform,
  MessengerEvent,
  E2EEMessage,
  E2EEMessageKind,
} from "./models/domain.ts";
export type {
  SendMessageInput,
  SendMediaInput,
  SendReactionInput,
  TypingInput,
} from "./models/messaging.ts";
export type {
  E2EESendTextOptions,
  E2EESendTextResult,
  E2EEEncryptMediaOptions,
  E2EEEncryptMediaResult,
  E2EEDecryptMediaOptions,
  E2EEDownloadOptions,
  E2EEDownloadResult,
} from "./models/e2ee.ts";
export type {
  MediaUploadConfig,
  MediaUploadResult,
  MmsTypeStr,
} from "./models/media.ts";

/**
 * Factory that gives the consumer control over the FME logger.
 *
 * When emitLogger is true, all internal library log output (from every module
 * that imports utils/logger.ts) is routed through the returned fmeLogger
 * EventEmitter instead of console. Mirrors the fcaInstance pattern from
 * fca-unofficial so a bot using both libraries can pipe all logs into one sink.
 *
 * Events emitted on fmeLogger:
 *   "info"  — informational messages
 *   "warn"  — non-fatal warnings
 *   "error" — error messages
 *   "debug" — debug-level messages (only when process.env.DEBUG is set)
 *   "log"   — catch-all: every message regardless of level, as { level, message }
 */
export function fmeInstance({ emitLogger = false }: { emitLogger?: boolean } = {}): { fmeLogger: EventEmitter } {
  const fmeLogger = new EventEmitter();
  if (emitLogger) logger.setEmitter(fmeLogger);
  return { fmeLogger };
}
