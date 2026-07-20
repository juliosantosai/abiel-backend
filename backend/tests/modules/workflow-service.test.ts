import { describe, it, expect } from "vitest";
import { WorkflowServiceImpl } from "../../src/modules/workflow/application/workflow-service-impl";
import { InMemoryWorkflowRepository } from "../../src/modules/workflow/infrastructure/in-memory-workflow-repository";
import { InMemoryEventBus } from "../../src/shared/events/in-memory-event-bus";
import { createTestTenantContext } from "../helpers/test-fixtures";

describe("WorkflowServiceImpl", () => {
  it("starts execution and emits TaskCreateRequested for HUMAN step", async () => {
    const repo = new InMemoryWorkflowRepository();
    const eventBus = new InMemoryEventBus();
    const svc = new WorkflowServiceImpl(repo, eventBus as any);
    const ctx = createTestTenantContext();

    const def = {
      id: "wf-1",
      empresaId: ctx.empresaId,
      name: "WF Test",
      description: null,
      steps: [{ id: "s1", name: "step1", type: "HUMAN", expectsTask: true }],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repo.createDefinition(def as any);

    const events: string[] = [];
    eventBus.subscribe("TaskCreateRequested", {
      handle: async (e: any) => {
        events.push(e.eventName);
      },
    } as any);

    await svc.startExecution(ctx, def.id, { foo: "bar" });

    expect(events).toContain("TaskCreateRequested");
  });
});
