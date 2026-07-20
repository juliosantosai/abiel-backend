import { describe, it, expect } from "vitest";
import { ProvisioningServiceImpl } from "../../src/modules/provisioning/application/provisioning-service-impl";
import { InMemoryWorkflowRepository } from "../../src/modules/workflow/infrastructure/in-memory-workflow-repository";
import { InMemoryTaskRepository } from "../../src/modules/task/infrastructure/in-memory-task-repository";
import { createTestTenantContext } from "../helpers/test-fixtures";

class MockAgentRepo {
  public created: any[] = [];
  async create(agent: any) {
    this.created.push(agent);
    return agent;
  }
}

class MockEmpresaRepo {
  public updated: any[] = [];
  async update(id: string, empresa: any) {
    this.updated.push({ id, empresa });
    return { id, ...empresa };
  }
}

describe("ProvisioningServiceImpl", () => {
  it("provisions agents, workflows and tasks from blueprint and respects tenant", async () => {
    const agentRepo = new MockAgentRepo() as any;
    const workflowRepo = new InMemoryWorkflowRepository();
    const taskRepo = new InMemoryTaskRepository();
    const empresaRepo = new MockEmpresaRepo() as any;

    const svc = new ProvisioningServiceImpl(agentRepo, workflowRepo, taskRepo, empresaRepo);
    const ctx = createTestTenantContext();

    const blueprint = {
      agents: [{ id: "a-temp", name: "AgentX" }],
      workflows: [{ id: "w-temp", name: "WF-X", steps: [] }],
      tasks: [{ id: "t-temp", title: "Initial Task" }],
    };

    const res = await svc.provisionFromBlueprint(ctx, { blueprint });
    expect(res.empresaId).toBe(ctx.empresaId);
    expect(res.agents.length).toBe(1);
    expect(agentRepo.created.length).toBe(1);
    expect(res.workflows.length).toBe(1);
    expect(res.tasks.length).toBe(1);

    // verify tasks stored in repo belong to tenant
    const storedTasks = await taskRepo.findAllByEmpresa(ctx.empresaId);
    expect(storedTasks.length).toBe(1);
    expect(storedTasks[0].empresaId).toBe(ctx.empresaId);
  });
});
