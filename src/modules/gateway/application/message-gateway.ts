import { createDomainEvent } from "../../../shared/events/domain-event";
import type { EventBus } from "../../../shared/events/event-bus";
import { GatewayUnauthorizedError, GatewayValidationError } from "../domain/errors";
import type { GatewayProcessingResult, IMessageGateway, NormalizedInboundMessage, WebhookContext } from "../domain/message-gateway.interface";
import type { WebhookDeliveryRepository } from "../domain/webhook-delivery-repository";
import type { EvolutionWebhookNormalizer } from "./evolution-webhook-normalizer";

export class MessageGateway implements IMessageGateway {
  private readonly seenMessages = new Set<string>();

  constructor(
    private readonly eventBus: EventBus,
    private readonly normalizer: EvolutionWebhookNormalizer,
    private readonly deliveryRepository?: WebhookDeliveryRepository
  ) {}

  async processWebhook(tenantId: string, payload: unknown, context?: WebhookContext): Promise<GatewayProcessingResult> {
    if (!tenantId || tenantId.trim() === "") {
      throw new GatewayUnauthorizedError("Tenant is required");
    }

    const correlationId = context?.correlationId ?? `gw-${Date.now()}`;

    try {
      const normalized = this.normalizeMessage(tenantId, payload, context);
      const dedupeKey = `${normalized.tenantId}:${normalized.messageId}`;

      const existingDelivery = this.deliveryRepository ? await this.deliveryRepository.findByDeliveryKey(dedupeKey) : null;
      if (existingDelivery?.status === "PROCESSED") {
        return { accepted: true, eventPublished: false, reason: "duplicate", correlationId };
      }

      if (this.seenMessages.has(dedupeKey)) {
        return { accepted: true, eventPublished: false, reason: "duplicate", correlationId };
      }

      this.seenMessages.add(dedupeKey);
      if (this.deliveryRepository) {
        await this.deliveryRepository.upsert({
          deliveryKey: dedupeKey,
          tenantId: normalized.tenantId,
          status: "PENDING",
          attempts: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

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
      if (this.deliveryRepository) {
        await this.deliveryRepository.markProcessed(dedupeKey);
      }

      return { accepted: true, eventPublished: true, correlationId };
    } catch (error) {
      if (this.deliveryRepository) {
        const dedupeKey = `${tenantId}:${(payload as any)?.data?.id ?? "unknown"}`;
        await this.deliveryRepository.markFailed(dedupeKey, error instanceof Error ? error.message : "unknown_error");
      }

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
