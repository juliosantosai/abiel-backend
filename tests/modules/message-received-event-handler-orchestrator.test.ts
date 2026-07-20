import { describe, it, expect, vi } from "vitest";
import { MessageReceivedEventHandler } from "../../src/modules/agente/application/message-received-event-handler";
import { createMessageReceivedEvent } from "../../src/modules/conversacion/domain/events/message-received.event";

describe("MessageReceivedEventHandler", () => {
  it("invokes orchestrator and ignores errors", async () => {
    const orchestrator = { orchestrateMessage: vi.fn().mockResolvedValue({ success: true }) } as any;
    const handler = new MessageReceivedEventHandler(orchestrator as any);
    const event = createMessageReceivedEvent({ messageId: "m1", conversationId: "c1", empresaId: "e1" }, { tenantId: "e1" });

    await handler.handle(event as any);
    expect(orchestrator.orchestrateMessage).toHaveBeenCalledTimes(1);

    orchestrator.orchestrateMessage = vi.fn().mockRejectedValue(new Error("fail"));
    await expect(handler.handle(event as any)).resolves.toBeUndefined();
  });

  it("does not throw when orchestrator returns null", async () => {
    const orchestrator = { orchestrateMessage: vi.fn().mockResolvedValue(null) } as any;
    const handler = new MessageReceivedEventHandler(orchestrator as any);
    const event = createMessageReceivedEvent({ messageId: "m2", conversationId: "c2", empresaId: "e2" }, { tenantId: "e2" });

    await expect(handler.handle(event as any)).resolves.toBeUndefined();
  });
});
