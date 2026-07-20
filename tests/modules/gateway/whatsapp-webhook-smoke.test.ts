import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import { registerWebhookController } from "../../../src/modules/gateway/presentation/webhook.controller";
import { EvolutionWebhookNormalizer } from "../../../src/modules/gateway/application/evolution-webhook-normalizer";
import { InMemoryEventBus } from "../../../src/shared/events/in-memory-event-bus";
import type { DomainEvent } from "../../../src/shared/events/domain-event";
import type { EventHandler } from "../../../src/shared/events/event-handler";

describe("WhatsApp webhook smoke test", () => {
  it("publishes a MessageReceived event when a mocked WhatsApp message arrives", async () => {
    const app = Fastify();
    const eventBus = new InMemoryEventBus();
    const receivedEvents: DomainEvent[] = [];

    eventBus.subscribe("MessageReceived", {
      handle: async (event) => {
        receivedEvents.push(event);
      },
    } as EventHandler);

    registerWebhookController(app, {
      empresaRepository: {
        findByWebhookToken: async () => ({ id: "empresa-1", activo: true }),
      } as any,
      eventBus,
      normalizerService: new EvolutionWebhookNormalizer(),
    });

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/test-token",
      headers: {
        "content-type": "application/json",
        "x-correlation-id": "smoke-001",
      },
      payload: {
        event: "messages.upsert",
        data: {
          id: "msg-smoke-001",
          key: { remoteJid: "549111234567@s.whatsapp.net" },
          message: { conversation: "Hola desde el mock" },
          messageTimestamp: 1710000000,
        },
      },
    });

    expect(response.statusCode).toBe(202);
    expect(receivedEvents).toHaveLength(1);
    expect(receivedEvents[0].eventName).toBe("MessageReceived");
    expect(receivedEvents[0].payload).toMatchObject({
      text: "Hola desde el mock",
      conversationId: "empresa-1:549111234567@s.whatsapp.net",
    });
  });
});
