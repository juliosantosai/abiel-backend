import { describe, it, expect, vi } from "vitest";
import { AgentOrchestrator } from "../../src/modules/agente/application/agent-orchestrator";
import { createMessageReceivedEvent } from "../../src/modules/conversacion/domain/events/message-received.event";
import { ConversationStatus } from "../../src/modules/conversacion/domain/conversation-status";

describe("AgentOrchestrator", () => {
  it("returns null when no active agent", async () => {
    const repo = { findByEmpresa: vi.fn().mockResolvedValue([]) } as any;
    const convRepo = { findById: vi.fn().mockResolvedValue({ id: "c1", empresaId: "e1" }) } as any;
    const msgRepo = { findByConversationId: vi.fn().mockResolvedValue([]) } as any;
    const runtime = { execute: vi.fn() } as any;
    const bus = { publish: vi.fn() } as any;
    const orchestrator = new AgentOrchestrator(repo, convRepo, msgRepo, runtime, bus);

    const event = createMessageReceivedEvent({ messageId: "m1", conversationId: "c1", empresaId: "e1" }, { tenantId: "e1" });
    const res = await orchestrator.orchestrateMessage(event as any);
    expect(res).toBeNull();
  });

  it("invokes runtime when active agent exists", async () => {
    const agent = { id: "a1", empresaId: "e1", estado: "ACTIVE" };
    const repo = { findByEmpresa: vi.fn().mockResolvedValue([agent]) } as any;
    const convRepo = { findById: vi.fn().mockResolvedValue({ id: "c2", empresaId: "e1" }) } as any;
    const msgRepo = { findByConversationId: vi.fn().mockResolvedValue([{ id: "m2", conversationId: "c2", empresaId: "e1", contenido: "hello" }]) } as any;
    const runtime = { execute: vi.fn().mockResolvedValue({ success: true, response: { output: "ok" } }) } as any;
    const bus = { publish: vi.fn() } as any;
    const orchestrator = new AgentOrchestrator(repo, convRepo, msgRepo, runtime, bus);

    const event = createMessageReceivedEvent({ messageId: "m2", conversationId: "c2", empresaId: "e1" }, { tenantId: "e1" });
    const res = await orchestrator.orchestrateMessage(event as any);
    expect(runtime.execute).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it("skips execution when conversation is under human intervention", async () => {
    const agent = { id: "a1", empresaId: "e1", estado: "ACTIVE" };
    const repo = { findByEmpresa: vi.fn().mockResolvedValue([agent]) } as any;
    const convRepo = { findById: vi.fn().mockResolvedValue({ id: "c3", empresaId: "e1", estado: ConversationStatus.HUMAN_INTERVENTION }) } as any;
    const msgRepo = { findByConversationId: vi.fn().mockResolvedValue([{ id: "m3", conversationId: "c3", empresaId: "e1", contenido: "hello" }]) } as any;
    const runtime = { execute: vi.fn().mockResolvedValue({ success: true }) } as any;
    const bus = { publish: vi.fn() } as any;
    const orchestrator = new AgentOrchestrator(repo, convRepo, msgRepo, runtime, bus);

    const event = createMessageReceivedEvent({ messageId: "m3", conversationId: "c3", empresaId: "e1" }, { tenantId: "e1" });
    const res = await orchestrator.orchestrateMessage(event as any);

    expect(res).toBeNull();
    expect(runtime.execute).not.toHaveBeenCalled();
  });
});
