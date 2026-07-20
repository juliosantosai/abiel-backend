import { describe, it, expect } from 'vitest';
import { ProvisioningServiceImpl } from '../../../src/modules/provisioning/application/provisioning-service-impl';

describe('ProvisioningServiceImpl (unit)', () => {
  it('provisions agents, workflows and tasks from blueprint', async () => {
    const createdAgents: any[] = [];
    const createdWorkflows: any[] = [];
    const createdTasks: any[] = [];
    const agentRepo = { create: async (a:any) => { createdAgents.push(a); } } as any;
    const workflowRepo = { createDefinition: async (w:any) => { createdWorkflows.push(w); } } as any;
    const taskRepo = { create: async (t:any) => { createdTasks.push(t); } } as any;
    const empresaRepo = { update: async () => {} } as any;

    const service = new ProvisioningServiceImpl(agentRepo, workflowRepo, taskRepo, empresaRepo);
    const ctx = { empresaId: 'e1' } as any;
    const blueprint = {
      agents: [{ id: 'a1', name: 'Agent One' }],
      workflows: [{ id: 'w1', name: 'WF1', steps: [] }],
      tasks: [{ id: 't1', title: 'Task 1' }],
    };

    const res = await service.provisionFromBlueprint(ctx, blueprint as any);
    expect(res.empresaId).toBe('e1');
    expect(res.agents.length).toBe(1);
    expect(res.workflows.length).toBe(1);
    expect(res.tasks.length).toBe(1);
    expect(createdAgents.length).toBe(1);
    expect(createdWorkflows.length).toBe(1);
    expect(createdTasks.length).toBe(1);
  });
});
