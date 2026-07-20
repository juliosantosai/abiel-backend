import { describe, it, expect, vi } from "vitest";
import { AgentService } from "../../src/modules/agente/application/agent-service";
import { TenantContext } from "../../src/shared/context/tenant-context";
import { AgentStatus } from "../../src/modules/agente/domain/agent-status";

const context = TenantContext.create({
  usuarioId: "user-1",
  empresaId: "empresa-1",
  membershipId: "membership-1",
  rolIds: ["rol-1"],
  permisos: [],
  isGlobalTenant: false,
});

describe("AgentService", () => {
  it("creates an agent and publishes event", async () => {
    const repo = {
      create: vi.fn().mockImplementation(async (a) => a),
      update: vi.fn(),
      findById: vi.fn(),
      findByEmpresa: vi.fn(),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const service = new AgentService(repo as any, eventBus as any);

    const created = await service.crearAgent(context, { nombre: "Agent 1" });
    expect(created.empresaId).toBe("empresa-1");
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it("enforces tenant on state changes and publishes events", async () => {
    const repo = {
      create: vi.fn(),
      update: vi.fn().mockImplementation(async (a) => a),
      findById: vi.fn().mockResolvedValue({ id: "a1", empresaId: "empresa-1", nombre: "A", descripcion: null, estado: AgentStatus.PAUSED, configuracionId: null, definition: undefined, settings: undefined, capabilities: [], createdAt: new Date(), updatedAt: new Date() }),
      findByEmpresa: vi.fn(),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const service = new AgentService(repo as any, eventBus as any);

    const activated = await service.activate(context, "a1");
    expect(activated.estado).toBe(AgentStatus.ACTIVE);
    expect(eventBus.publish).toHaveBeenCalled();

    // wrong tenant
    repo.findById = vi.fn().mockResolvedValue(null);
    await expect(service.pause(context, "a1")).rejects.toThrow();
  });
});
