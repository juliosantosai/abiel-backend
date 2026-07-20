import { beforeAll, afterEach, describe, expect, it } from "vitest";
import { PrismaAgentRepository } from "../../src/modules/agente/infrastructure/prisma-agent-repository";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";
import { AgentStatus } from "../../src/modules/agente/domain/agent-status";

describe("PrismaAgentRepository", () => {
  const repo = new PrismaAgentRepository();

  beforeAll(() => {
    ensurePrismaSchema();
  });

  afterEach(async () => {
    await prisma.agent.deleteMany({ where: { id: { startsWith: "agent-test-" } } });
    await prisma.empresa.deleteMany({ where: { id: { startsWith: "empresa-agent-test-" } } });
  });

  it("creates and retrieves an agent within tenant scope", async () => {
    const empresa = await prisma.empresa.create({
      data: { id: "empresa-agent-test-1", nombre: "E1", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() },
    });

    const now = new Date();
    const agent = await repo.create({
      id: "agent-test-1",
      empresaId: empresa.id,
      nombre: "Agent A",
      descripcion: "desc",
      estado: AgentStatus.ACTIVE,
      configuracionId: null,
      definition: {},
      settings: {},
      capabilities: [],
      createdAt: now,
      updatedAt: now,
    } as any);

    expect(agent.id).toBe("agent-test-1");

    const found = await repo.findById("agent-test-1", empresa.id);
    expect(found).not.toBeNull();
    expect(found?.empresaId).toBe(empresa.id);
  });

  it("does not allow another tenant to read the agent", async () => {
    const empresaA = await prisma.empresa.create({ data: { id: "empresa-agent-test-a", nombre: "A", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    const empresaB = await prisma.empresa.create({ data: { id: "empresa-agent-test-b", nombre: "B", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });

    const now = new Date();
    await repo.create({ id: "agent-test-2", empresaId: empresaA.id, nombre: "Agent A", descripcion: null, estado: AgentStatus.ACTIVE, configuracionId: null, definition: {}, settings: {}, capabilities: [], createdAt: now, updatedAt: now } as any);

    const other = await repo.findById("agent-test-2", empresaB.id);
    expect(other).toBeNull();
  });

  it("prevents cross-tenant update", async () => {
    const empresaA = await prisma.empresa.create({ data: { id: "empresa-agent-test-u-a", nombre: "A", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    const empresaB = await prisma.empresa.create({ data: { id: "empresa-agent-test-u-b", nombre: "B", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });

    const now = new Date();
    await repo.create({ id: "agent-test-3", empresaId: empresaA.id, nombre: "Agent A", descripcion: null, estado: AgentStatus.ACTIVE, configuracionId: null, definition: {}, settings: {}, capabilities: [], createdAt: now, updatedAt: now } as any);

    // Attempt to update pretending to be empresaB
    const updatedObj = { id: "agent-test-3", empresaId: empresaB.id, nombre: "Hacked", descripcion: null, estado: AgentStatus.ACTIVE, configuracionId: null, definition: {}, settings: {}, capabilities: [], createdAt: now, updatedAt: now } as any;

    await expect(repo.update(updatedObj)).rejects.toThrow();
  });

  it("prevents cross-tenant delete and allows correct tenant delete", async () => {
    const empresaA = await prisma.empresa.create({ data: { id: "empresa-agent-test-d-a", nombre: "A", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    const empresaB = await prisma.empresa.create({ data: { id: "empresa-agent-test-d-b", nombre: "B", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });

    const now = new Date();
    await repo.create({ id: "agent-test-4", empresaId: empresaA.id, nombre: "Agent A", descripcion: null, estado: AgentStatus.ACTIVE, configuracionId: null, definition: {}, settings: {}, capabilities: [], createdAt: now, updatedAt: now } as any);

    await expect(repo.delete("agent-test-4", empresaB.id)).rejects.toThrow();

    // correct tenant can delete
    await expect(repo.delete("agent-test-4", empresaA.id)).resolves.toBeUndefined();
  });

  it("findByEmpresa returns only that tenant's agents", async () => {
    const empresaA = await prisma.empresa.create({ data: { id: "empresa-agent-test-f-a", nombre: "A", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    const empresaB = await prisma.empresa.create({ data: { id: "empresa-agent-test-f-b", nombre: "B", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });

    const now = new Date();
    await repo.create({ id: "agent-test-5", empresaId: empresaA.id, nombre: "Agent A1", descripcion: null, estado: AgentStatus.ACTIVE, configuracionId: null, definition: {}, settings: {}, capabilities: [], createdAt: now, updatedAt: now } as any);
    await repo.create({ id: "agent-test-6", empresaId: empresaB.id, nombre: "Agent B1", descripcion: null, estado: AgentStatus.ACTIVE, configuracionId: null, definition: {}, settings: {}, capabilities: [], createdAt: now, updatedAt: now } as any);

    const aAgents = await repo.findByEmpresa(empresaA.id);
    expect(aAgents.some((a) => a.id === "agent-test-5")).toBe(true);
    expect(aAgents.some((a) => a.id === "agent-test-6")).toBe(false);
  });
});
