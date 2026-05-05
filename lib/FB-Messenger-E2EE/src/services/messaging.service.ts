import type { MinimalFCAApi } from "./facebook-gateway.service.js";

import type { MarkReadInput, SendMessageInput, SendReactionInput, TypingInput } from "../models/messaging.js";
import { FacebookGatewayService } from "./facebook-gateway.service.js";

export class MessagingService {
  public constructor(private readonly gateway: FacebookGatewayService) {}

  public async sendText(api: MinimalFCAApi, input: SendMessageInput): Promise<Record<string, unknown>> {
    return this.gateway.sendMessage(api, input.threadId, input.text, input.replyToMessageId);
  }

  public async react(api: MinimalFCAApi, input: SendReactionInput): Promise<void> {
    await this.gateway.sendReaction(api, input.messageId, input.reaction);
  }

  public async unsend(api: MinimalFCAApi, messageId: string): Promise<void> {
    await this.gateway.unsendMessage(api, messageId);
  }

  public async sendTyping(api: MinimalFCAApi, input: TypingInput): Promise<void> {
    await this.gateway.sendTyping(api, input.threadId, input.isTyping);
  }

  public async markAsRead(api: MinimalFCAApi, input: MarkReadInput): Promise<void> {
    await this.gateway.markAsRead(api, input.threadId);
  }
}