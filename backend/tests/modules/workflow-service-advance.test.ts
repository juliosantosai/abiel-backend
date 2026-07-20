import { describe, it, expect } from "vitest";
import { WorkflowServiceImpl } from "../../src/modules/workflow/application/workflow-service-impl";
import { InMemoryWorkflowRepository } from "../../src/modules/workflow/infrastructure/in-memory-workflow-repository";
import { InMemoryEventBus } from "../../src/shared/events/in-memory-event-bus";
import { createTestTenantContext } from "../helpers/test-fixtures";
import { createDomainEvent } from "../../src/shared/events/domain-event";

describe("Workflow execution flows", () => {
  it("advances through automatic steps and completes workflow", async () => {
    const repo = new InMemoryWorkflowRepository();
    const eventBus = new InMemoryEventBus();
    const svc = new WorkflowServiceImpl(repo, eventBus as any);
    const ctx = createTestTenantContext();

    const def = {
      id: "wf-auto-1",
      empresaId: ctx.empresaId,
      name: "Auto WF",
      description: null,
      steps: [
        { id: "a1", name: "step1", type: "AUTOMATIC" },
        { id: "a2", name: "step2", type: "AUTOMATIC" },
      ],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repo.createDefinition(def as any);

    const events: string[] = [];
    eventBus.subscribe("WorkflowStepCompleted", { handle: async (e: any) => events.push(e.eventName) } as any);
    eventBus.subscribe("WorkflowExecutionCompleted", { handle: async (e: any) => events.push(e.eventName) } as any);

    const exec = await svc.startExecution(ctx, def.id);

    expect(events).toContain("WorkflowStepCompleted");
    expect(events).toContain("WorkflowExecutionCompleted");

    const persisted = await repo.findExecutionById(exec.id);
    expect(persisted).not.toBeNull();
    expect(persisted?.status).toBe("COMPLETED");

    const stepExecs = await repo.findStepExecutionsByExecution(exec.id);
    expect(stepExecs.length).toBeGreaterThanOrEqual(2);
    expect(stepExecs.every((s) => s.status === "COMPLETED")).toBe(true);
  });

  it("does not allow starting execution for another tenant (isolation)", async () => {
    const repo = new InMemoryWorkflowRepository();
    const eventBus = new InMemoryEventBus();
    const svc = new WorkflowServiceImpl(repo, eventBus as any);
    const ctx = createTestTenantContext();

    const otherTenant = createTestTenantContext();

    const def = {
      id: "wf-tenant-1",
      empresaId: otherTenant.empresaId,
      name: "Tenant WF",
      description: null,
      steps: [{ id: "s1", name: "step1", type: "AUTOMATIC" }],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repo.createDefinition(def as any);

    await expect(() => svc.startExecution(ctx, def.id)).rejects.toThrow();
  });

  it("continues execution after a TaskCompleted event", async () => {
    const repo = new InMemoryWorkflowRepository();
    const eventBus = new InMemoryEventBus();
    const svc = new WorkflowServiceImpl(repo, eventBus as any);
    const ctx = createTestTenantContext();

    const def = {
      id: "wf-human-1",
      empresaId: ctx.empresaId,
      name: "Human WF",
      description: null,
      steps: [
        { id: "h1", name: "human", type: "HUMAN", expectsTask: true },
        { id: "a1", name: "auto", type: "AUTOMATIC" },
      ],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repo.createDefinition(def as any);

    const completedEvents: string[] = [];
    eventBus.subscribe("WorkflowExecutionCompleted", { handle: async (e: any) => completedEvents.push(e.eventName) } as any);

    const exec = await svc.startExecution(ctx, def.id);

    // step execution should be created and waiting
    const stepExecsBefore = await repo.findStepExecutionsByExecution(exec.id);
    expect(stepExecsBefore.length).toBeGreaterThanOrEqual(1);
    expect(stepExecsBefore[0].status).toBe("WAITING");

    // simulate TaskCompleted event coming from Task module
    const taskCompleted = createDomainEvent({
      eventId: `TaskCompleted-${exec.id}-${Date.now()}`,
      occurredAt: new Date(),
      eventName: "TaskCompleted",
      aggregateId: exec.id,
      payload: { workflowExecutionId: exec.id },
      metadata: { tenantId: ctx.empresaId },
    });

    await svc.handleEvent(taskCompleted as any);

    expect(completedEvents).toContain("WorkflowExecutionCompleted");

    const persisted = await repo.findExecutionById(exec.id);
    expect(persisted?.status).toBe("COMPLETED");

    const stepExecsAfter = await repo.findStepExecutionsByExecution(exec.id);
    expect(stepExecsAfter.some((s) => s.status === "COMPLETED")).toBe(true);
  });
});
