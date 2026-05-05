/**
 * Message layer public barrel.
 *
 * Keep imports here stable while implementations live under proto/, builders/,
 * and codecs/. The top-level compatibility shim re-exports this barrel.
 */

export type { MediaFields, MessageTransportOptions } from "../../models/e2ee.js";
export * from "./constants.js";
export { ProtoWriter } from "./proto/proto-writer.js";
export * from "./builders/client-payload.js";
export * from "./builders/consumer-application.js";
export * from "./builders/message-application.js";
export * from "./builders/message-transport.js";
export * from "./codecs/protobuf-codecs.js";
