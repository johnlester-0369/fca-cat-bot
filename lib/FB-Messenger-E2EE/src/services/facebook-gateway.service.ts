import { Readable } from "node:stream";
import { Buffer } from "node:buffer";

import { createHmac, createHash } from "node:crypto";
import { logger } from "../utils/logger.js";

// Minimal interface covering only the FCA methods used internally by this gateway.
// The full fca-unofficial API is passed in by the caller.
export interface MinimalFCAApi {
  getCurrentUserID?: () => string;
  setOptions?: (options: Record<string, unknown>) => void;
  sendMessage: (
    message: string | Record<string, unknown>,
    threadID: string,
    callback?: unknown,
    replyToMessage?: string,
  ) => Promise<Record<string, unknown>> | void;
  setMessageReaction?: (
    reaction: string,
    messageID: string,
    callback?: unknown,
    forceCustomReaction?: boolean,
  ) => Promise<void> | void;
  unsendMessage?: (messageID: string, callback?: unknown) => Promise<void> | void;
  sendTypingIndicator?: (isTyping: boolean, threadID: string, callback?: unknown) => Promise<void> | void;
  markAsRead?: (threadID: string, read?: boolean, callback?: unknown) => Promise<void> | void;
  stopListenMqtt?: () => void;
  httpPost?: (url: string, form: Record<string, unknown>) => Promise<string>;
  fb_dtsg?: string;
}

export class FacebookGatewayService {
  public async sendMessage(
    api: MinimalFCAApi,
    threadId: string,
    text: string,
    replyToMessageId?: string,
  ): Promise<Record<string, unknown>> {
    const response = await Promise.resolve(api.sendMessage(text, threadId, undefined, replyToMessageId));
    return (response ?? {}) as Record<string, unknown>;
  }

  public async sendAttachmentMessage(
    api: MinimalFCAApi,
    input: {
      threadId: string;
      data: Buffer;
      fileName: string;
      caption?: string;
      replyToMessageId?: string;
    },
  ): Promise<Record<string, unknown>> {
    const stream = Readable.from(input.data);
    Object.assign(stream, { path: input.fileName });

    const payload = {
      body: input.caption ?? "",
      attachment: stream,
    };

    const response = await Promise.resolve(
      api.sendMessage(payload, input.threadId, undefined, input.replyToMessageId),
    );
    return (response ?? {}) as Record<string, unknown>;
  }

  public async sendReaction(
    api: MinimalFCAApi,
    messageId: string,
    reaction: string,
  ): Promise<void> {
    if (!api.setMessageReaction) {
      throw new Error("setMessageReaction is not available in fca-unofficial");
    }
    await Promise.resolve(api.setMessageReaction(reaction, messageId, undefined, true));
  }

  public async unsendMessage(api: MinimalFCAApi, messageId: string): Promise<void> {
    if (!api.unsendMessage) {
      throw new Error("unsendMessage is not available in fca-unofficial");
    }
    await Promise.resolve(api.unsendMessage(messageId));
  }

  public async sendTyping(api: MinimalFCAApi, threadId: string, isTyping: boolean): Promise<void> {
    if (!api.sendTypingIndicator) {
      throw new Error("sendTypingIndicator is not available in fca-unofficial");
    }
    await Promise.resolve(api.sendTypingIndicator(isTyping, threadId));
  }

  public async markAsRead(api: MinimalFCAApi, threadId: string): Promise<void> {
    if (!api.markAsRead) {
      throw new Error("markAsRead is not available in fca-unofficial");
    }
    await Promise.resolve(api.markAsRead(threadId, true));
  }

  public async sendStickerMessage(
    api: MinimalFCAApi,
    input: {
      threadId: string;
      stickerId: number;
      replyToMessageId?: string;
    },
  ): Promise<Record<string, unknown>> {
    const payload = { sticker: input.stickerId };
    const response = await Promise.resolve(
      api.sendMessage(payload, input.threadId, undefined, input.replyToMessageId),
    );
    return (response ?? {}) as Record<string, unknown>;
  }

  public stop(api: MinimalFCAApi): void {
    api.stopListenMqtt?.();
  }

  /**
   * Fetch the Crypto Auth Token (CAT) required for E2EE connection.
   * This uses the MAWCatQuery GraphQL document.
   */
  public async fetchCAT(api: MinimalFCAApi): Promise<string> {
    const fb_dtsg = (api as any).fb_dtsg;
    const userId = (api as any).getCurrentUserID?.();

    logger.debug("FacebookGatewayService", "Fetching CAT via GraphQL...");
    const resText = await (api as any).httpPost("https://www.facebook.com/api/graphql/", {
      fb_dtsg,
      variables: "{}",
      doc_id: "23999698219677129",
      __user: userId,
      __a: "1",
      __jssesw: "1",
      server_timestamps: "true",
    });

    const cleanText = resText.replace("for (;;);", "").trim();
    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (e) {
      logger.error("FacebookGatewayService", "Failed to parse CAT response:", resText);
      throw new Error("Failed to parse CAT response");
    }

    const cat = data?.data?.secure_message_over_wa_cat_query?.encrypted_serialized_cat;

    if (!cat) {
      logger.error("FacebookGatewayService", "CAT GraphQL response (no cat):", resText);
      throw new Error("Failed to extract CAT token from GraphQL response");
    }

    logger.debug("FacebookGatewayService", `CAT fetched successfully. Length: ${cat.length}, Prefix: ${cat.slice(0, 20)}...`);
    return cat;
  }


  /**
   * Fetch ICDC metadata for the user.
   */
  public async fetchICDC(api: MinimalFCAApi, fbid: string, deviceId: string, fbCat: Buffer): Promise<any> {
    if (typeof (api as any).httpPost !== "function") {
      throw new Error("api.httpPost is required for ICDC fetch");
    }

    const resText = await (api as any).httpPost("https://reg-e2ee.facebook.com/v2/fb_icdc_fetch", {
      fbid: fbid,
      fb_cat: fbCat.toString("utf8"), // Assuming it's the base64 string
      app_id: "256002347743983",
      device_id: deviceId,
    });

    if (!resText) throw new Error("Empty response from icdc_fetch");
    return JSON.parse(resText);
  }

  /**
   * Register the device for ICDC.
   */
  public async registerICDC(api: MinimalFCAApi, fbid: string, deviceId: string, fbCat: Buffer, payload: any): Promise<any> {
    if (typeof (api as any).httpPost !== "function") {
      throw new Error("api.httpPost is required for ICDC register");
    }

    const fullPayload = {
      fbid: fbid,
      fb_cat: fbCat.toString("base64"),
      app_id: "256002347743983",
      device_id: deviceId,
      ...payload,
    };
    const appState = (api as any).getAppState?.();
    const cookies = (appState as any[] || []).map(c => `${c.key}=${c.value}`).join("; ");
    const userAgent = "Facebook Messenger/441.1.0.32.115 (Android 13; 480dpi; 1080x2236; Xiaomi; 2210132G; cupid; qcom; en_US; 555627749)";

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(fullPayload)) {
      params.append(key, String(value));
    }

    logger.debug("FacebookGatewayService", "Sending ICDC registration via api.httpPost...");
    const resText = await (api as any).httpPost("https://reg-e2ee.facebook.com/v2/fb_register_v2", fullPayload);
    logger.debug("FacebookGatewayService", "Raw Register Response:", resText);
    if (!resText) throw new Error("Empty response from icdc_register");
    return JSON.parse(resText);
  }
}