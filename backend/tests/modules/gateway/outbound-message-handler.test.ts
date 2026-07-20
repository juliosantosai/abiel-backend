import { describe, it, expect, vi } from "vitest";
import { OutboundMessageHandler } from "../../../src/modules/gateway/application/outbound-message-handler";
import { DomainEvent } from "../../../src/shared/events/domain-event";
import { logger } from "../../../src/shared/logger/logger";

describe("OutboundMessageHandler", () => {
  it("logs outbound message send operations", async () => {
    const event = {
      eventId: "send-1",
      occurredAt: new Date(),
      eventName: "SendMessageRequested",
      aggregateId: "empresa-1:1234",
      metadata: { tenantId: "empresa-1", correlationId: "corr-1" },
      payload: {
        tenantId: "empresa-1",
        conversationId: "empresa-1:1234",
        messageContent: "Echo response",
        originalMessageId: "msg-1",
        agentId: "agent-1",
        executionId: "exec-1",
      },
    } as DomainEvent;

    const loggerSpy = vi.spyOn(logger, "info").mockImplementation(() => undefined as any);
    const handler = new OutboundMessageHandler();

    await handler.handle(event);

    expect(loggerSpy).toHaveBeenCalled();
    loggerSpy.mockRestore();
  });
});
