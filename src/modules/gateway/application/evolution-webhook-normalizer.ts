import type { NormalizedInboundMessage } from "../domain/message-gateway.interface";
import { GatewayValidationError } from "../domain/errors";

export class EvolutionWebhookNormalizer {
  normalizeMessage(tenantId: string, payload: unknown): NormalizedInboundMessage {
    const data = this.getObject(payload);
    const event = data?.event;
    const item = data?.data;

    if (event !== "messages.upsert" || !item) {
      throw new GatewayValidationError("Unsupported or invalid Evolution webhook payload");
    }

    const messageId = this.requireString(item.id, "messageId");
    const senderId = this.requireString(item.key?.remoteJid, "remoteJid");
    const messageContent = item.message ?? {};
    const text = this.extractText(messageContent);

    if (!text && !messageContent.image && !messageContent.document && !messageContent.audio && !messageContent.video && !messageContent.imageMessage && !messageContent.documentMessage && !messageContent.audioMessage && !messageContent.videoMessage && !messageContent.location && !messageContent.locationMessage) {
      throw new GatewayValidationError("Message content is missing");
    }

    return {
      messageId,
      tenantId,
      conversationKey: `${tenantId}:${senderId}`,
      senderId,
      channel: "whatsapp",
      contentType: this.inferContentType(messageContent),
      text: text ?? this.extractCaption(messageContent),
      media: this.extractMedia(messageContent),
      receivedAt: new Date((item.messageTimestamp ?? Date.now()) * 1000),
      rawProvider: payload,
    };
  }

  private getObject(payload: unknown): any {
    if (!payload || typeof payload !== "object") {
      throw new GatewayValidationError("Webhook payload must be an object");
    }

    return payload as Record<string, any>;
  }

  private requireString(value: unknown, field: string): string {
    if (typeof value !== "string" || value.trim() === "") {
      throw new GatewayValidationError(`Missing required field: ${field}`);
    }

    return value;
  }

  private extractText(messageContent: Record<string, any>): string | undefined {
    if (typeof messageContent.conversation === "string" && messageContent.conversation.trim()) {
      return messageContent.conversation.trim();
    }

    if (typeof messageContent.extendedTextMessage?.text === "string") {
      return messageContent.extendedTextMessage.text.trim();
    }

    return undefined;
  }

  private inferContentType(messageContent: Record<string, any>): NormalizedInboundMessage["contentType"] {
    if (messageContent.imageMessage || messageContent.image) return "image";
    if (messageContent.documentMessage || messageContent.document) return "document";
    if (messageContent.audioMessage || messageContent.audio) return "audio";
    if (messageContent.videoMessage || messageContent.video) return "video";
    if (messageContent.locationMessage || messageContent.location) return "location";
    if (messageContent.conversation || messageContent.extendedTextMessage) return "text";
    return "unsupported";
  }

  private extractCaption(messageContent: Record<string, any>): string | undefined {
    const directCaption = messageContent?.imageMessage?.caption ?? messageContent?.documentMessage?.caption ?? messageContent?.audioMessage?.caption ?? messageContent?.videoMessage?.caption;
    return typeof directCaption === "string" && directCaption.trim() ? directCaption.trim() : undefined;
  }

  private extractMedia(messageContent: Record<string, any>): NormalizedInboundMessage["media"] {
    const image = messageContent?.imageMessage;
    if (image) {
      return {
        mimeType: typeof image.mimetype === "string" ? image.mimetype : undefined,
        caption: typeof image.caption === "string" ? image.caption : undefined,
      };
    }

    const document = messageContent?.documentMessage;
    if (document) {
      return {
        mimeType: typeof document.mimetype === "string" ? document.mimetype : undefined,
        fileName: typeof document.fileName === "string" ? document.fileName : undefined,
        caption: typeof document.caption === "string" ? document.caption : undefined,
      };
    }

    const audio = messageContent?.audioMessage;
    if (audio) {
      return {
        mimeType: typeof audio.mimetype === "string" ? audio.mimetype : undefined,
      };
    }

    const video = messageContent?.videoMessage;
    if (video) {
      return {
        mimeType: typeof video.mimetype === "string" ? video.mimetype : undefined,
        caption: typeof video.caption === "string" ? video.caption : undefined,
      };
    }

    return undefined;
  }
}
