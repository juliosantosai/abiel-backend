import type { WorkflowService } from "./workflow-service";
import type { WorkflowRepository } from "../domain/repositories/workflow-repository";
import type { EventBus } from "../../../shared/events/event-bus";
import { WorkflowDefinition } from "../domain/workflow-definition";
import { WorkflowExecution } from "../domain/workflow-execution";
import { WorkflowStepExecution } from "../domain/workflow-step-execution";
import { generateUuid } from "../../../shared/utils/uuid";
import type { TenantContext } from "../../../shared/context/tenant-context";
import { createDomainEvent } from "../../../shared/events/domain-event";
import type { DomainEvent } from "../../../shared/events/domain-event";

export class WorkflowServiceImpl implements WorkflowService {
  constructor(private readonly repository: WorkflowRepository, private readonly eventBus: EventBus) {}

  async createDefinition(context: TenantContext, def: any) {
    const now = new Date();
    const defObj = WorkflowDefinition.create({ ...def, empresaId: context.empresaId, createdAt: now, updatedAt: now } as any);
    const persisted = await this.repository.createDefinition(defObj.toJSON());
    return persisted;
  }

  async startExecution(context: TenantContext, workflowDefinitionId: string, input?: Record<string, unknown>, correlationId?: string) {
    const def = await this.repository.findDefinitionById(workflowDefinitionId);
    if (!def) throw new Error("Workflow definition not found");
    // Enforce tenant isolation: definition must belong to the caller's empresa
    if (def.empresaId !== context.empresaId) {
      throw new Error("Workflow definition not found for this tenant");
    }

    const execution = WorkflowExecution.create({ id: `${workflowDefinitionId}-${Date.now()}`, empresaId: context.empresaId, workflowDefinitionId, correlationId: correlationId ?? null, input: input ?? null, output: null });

    const persisted = await this.repository.createExecution(execution.toJSON());

    // publish execution started
    const started = createDomainEvent({ eventId: `WorkflowExecutionStarted-${persisted.id}-${Date.now()}`, occurredAt: new Date(), eventName: "WorkflowExecutionStarted", aggregateId: persisted.id, payload: { executionId: persisted.id, workflowDefinitionId }, metadata: { tenantId: context.empresaId } });
    await this.eventBus.publish(started);

    // execute first step
    await this.executeNextStep(persisted, def);

    return persisted;
  }

  private async executeNextStep(execution: any, def: any) {
    const steps = def.steps ?? [];
    const idx = execution.currentStepIndex ?? 0;
    if (idx >= steps.length) {
      // complete execution
      await this.repository.updateExecution(execution.id, { status: "COMPLETED", updatedAt: new Date() });
      const ev = createDomainEvent({ eventId: `WorkflowExecutionCompleted-${execution.id}-${Date.now()}`, occurredAt: new Date(), eventName: "WorkflowExecutionCompleted", aggregateId: execution.id, payload: { executionId: execution.id }, metadata: { tenantId: execution.empresaId } });
      await this.eventBus.publish(ev);
      return;
    }

    const step = steps[idx];

    // create a step execution record
    const stepExecId = generateUuid();
    const stepExec = WorkflowStepExecution.create({ id: stepExecId, empresaId: execution.empresaId, executionId: execution.id, stepId: step.id, status: step.type === "AUTOMATIC" ? "RUNNING" : (step.type === "HUMAN" ? "WAITING" : "RUNNING"), input: step.metadata ?? null } as any);
    await this.repository.createStepExecution(stepExec.toJSON());

    if (step.type === "HUMAN" || step.expectsTask) {
      // Ask Task Core to create a task via event
      await this.repository.updateExecution(execution.id, { status: "WAITING" });
      const ev = createDomainEvent({ eventId: `TaskCreateRequested-${execution.id}-${step.id}-${Date.now()}`, occurredAt: new Date(), eventName: "TaskCreateRequested", aggregateId: execution.id, payload: { executionId: execution.id, workflowStepId: step.id, stepInput: step.metadata ?? {}, title: step.name ?? "Task from workflow" }, metadata: { tenantId: execution.empresaId, correlationId: execution.id } });
      await this.eventBus.publish(ev);
      return;
    }

    if (step.type === "AGENT_CALL") {
      await this.repository.updateExecution(execution.id, { status: "WAITING" });
      const ev = createDomainEvent({ eventId: `AgentExecutionRequested-${execution.id}-${step.id}-${Date.now()}`, occurredAt: new Date(), eventName: "AgentExecutionRequested", aggregateId: execution.id, payload: { executionId: execution.id, workflowStepId: step.id, input: step.metadata ?? {} }, metadata: { tenantId: execution.empresaId, correlationId: execution.id } });
      await this.eventBus.publish(ev);
      return;
    }

    // automatic step: advance immediately
    const advanced = await this.repository.updateExecution(execution.id, { currentStepIndex: execution.currentStepIndex + 1, status: "RUNNING", updatedAt: new Date() } as any);
    // publish step completed
    const ev = createDomainEvent({ eventId: `WorkflowStepCompleted-${execution.id}-${step.id}-${Date.now()}`, occurredAt: new Date(), eventName: "WorkflowStepCompleted", aggregateId: execution.id, payload: { executionId: execution.id, workflowStepId: step.id }, metadata: { tenantId: execution.empresaId } });
    await this.eventBus.publish(ev);

    // mark step execution completed
    const stepExecs = await this.repository.findStepExecutionsByExecution(execution.id);
    const currentStepExec = stepExecs.find((s) => s.stepId === step.id && s.endedAt == null) as any;
    if (currentStepExec) {
      await this.repository.updateStepExecution(currentStepExec.id, { status: "COMPLETED", endedAt: new Date() } as any);
    }

    // recurse
    await this.executeNextStep(advanced, def);
  }

  async handleEvent(event: DomainEvent) {
    // handle TaskCompleted or AgentExecutionCompleted to continue workflow
    const wfExecutionId = (event.payload as any)?.workflowExecutionId ?? (event.metadata as any)?.workflowExecutionId ?? (event.payload as any)?.executionId ?? (event.metadata as any)?.correlationId;
    if (!wfExecutionId) return;

    const exec = await this.repository.findExecutionById(wfExecutionId);
    if (!exec) return;

    // Ensure the event belongs to the same tenant as the execution
    const tenantFromEvent = (event.metadata as any)?.tenantId;
    if (tenantFromEvent && exec.empresaId !== tenantFromEvent) return;

    // Only react to TaskCompleted or AgentExecutionCompleted events
    if (event.eventName !== "TaskCompleted" && event.eventName !== "AgentExecutionCompleted") return;

    const def = await this.repository.findDefinitionById(exec.workflowDefinitionId);
    if (!def) return;

    // Mark current step execution as completed
    const stepExecs = await this.repository.findStepExecutionsByExecution(exec.id);
    // find the non-completed step exec for the current step
    const currentStep = def.steps[exec.currentStepIndex];
    const currentStepExec = stepExecs.find((s) => s.stepId === currentStep.id && s.endedAt == null) as any;
    if (currentStepExec) {
      await this.repository.updateStepExecution(currentStepExec.id, { status: "COMPLETED", endedAt: new Date(), output: (event.payload as any)?.result ?? null } as any);
    }

    // advance execution and continue
    const updated = await this.repository.updateExecution(exec.id, { currentStepIndex: exec.currentStepIndex + 1, status: "RUNNING" } as any);
    await this.executeNextStep(updated, def);
  }
}
