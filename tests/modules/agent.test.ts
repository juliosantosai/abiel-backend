import { describe, it, expect } from "vitest";
import { Agent } from "../../src/modules/agente/domain/agent";
import { AgentStatus } from "../../src/modules/agente/domain/agent-status";

describe("Agent domain", () => {
  it("validates required fields", () => {
    expect(() => new Agent({ id: "", empresaId: "e1", nombre: "n", estado: AgentStatus.ACTIVE, createdAt: new Date(), updatedAt: new Date() })).toThrow();
    expect(() => new Agent({ id: "a1", empresaId: "", nombre: "n", estado: AgentStatus.ACTIVE, createdAt: new Date(), updatedAt: new Date() })).toThrow();
    expect(() => new Agent({ id: "a1", empresaId: "e1", nombre: "  ", estado: AgentStatus.ACTIVE, createdAt: new Date(), updatedAt: new Date() })).toThrow();
  });

  it("allows state transitions", () => {
    const a = new Agent({ id: "a2", empresaId: "e1", nombre: "Agent", estado: AgentStatus.PAUSED, createdAt: new Date(), updatedAt: new Date() });
    a.activate();
    expect(a.estado).toBe(AgentStatus.ACTIVE);
    a.pause();
    expect(a.estado).toBe(AgentStatus.PAUSED);
    a.disable();
    expect(a.estado).toBe(AgentStatus.DISABLED);
  });
});
