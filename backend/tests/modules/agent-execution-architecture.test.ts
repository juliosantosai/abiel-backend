import { describe, it, expect, vi } from "vitest";
import { AgentOrchestrator } from "../../src/modules/agente/application/agent-orchestrator";
import { CapabilityRegistry } from "../../src/modules/agente/application/capability-registry";
import { InMemoryEventBus } from "../../src/shared/events/in-memory-event-bus";

const makeEvent = (empresaId: string, conversationId = "c1", messageId = "m1", correlationId?: string) => ({
  eventId: `message-received-${messageId}`,
  occurredAt: new Date(),
  eventName: "MessageReceived",
  aggregateId: conversationId,
  metadata: { tenantId: empresaId, correlationId },
  payload: { messageId, conversationId, empresaId },
});

describe("AgentExecution architecture", () => {
  it("executes agent for same tenant", async () => {
    const agent = { id: "a1", empresaId: "e1", estado: "ACTIVE", capabilities: [] };
    const repo = { findByEmpresa: vi.fn().mockResolvedValue([agent]) } as any;
    const convoRepo = { findById: vi.fn().mockResolvedValue({ id: "c1", empresaId: "e1" }) } as any;
    const messageRepo = { findByConversationId: vi.fn().mockResolvedValue([{ id: "m1", conversationId: "c1", empresaId: "e1", contenido: "hola" }]) } as any;
    const runtime = { execute: vi.fn().mockResolvedValue({ success: true }) } as any;
    const bus = new InMemoryEventBus();
    const publishSpy = vi.spyOn(bus, "publish");
    const capabilityRegistry = new CapabilityRegistry();

    const orch = new AgentOrchestrator(repo as any, convoRepo as any, messageRepo as any, runtime as any, bus as any, capabilityRegistry);
    const ev = makeEvent("e1");
    const res = await orch.orchestrateMessage(ev as any);

    expect(runtime.execute).toHaveBeenCalled();
    expect(publishSpy).toHaveBeenCalled();
  });

  it("never uses agent from other tenant", async () => {
    const agent = { id: "a1", empresaId: "e2", estado: "ACTIVE", capabilities: [] };
    const repo = { findByEmpresa: vi.fn().mockResolvedValue([agent]) } as any;
    const convoRepo = { findById: vi.fn().mockResolvedValue({ id: "c1", empresaId: "e1" }) } as any;
    const messageRepo = { findByConversationId: vi.fn().mockResolvedValue([{ id: "m1", conversationId: "c1", empresaId: "e1", contenido: "hola" }]) } as any;
    const runtime = { execute: vi.fn().mockResolvedValue({ success: true }) } as any;
    const bus = new InMemoryEventBus();
    const capabilityRegistry = new CapabilityRegistry();

    const orch = new AgentOrchestrator(repo as any, convoRepo as any, messageRepo as any, runtime as any, bus as any, capabilityRegistry);
    const ev = makeEvent("e1");
    const res = await orch.orchestrateMessage(ev as any);

    expect(runtime.execute).not.toHaveBeenCalled();
  });

  it("marks execution FAILED when runtime throws", async () => {
    const agent = { id: "a1", empresaId: "e1", estado: "ACTIVE", capabilities: [] };
    const repo = { findByEmpresa: vi.fn().mockResolvedValue([agent]) } as any;
    const convoRepo = { findById: vi.fn().mockResolvedValue({ id: "c1", empresaId: "e1" }) } as any;
    const messageRepo = { findByConversationId: vi.fn().mockResolvedValue([{ id: "m1", conversationId: "c1", empresaId: "e1", contenido: "hola" }]) } as any;
    const runtime = { execute: vi.fn().mockRejectedValue(new Error("boom")) } as any;
    const bus = new InMemoryEventBus();
    const publishSpy = vi.spyOn(bus, "publish");
    const capabilityRegistry = new CapabilityRegistry();

    const orch = new AgentOrchestrator(repo as any, convoRepo as any, messageRepo as any, runtime as any, bus as any, capabilityRegistry);
    const ev = makeEvent("e1");
    await expect(orch.orchestrateMessage(ev as any)).rejects.toThrow("boom");

    // last published event should be failed
    const calledNames = publishSpy.mock.calls.map((c) => c[0].eventName);
    expect(calledNames).toContain("AgentExecutionFailed");
  });

  it("preserves correlationId in events", async () => {
    const agent = { id: "a1", empresaId: "e1", estado: "ACTIVE", capabilities: [] };
    const repo = { findByEmpresa: vi.fn().mockResolvedValue([agent]) } as any;
    const convoRepo = { findById: vi.fn().mockResolvedValue({ id: "c1", empresaId: "e1" }) } as any;
    const messageRepo = { findByConversationId: vi.fn().mockResolvedValue([{ id: "m1", conversationId: "c1", empresaId: "e1", contenido: "hola" }]) } as any;
    const runtime = { execute: vi.fn().mockResolvedValue({ success: true }) } as any;
    const bus = new InMemoryEventBus();
    const publishSpy = vi.spyOn(bus, "publish");
    const capabilityRegistry = new CapabilityRegistry();

    const orch = new AgentOrchestrator(repo as any, convoRepo as any, messageRepo as any, runtime as any, bus as any, capabilityRegistry);
    const ev = makeEvent("e1", "c1", "m1", "corr-123");
    await orch.orchestrateMessage(ev as any);

    const found = publishSpy.mock.calls.find((c) => c[0].eventName === "AgentExecutionStarted");
    expect(found).toBeDefined();
    expect(found[0].metadata.correlationId).toBe("corr-123");
  });
});
