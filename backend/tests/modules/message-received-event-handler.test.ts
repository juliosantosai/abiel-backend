import { describe, it, expect, vi } from "vitest";
import { MessageReceivedEventHandler } from "../../src/modules/agente/application/message-received-event-handler";
import { createMessageReceivedEvent } from "../../src/modules/conversacion/domain/events/message-received.event";

describe("MessageReceivedEventHandler", () => {
  it("calls orchestrator and swallows errors", async () => {
    const orchestrator = { orchestrateMessage: vi.fn().mockResolvedValue({ success: true }) } as any;
    const handler = new MessageReceivedEventHandler(orchestrator as any);

    const event = createMessageReceivedEvent({ messageId: "m1", conversationId: "c1", empresaId: "e1" }, { tenantId: "e1" });
    await handler.handle(event as any);
    expect(orchestrator.orchestrateMessage).toHaveBeenCalled();

    orchestrator.orchestrateMessage = vi.fn().mockRejectedValue(new Error("fail"));
    await handler.handle(event as any); // should not throw
  });
});
