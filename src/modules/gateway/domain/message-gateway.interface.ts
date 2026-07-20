export interface WebhookContext {
  tenantId: string;
  correlationId: string;
  receivedAt: Date;
  source: "whatsapp";
  provider: "evolution";
  auth: {
    token?: string;
    signature?: string;
  };
}

export interface NormalizedInboundMessage {
  messageId: string;
  tenantId: string;
  conversationKey: string;
  senderId: string;
  channel: "whatsapp";
  contentType: "text" | "image" | "document" | "audio" | "video" | "location" | "unsupported";
  text?: string;
  media?: {
    mimeType?: string;
    fileName?: string;
    url?: string;
    caption?: string;
    sizeBytes?: number;
  };
  receivedAt: Date;
  rawProvider: unknown;
}

export interface GatewayProcessingResult {
  accepted: boolean;
  eventPublished: boolean;
  reason?: "invalid_payload" | "unauthorized" | "unsupported_message" | "duplicate";
  correlationId: string;
}

/**
 * Port for inbound external messages.
 * The gateway acts as an adapter, normalizing payloads and delegating to the EventBus.
 */
export interface IMessageGateway {
  processWebhook(
    tenantId: string,
    payload: unknown,
    context?: WebhookContext
  ): Promise<GatewayProcessingResult>;

  normalizeMessage(
    tenantId: string,
    payload: unknown,
    context?: WebhookContext
  ): NormalizedInboundMessage;
}
