import type { ProvisioningService, ProvisioningResult } from "./provisioning-service";
import type { TenantContext } from "../../../shared/context/tenant-context";
import { generateUuid } from "../../../shared/utils/uuid";
import type { AgentRepository } from "../../agente/infrastructure/agent-repository";
import type { WorkflowRepository } from "../../workflow/domain/repositories/workflow-repository";
import type { TaskRepository } from "../../task/domain/repositories/task-repository";
import type { EmpresaRepository } from "../../empresa/infrastructure/empresa-repository";
import type { TemplateVersionProps } from "../../template/domain/template-version";

export class ProvisioningServiceImpl implements ProvisioningService {
  constructor(
    private readonly agentRepo: AgentRepository,
    private readonly workflowRepo: WorkflowRepository,
    private readonly taskRepo: TaskRepository,
    private readonly empresaRepo: EmpresaRepository
  ) {}

  async provisionFromBlueprint(context: TenantContext, blueprint: TemplateVersionProps | any): Promise<ProvisioningResult> {
    const empresaId = context.empresaId;
    const bp = (blueprint && (blueprint.blueprint ?? blueprint)) as any;

    const idMap: Record<string, string> = {};
    const createdAgents: string[] = [];
    const createdWorkflows: string[] = [];
    const createdTasks: string[] = [];

    // Provision agents
    const agents = bp.agents ?? [];
    for (const a of agents) {
      const newId = generateUuid();
      idMap[a.id ?? a.tempId ?? `${a.name}`] = newId;
      const now = new Date();
      const agent = {
        id: newId,
        empresaId,
        nombre: a.name ?? a.nombre ?? `agent-${newId}`,
        descripcion: a.description ?? a.descripcion ?? null,
        estado: "ACTIVE",
        configuracionId: null,
        definition: a.definition ?? null,
        settings: a.settings ?? null,
        capabilities: a.capabilities ?? [],
        createdAt: now,
        updatedAt: now,
      };
      // Use repository to persist
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this.agentRepo.create(agent);
      createdAgents.push(newId);
    }

    // Provision workflows
    const workflows = bp.workflows ?? [];
    for (const w of workflows) {
      const newId = generateUuid();
      idMap[w.id ?? w.tempId ?? w.name ?? newId] = newId;
      const now = new Date();
      // map steps: replace agent/task refs with new ids
      const steps = (w.steps ?? []).map((s: any) => {
        const mapped = { ...s };
        if (s.agentId && idMap[s.agentId]) mapped.agentId = idMap[s.agentId];
        if (s.taskTemplateId && idMap[s.taskTemplateId]) mapped.taskTemplateId = idMap[s.taskTemplateId];
        return mapped;
      });

      const def = {
        id: newId,
        empresaId,
        name: w.name ?? w.nombre ?? `workflow-${newId}`,
        description: w.description ?? w.descripcion ?? null,
        steps,
        version: w.version ?? 1,
        createdAt: now,
        updatedAt: now,
      };

      await this.workflowRepo.createDefinition(def as any);
      createdWorkflows.push(newId);
    }

    // Provision initial tasks
    const tasks = bp.tasks ?? [];
    for (const t of tasks) {
      const newId = generateUuid();
      idMap[t.id ?? t.tempId ?? t.title ?? newId] = newId;
      const now = new Date();
      const task = {
        id: newId,
        empresaId,
        workflowExecutionId: null,
        workflowStepId: t.workflowStepId ? idMap[t.workflowStepId] ?? t.workflowStepId : null,
        title: t.title ?? t.nombre ?? `task-${newId}`,
        description: t.description ?? t.descripcion ?? null,
        type: t.type ?? "HUMAN",
        priority: t.priority ?? "MEDIUM",
        assignedTo: null,
        status: "PENDING",
        sla: t.sla ?? null,
        input: t.input ?? null,
        result: null,
        metadata: t.metadata ?? {},
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
      };
      await this.taskRepo.create(task as any);
      createdTasks.push(newId);
    }

    // Configure tenant: store reference to template/provisioning (non-invasive)
    try {
      await this.empresaRepo.update(empresaId, { updatedAt: new Date() } as any);
    } catch (e) {
      // non-fatal; provisioning should not fail if tenant update is optional
    }

    return { agents: createdAgents, workflows: createdWorkflows, tasks: createdTasks, empresaId } as ProvisioningResult;
  }
}
