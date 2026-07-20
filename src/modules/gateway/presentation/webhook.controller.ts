import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GatewayUnauthorizedError, GatewayValidationError } from "../domain/errors";
import type { EventBus } from "../../../shared/events/event-bus";
import { createDomainEvent } from "../../../shared/events/domain-event";
import { logger } from "../../../shared/logger/logger";
import { EvolutionWebhookNormalizer } from "../application/evolution-webhook-normalizer";

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

/**
 * Registers the webhook controller that accepts incoming WhatsApp webhooks.
 *
 * El controlador valida el token del tenant, normaliza el payload y publica
 * un evento `MessageReceived` con metadata de tenant y correlación.
 */
export function registerWebhookController(app: FastifyInstance, deps: WebhookControllerDeps) {
  app.post("/webhooks/whatsapp/:webhookToken", async (request: FastifyRequest, reply: FastifyReply) => {
    const webhookToken = (request.params as any)?.webhookToken as string | undefined;
    if (!webhookToken) {
      reply.code(401);
      return { error: "Missing webhook token" };
    }

    const empresa = await deps.empresaRepository.findByWebhookToken?.(webhookToken);
    // Determine tenantId: prefer the payload sender when present, otherwise use the
    // Empresa record if active, or fall back to the webhook token.
    const safeBody: any = request.body && typeof request.body === "object" ? (request.body as any) : undefined;
    const payloadSender =
      safeBody?.sender ??
      safeBody?.data?.sender ??
      safeBody?.data?.key?.remoteJid ??
      safeBody?.data?.key?.remoteJidAlt ??
      safeBody?.key?.remoteJid ??
      safeBody?.from ??
      safeBody?.data?.from ??
      safeBody?.destination ??
      undefined;

    // Resolve tenantId: prefer a matched Empresa record when present and active,
    // otherwise fall back to the payload sender if available, or finally the
    // webhook token itself.
    let tenantId: string;
    if (empresa) {
      if (empresa.activo === false) {
        reply.code(401);
        return { error: "Unauthorized webhook token" };
      }
      tenantId = empresa.id;
    } else if (payloadSender) {
      tenantId = payloadSender;
    } else {
      tenantId = webhookToken;
    }

    const correlationId = request.headers["x-correlation-id"]?.toString() ?? `webhook-${Date.now()}`;

    // Conditionally log the incoming body only when explicitly enabled via env or header
    const logBodyEnv = process.env.WEBHOOK_LOG_BODY === "true";
    const debugHeader = (request.headers["x-debug-webhook"] ?? request.headers["X-Debug-Webhook"])?.toString();
    const logBodyHeader = typeof debugHeader === "string" && debugHeader.toLowerCase() === "true";

    // Helper: flatten an object into key paths -> values (non-recursing into arrays)
    const flattenObject = (obj: any, prefix = ""): Record<string, any> => {
      const out: Record<string, any> = {};
      if (obj === null || typeof obj !== "object") {
        out[prefix || "value"] = obj;
        return out;
      }
      for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v !== null && typeof v === "object" && !Array.isArray(v)) {
          Object.assign(out, flattenObject(v, key));
        } else {
          out[key] = v;
        }
      }
      return out;
    };
    const basicInfo = {
      event: safeBody?.event,
      messageId: safeBody?.data?.id ?? safeBody?.id ?? safeBody?.data?.key?.id ?? safeBody?.data?.key?.ID,
      // sender may appear at top-level (`sender`) or inside data.key.remoteJid
      sender:
        safeBody?.sender ??
        safeBody?.data?.sender ??
        safeBody?.data?.key?.remoteJid ??
        safeBody?.data?.key?.remoteJidAlt ??
        safeBody?.key?.remoteJid ??
        safeBody?.from ??
        safeBody?.data?.from ??
        safeBody?.destination ??
        undefined,
      remoteJid:
        safeBody?.data?.key?.remoteJid ??
        safeBody?.data?.key?.remoteJidAlt ??
        safeBody?.sender ??
        safeBody?.data?.sender ??
        safeBody?.key?.remoteJid ??
        safeBody?.from ??
        safeBody?.data?.from ??
        safeBody?.destination ??
        undefined,
      text: safeBody?.data?.message?.conversation ?? safeBody?.data?.message?.extendedTextMessage?.text,
      messageTimestamp: safeBody?.data?.messageTimestamp ?? safeBody?.messageTimestamp,
    };

    if (logBodyEnv) {
      // Environment flag requests full body logging
      logger.info({ tenantId, webhookToken, body: request.body, correlationId }, "webhook-controller: received webhook payload (body logged)");
    } else if (logBodyHeader) {
      // Header-based debug: log flattened key paths to values for inspection
      const flattened = safeBody ? flattenObject(safeBody) : {};
      logger.info({ tenantId, webhookToken, payloadKeys: flattened, correlationId }, "webhook-controller: received webhook payload (flattened keys)");
    } else {
      logger.info({ tenantId, webhookToken, basicInfo, correlationId }, "webhook-controller: received webhook payload (basic info)");
    }

    // Always print a concise summary to console: sender, remoteJid, messageType, text
    const sender = basicInfo.sender;
    const remoteJid = basicInfo.remoteJid;
    const messageType = safeBody?.data?.messageType ?? safeBody?.messageType ?? safeBody?.data?.message?.type ?? undefined;
    const text = basicInfo.text ?? (typeof safeBody?.data?.message?.conversation === 'string' ? safeBody.data.message.conversation : undefined);

    logger.info({ tenantId, sender, remoteJid, messageType, text, correlationId }, "webhook-controller: summary");

    let normalized;
    try {
      normalized = deps.normalizerService.normalizeMessage(tenantId, request.body);
    } catch (err: any) {
      if (err && err.name === "GatewayValidationError") {
        logger.warn({ err: { type: err.name, message: err.message }, tenantId, correlationId }, "webhook-controller: validation failed for incoming payload");
        // Reply with 400 but do not include error details in the response body
        reply.code(400);
        return reply.send();
      }
      throw err;
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

    await deps.eventBus.publish(event);

    return reply.code(202).send({ status: "accepted", correlationId });
  });
}
