import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GatewayUnauthorizedError, GatewayValidationError } from "../domain/errors";
import type { EventBus } from "../../../shared/events/event-bus";
import { createDomainEvent } from "../../../shared/events/domain-event";
import type { EvolutionWebhookNormalizer } from "../application/evolution-webhook-normalizer";

interface WebhookControllerDeps {
  empresaRepository: {
    findByWebhookToken?: (token: string) => Promise<{ id: string; activo?: boolean } | null>;
  };
  eventBus: EventBus;
  normalizerService: EvolutionWebhookNormalizer;
  gateway?: {
    processWebhook: (tenantId: string, payload: unknown, context?: any) => Promise<{ accepted: boolean; eventPublished: boolean; reason?: string; correlationId: string }>;
  };
}

export function registerWebhookController(app: FastifyInstance, deps: WebhookControllerDeps) {
  app.post("/webhooks/whatsapp/:webhookToken", async (request: FastifyRequest, reply: FastifyReply) => {
    const webhookToken = (request.params as any)?.webhookToken as string | undefined;
    if (!webhookToken) {
      reply.code(401);
      return { error: "Missing webhook token" };
    }

    const empresa = await deps.empresaRepository.findByWebhookToken?.(webhookToken);
    if (!empresa || empresa.activo === false) {
      reply.code(401);
      return { error: "Unauthorized webhook token" };
    }

    const correlationId = request.headers["x-correlation-id"]?.toString() ?? `webhook-${Date.now()}`;

    const normalized = deps.normalizerService.normalizeMessage(empresa.id, request.body);
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

    await deps.eventBus.publish(event);

    reply.code(202);
    return { status: "accepted", correlationId };
  });
}
