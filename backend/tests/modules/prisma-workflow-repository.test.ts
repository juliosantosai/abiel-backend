import { beforeAll, afterEach, describe, expect, it } from "vitest";
import { PrismaWorkflowRepository } from "../../src/modules/workflow/infrastructure/prisma-workflow-repository";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

describe("PrismaWorkflowRepository", () => {
  const repo = new PrismaWorkflowRepository();

  beforeAll(() => {
    ensurePrismaSchema();
  });

  afterEach(async () => {
    await prisma.workflowStepExecution.deleteMany({ where: { id: { startsWith: "wse-test-" } } }).catch(() => {});
    await prisma.workflowExecution.deleteMany({ where: { id: { startsWith: "we-test-" } } }).catch(() => {});
    await prisma.workflowDefinition.deleteMany({ where: { id: { startsWith: "wd-test-" } } }).catch(() => {});
    await prisma.empresa.deleteMany({ where: { id: { startsWith: "empresa-wf-test-" } } }).catch(() => {});
  });

  it("creates and retrieves a definition within tenant scope", async () => {
    const empresa = await prisma.empresa.create({ data: { id: "empresa-wf-test-1", nombre: "E1", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });

    const now = new Date();
    const def = await repo.createDefinition({ id: "wd-test-1", empresaId: empresa.id, name: "WF D1", description: null, steps: [{ id: "s1", type: "AUTOMATIC" } as any], version: 1 as any, createdAt: now, updatedAt: now } as any);

    expect(def.id).toBe("wd-test-1");

    const found = await repo.findDefinitionById(def.id);
    expect(found).not.toBeNull();
    expect(found?.empresaId).toBe(empresa.id);
  });

  it("creates execution and enforces tenant isolation on find", async () => {
    const empresaA = await prisma.empresa.create({ data: { id: "empresa-wf-test-a", nombre: "A", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    const empresaB = await prisma.empresa.create({ data: { id: "empresa-wf-test-b", nombre: "B", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });

    const now = new Date();
    await repo.createDefinition({ id: "wd-test-tenant-1", empresaId: empresaA.id, name: "WF D T", description: null, steps: [{ id: "s1", type: "AUTOMATIC" } as any], version: 1 as any, createdAt: now, updatedAt: now } as any);

    const execObj = { id: "we-test-1", empresaId: empresaA.id, workflowDefinitionId: "wd-test-tenant-1", currentStepIndex: 0, status: "CREATED", input: null, output: null, createdAt: now, updatedAt: now } as any;
    const created = await repo.createExecution(execObj);
    expect(created.id).toBe("we-test-1");

    const found = await repo.findExecutionById("we-test-1");
    expect(found).not.toBeNull();

    // ensure other tenant cannot read it by direct prisma call
    const other = await prisma.workflowExecution.findUnique({ where: { id: created.id } });
    expect(other?.empresaId).toBe(empresaA.id);
  });

  it("updates execution status", async () => {
    const empresa = await prisma.empresa.create({ data: { id: "empresa-wf-test-2", nombre: "E2", plan: "starter", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    const now = new Date();
    await repo.createDefinition({ id: "wd-test-2", empresaId: empresa.id, name: "WF D2", description: null, steps: [{ id: "s1", type: "AUTOMATIC" } as any], version: 1 as any, createdAt: now, updatedAt: now } as any);
    const execObj = { id: "we-test-2", empresaId: empresa.id, workflowDefinitionId: "wd-test-2", currentStepIndex: 0, status: "CREATED", input: null, output: null, createdAt: now, updatedAt: now } as any;
    await repo.createExecution(execObj);

    const updated = await repo.updateExecution("we-test-2", { status: "RUNNING", currentStepIndex: 1 } as any);
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe("RUNNING");
    expect(updated?.currentStepIndex).toBe(1);
  });
});
