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

/**
 * Result returned by the message gateway after webhook processing.
 *
 * `accepted` indica si el payload fue aceptado para el workflow interno.
 * `eventPublished` indica si se generó un evento de dominio para procesamiento posterior.
 */
export interface GatewayProcessingResult {
  accepted: boolean;
  eventPublished: boolean;
  reason?: "invalid_payload" | "unauthorized" | "unsupported_message" | "duplicate";
  correlationId: string;
}

/**
 * Port for inbound external messages.
 *
 * El gateway actúa como adaptador de proveedor. Normaliza payloads, valida tenant y
 * publica eventos de dominio que otros módulos consumen.
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
