import { describe, it, expect, vi } from "vitest";
import Fastify from "fastify";
import { EvolutionWebhookNormalizer } from "../../../src/modules/gateway/application/evolution-webhook-normalizer";
import { MessageGateway } from "../../../src/modules/gateway/application/message-gateway";
import { GatewayValidationError } from "../../../src/modules/gateway/domain/errors";
import { registerWebhookController } from "../../../src/modules/gateway/presentation/webhook.controller";
import { InMemoryEventBus } from "../../../src/shared/events/in-memory-event-bus";

describe("Evolution webhook gateway", () => {
  it("accepts a valid webhook and publishes a normalized event", async () => {
    const app = Fastify();
    const eventBus = new InMemoryEventBus();
    const publishSpy = vi.spyOn(eventBus, "publish");
    const normalizer = new EvolutionWebhookNormalizer();

    registerWebhookController(app, {
      empresaRepository: {
        findByWebhookToken: async () => ({ id: "empresa-1", activo: true }),
      } as any,
      eventBus,
      normalizerService: normalizer,
    });

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/tenant-token",
      headers: { "content-type": "application/json" },
      payload: {
        event: "messages.upsert",
        data: {
          id: "msg-001",
          key: { remoteJid: "549111234567@s.whatsapp.net" },
          message: { conversation: "Hola desde WhatsApp" },
          messageTimestamp: 1710000000,
        },
      },
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toMatchObject({ status: "accepted" });
    expect(publishSpy).toHaveBeenCalled();
  });

  it("rejects invalid tokens before processing the payload", async () => {
    const app = Fastify();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) } as any;

    registerWebhookController(app, {
      empresaRepository: {
        findByWebhookToken: async () => null,
      } as any,
      eventBus,
      normalizerService: new EvolutionWebhookNormalizer(),
    });

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/invalid-token",
      headers: { "content-type": "application/json" },
      payload: {
        event: "messages.upsert",
        data: {
          id: "msg-999",
          key: { remoteJid: "549111234567@s.whatsapp.net" },
          message: { conversation: "No debe procesarse" },
          messageTimestamp: 1710000000,
        },
      },
    });

    expect(response.statusCode).toBe(401);
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it("rejects malformed payloads before publishing", () => {
    const normalizer = new EvolutionWebhookNormalizer();

    expect(() =>
      normalizer.normalizeMessage("empresa-1", {
        event: "messages.upsert",
        data: {
          id: "msg-002",
          key: { remoteJid: "549111234567@s.whatsapp.net" },
          messageTimestamp: 1710000000,
        },
      })
    ).toThrow(GatewayValidationError);
  });

  it("normalizes media payloads with captions", () => {
    const normalizer = new EvolutionWebhookNormalizer();

    const normalized = normalizer.normalizeMessage("empresa-1", {
      event: "messages.upsert",
      data: {
        id: "msg-003",
        key: { remoteJid: "549111234567@s.whatsapp.net" },
        message: {
          imageMessage: {
            mimetype: "image/jpeg",
            caption: "Foto de prueba",
          },
        },
        messageTimestamp: 1710000000,
      },
    });

    expect(normalized.contentType).toBe("image");
    expect(normalized.text).toBe("Foto de prueba");
    expect(normalized.media).toMatchObject({
      mimeType: "image/jpeg",
      caption: "Foto de prueba",
    });
  });

  it("uses a delivery repository to deduplicate repeated webhook deliveries", async () => {
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) } as any;
    const deliveryRepository = {
      findByDeliveryKey: vi.fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ status: "PROCESSED", attempts: 1 }),
      upsert: vi.fn().mockResolvedValue(undefined),
      markProcessed: vi.fn().mockResolvedValue(undefined),
      markFailed: vi.fn().mockResolvedValue(undefined),
    };
    const gateway = new MessageGateway(eventBus, new EvolutionWebhookNormalizer(), deliveryRepository as any);
    const payload = {
      event: "messages.upsert",
      data: {
        id: "msg-004",
        key: { remoteJid: "549111234567@s.whatsapp.net" },
        message: { conversation: "Hola de nuevo" },
        messageTimestamp: 1710000000,
      },
    };

    const first = await gateway.processWebhook("empresa-1", payload, {
      tenantId: "empresa-1",
      correlationId: "corr-1",
      receivedAt: new Date(),
      source: "whatsapp",
      provider: "evolution",
      auth: {},
    });
    const second = await gateway.processWebhook("empresa-1", payload, {
      tenantId: "empresa-1",
      correlationId: "corr-2",
      receivedAt: new Date(),
      source: "whatsapp",
      provider: "evolution",
      auth: {},
    });

    expect(first.accepted).toBe(true);
    expect(second.accepted).toBe(true);
    expect(second.reason).toBe("duplicate");
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(deliveryRepository.markProcessed).toHaveBeenCalled();
  });
});
