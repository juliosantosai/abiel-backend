import { describe, it, expect, vi } from "vitest";
import Fastify from "fastify";
import { registerWebhookController } from "../../src/modules/gateway/presentation/webhook.controller";
import { EvolutionWebhookNormalizer } from "../../src/modules/gateway/application/evolution-webhook-normalizer";
import { InMemoryEventBus } from "../../src/shared/events/in-memory-event-bus";
import { logger } from "../../src/shared/logger/logger";

describe("Webhook controller logging and header handling", () => {
  it("logs body when X-Debug-Webhook header is true", async () => {
    const app = Fastify();
    const eventBus = new InMemoryEventBus();
    const loggerSpy = vi.spyOn(logger, "info").mockImplementation(() => undefined as any);

    registerWebhookController(app, {
      empresaRepository: { findByWebhookToken: async () => ({ id: "empresa-1", activo: true }) } as any,
      eventBus,
      normalizerService: new EvolutionWebhookNormalizer(),
    });

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/test-token",
      headers: {
        "content-type": "application/json",
        "x-debug-webhook": "true",
      },
      payload: {
        event: "messages.upsert",
        data: {
          id: "msg-100",
          key: { remoteJid: "user@s.whatsapp.net" },
          message: { conversation: "Hello" },
          messageTimestamp: 1710000000,
        },
      },
    });

    expect(response.statusCode).toBe(202);
    expect(loggerSpy).toHaveBeenCalled();
    loggerSpy.mockRestore();
  });

  it("returns 400 when normalizer rejects payload", async () => {
    const app = Fastify();
    const eventBus = new InMemoryEventBus();

    registerWebhookController(app, {
      empresaRepository: { findByWebhookToken: async () => ({ id: "empresa-1", activo: true }) } as any,
      eventBus,
      normalizerService: {
        normalizeMessage: () => { throw Object.assign(new Error("invalid"), { name: "GatewayValidationError" }); },
      } as any,
    });

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/test-token",
      headers: { "content-type": "application/json" },
      payload: { invalid: true },
    });

    expect(response.statusCode).toBe(400);
  });
});
