import { createDomainEvent } from "../../../shared/events/domain-event";
import type { EventBus } from "../../../shared/events/event-bus";
import { GatewayUnauthorizedError, GatewayValidationError } from "../domain/errors";
import type { GatewayProcessingResult, IMessageGateway, NormalizedInboundMessage, WebhookContext } from "../domain/message-gateway.interface";
import type { EvolutionWebhookNormalizer } from "./evolution-webhook-normalizer";

export class MessageGateway implements IMessageGateway {
  constructor(
    private readonly eventBus: EventBus,
    private readonly normalizer: EvolutionWebhookNormalizer
  ) {}

  async processWebhook(tenantId: string, payload: unknown, context?: WebhookContext): Promise<GatewayProcessingResult> {
    if (!tenantId || tenantId.trim() === "") {
      throw new GatewayUnauthorizedError("Tenant is required");
    }

    const correlationId = context?.correlationId ?? `gw-${Date.now()}`;

    try {
      const normalized = this.normalizeMessage(tenantId, payload, context);
      const event = createDomainEvent({
        eventId: `message-received-${normalized.messageId}`,
        occurredAt: new Date(),
        eventName: "MessageReceived",
        aggregateId: normalized.conversationKey,
        metadata: {
          tenantId: normalized.tenantId,
          correlationId,
        },
        payload: {
          messageId: normalized.messageId,
          conversationId: normalized.conversationKey,
          empresaId: normalized.tenantId,
          senderId: normalized.senderId,
          contentType: normalized.contentType,
          text: normalized.text,
          media: normalized.media,
          receivedAt: normalized.receivedAt.toISOString(),
        },
      });

      await this.eventBus.publish(event);

      return { accepted: true, eventPublished: true, correlationId };
    } catch (error) {
      if (error instanceof GatewayValidationError) {
        return { accepted: false, eventPublished: false, reason: "invalid_payload", correlationId };
      }

      if (error instanceof GatewayUnauthorizedError) {
        return { accepted: false, eventPublished: false, reason: "unauthorized", correlationId };
      }

      return { accepted: false, eventPublished: false, reason: "invalid_payload", correlationId };
    }
  }

  normalizeMessage(tenantId: string, payload: unknown, _context?: WebhookContext): NormalizedInboundMessage {
    return this.normalizer.normalizeMessage(tenantId, payload);
  }
}
