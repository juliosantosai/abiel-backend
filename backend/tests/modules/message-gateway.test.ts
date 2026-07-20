import { describe, expect, it, vi } from "vitest";
import { MessageGateway } from "../../src/modules/gateway/application/message-gateway";
import { EvolutionWebhookNormalizer } from "../../src/modules/gateway/application/evolution-webhook-normalizer";
import { GatewayUnauthorizedError, GatewayValidationError } from "../../src/modules/gateway/domain/errors";

function createEventBus() {
  return {
    publish: vi.fn().mockResolvedValue(undefined),
  };
}

function createDeliveryRepository() {
  return {
    findByDeliveryKey: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockResolvedValue(undefined),
    markProcessed: vi.fn().mockResolvedValue(undefined),
    markFailed: vi.fn().mockResolvedValue(undefined),
  };
}

describe("MessageGateway", () => {
  it("publishes a MessageReceived event for a valid payload", async () => {
    const eventBus = createEventBus();
    const deliveryRepository = createDeliveryRepository();
    const gateway = new MessageGateway(eventBus as any, new EvolutionWebhookNormalizer(), deliveryRepository as any);

    const payload = {
      event: "messages.upsert",
      data: {
        id: "msg-1",
        key: { remoteJid: "user@s.whatsapp.net" },
        message: { conversation: "hola" },
        messageTimestamp: 1710000000,
      },
    };

    const result = await gateway.processWebhook("empresa-1", payload, { correlationId: "corr-1" } as any);

    expect(result.accepted).toBe(true);
    expect(result.eventPublished).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(deliveryRepository.upsert).toHaveBeenCalled();
    expect(deliveryRepository.markProcessed).toHaveBeenCalled();
  });

  it("returns duplicate when delivery repository reports processed", async () => {
    const eventBus = createEventBus();
    const deliveryRepository = createDeliveryRepository();
    deliveryRepository.findByDeliveryKey = vi.fn().mockResolvedValue({ status: "PROCESSED", attempts: 1 });
    const gateway = new MessageGateway(eventBus as any, new EvolutionWebhookNormalizer(), deliveryRepository as any);

    const payload = {
      event: "messages.upsert",
      data: {
        id: "msg-dup",
        key: { remoteJid: "user@s.whatsapp.net" },
        message: { conversation: "hola" },
        messageTimestamp: 1710000000,
      },
    };

    const result = await gateway.processWebhook("empresa-1", payload, { correlationId: "corr-dup" } as any);

    expect(result.accepted).toBe(true);
    expect(result.eventPublished).toBe(false);
    expect(result.reason).toBe("duplicate");
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it("returns duplicate when same message is processed twice in memory", async () => {
    const eventBus = createEventBus();
    const gateway = new MessageGateway(eventBus as any, new EvolutionWebhookNormalizer());
    const payload = {
      event: "messages.upsert",
      data: {
        id: "msg-dup-2",
        key: { remoteJid: "user@s.whatsapp.net" },
        message: { conversation: "hola" },
        messageTimestamp: 1710000000,
      },
    };

    const first = await gateway.processWebhook("empresa-1", payload, { correlationId: "corr-1" } as any);
    const second = await gateway.processWebhook("empresa-1", payload, { correlationId: "corr-2" } as any);

    expect(first.accepted).toBe(true);
    expect(second.accepted).toBe(true);
    expect(second.eventPublished).toBe(false);
    expect(second.reason).toBe("duplicate");
  });

  it("throws unauthorized when tenantId is missing", async () => {
    const eventBus = createEventBus();
    const gateway = new MessageGateway(eventBus as any, new EvolutionWebhookNormalizer());
    await expect(gateway.processWebhook("", {} as any)).rejects.toThrow(GatewayUnauthorizedError);
  });

  it("returns invalid_payload when webhook payload is malformed", async () => {
    const eventBus = createEventBus();
    const deliveryRepository = createDeliveryRepository();
    const gateway = new MessageGateway(eventBus as any, new EvolutionWebhookNormalizer(), deliveryRepository as any);

    const result = await gateway.processWebhook("empresa-1", { event: "messages.upsert", data: { id: "bad", key: {}, messageTimestamp: 1710000000 } } as any, { correlationId: "corr-bad" } as any);

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe("invalid_payload");
    expect(deliveryRepository.markFailed).toHaveBeenCalled();
  });
});
