import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import { EvolutionWebhookNormalizer } from "../../../src/modules/gateway/application/evolution-webhook-normalizer";
import { MessageGateway } from "../../../src/modules/gateway/application/message-gateway";
import { GatewayValidationError } from "../../../src/modules/gateway/domain/errors";
import { registerWebhookController } from "../../../src/modules/gateway/presentation/webhook.controller";
import { InMemoryEventBus } from "../../../src/shared/events/in-memory-event-bus";

describe("Evolution webhook gateway", () => {
  it("accepts a valid webhook and publishes a normalized event", async () => {
    const app = Fastify();
    const gateway = new MessageGateway(new InMemoryEventBus(), new EvolutionWebhookNormalizer());

    registerWebhookController(app, {
      empresaRepository: {
        findByWebhookToken: async () => ({ id: "empresa-1", activo: true }),
      } as any,
      gateway,
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
});
