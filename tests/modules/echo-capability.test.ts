import { describe, expect, it, vi } from "vitest";
import { EchoCapability } from "../../src/modules/agente/application/echo-capability";
import { createAgentExecutionContext } from "../../src/shared/ai/agent-execution-context";

function createEventBus() {
  return {
    publish: vi.fn().mockResolvedValue(undefined),
  };
}

describe("EchoCapability", () => {
  it("always can handle messages", async () => {
    const eventBus = createEventBus();
    const capability = new EchoCapability(eventBus as any);
    const ctx = createAgentExecutionContext({
      tenantId: "tenant-1",
      agentId: "agent-1",
      conversation: { id: "conv-1" },
      message: { id: "m1", content: "hello" },
      capabilities: ["echo-capability"],
      metadata: { executionId: "exec-1" },
      correlationId: "corr-1",
    });

    expect(await capability.canHandle(ctx)).toBe(true);
  });

  it("publishes SendMessageRequested and returns a successful result", async () => {
    const eventBus = createEventBus();
    const capability = new EchoCapability(eventBus as any);
    const ctx = createAgentExecutionContext({
      tenantId: "tenant-1",
      agentId: "agent-1",
      conversation: { id: "conv-1" },
      message: { id: "m1", content: "hello world" },
      capabilities: ["echo-capability"],
      metadata: { executionId: "exec-1" },
      correlationId: "corr-1",
    });

    const result = await capability.execute(ctx);

    expect(result.success).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const event = eventBus.publish.mock.calls[0][0];
    expect(event.eventName).toBe("SendMessageRequested");
    expect(event.payload.messageContent).toContain("Echo:");
  });

  it("returns failure when publish throws an error", async () => {
    const eventBus = { publish: vi.fn().mockRejectedValue(new Error("bus down")) };
    const capability = new EchoCapability(eventBus as any);
    const ctx = createAgentExecutionContext({
      tenantId: "tenant-1",
      agentId: "agent-1",
      conversation: { id: "conv-1" },
      message: { id: "m1", content: "hello world" },
      capabilities: ["echo-capability"],
      metadata: { executionId: "exec-1" },
      correlationId: "corr-1",
    });

    const result = await capability.execute(ctx);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(eventBus.publish).toHaveBeenCalled();
  });
});
