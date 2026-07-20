import type { WorkflowRepository } from "../domain/repositories/workflow-repository";
import type { WorkflowDefinitionProps } from "../domain/workflow-definition";
import type { WorkflowExecutionProps } from "../domain/workflow-execution";

export class InMemoryWorkflowRepository implements WorkflowRepository {
  private defs: Map<string, WorkflowDefinitionProps> = new Map();
  private execs: Map<string, WorkflowExecutionProps> = new Map();
  private stepExecs: Map<string, import("../domain/workflow-step-execution").WorkflowStepExecutionProps> = new Map();

  async createDefinition(def: WorkflowDefinitionProps): Promise<WorkflowDefinitionProps> {
    this.defs.set(def.id, def);
    return def;
  }

  async findDefinitionById(id: string): Promise<WorkflowDefinitionProps | null> {
    return this.defs.get(id) ?? null;
  }

  async createExecution(exec: WorkflowExecutionProps): Promise<WorkflowExecutionProps> {
    this.execs.set(exec.id, exec);
    return exec;
  }

  async updateExecution(id: string, patch: Partial<WorkflowExecutionProps>): Promise<WorkflowExecutionProps | null> {
    const existing = this.execs.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch, updatedAt: new Date() } as WorkflowExecutionProps;
    this.execs.set(id, updated);
    return updated;
  }

  async findExecutionById(id: string): Promise<WorkflowExecutionProps | null> {
    return this.execs.get(id) ?? null;
  }

  async createStepExecution(stepExec: import("../domain/workflow-step-execution").WorkflowStepExecutionProps): Promise<import("../domain/workflow-step-execution").WorkflowStepExecutionProps> {
    this.stepExecs.set(stepExec.id, stepExec);
    return stepExec;
  }

  async updateStepExecution(id: string, patch: Partial<import("../domain/workflow-step-execution").WorkflowStepExecutionProps>): Promise<import("../domain/workflow-step-execution").WorkflowStepExecutionProps | null> {
    const existing = this.stepExecs.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch } as import("../domain/workflow-step-execution").WorkflowStepExecutionProps;
    this.stepExecs.set(id, updated);
    return updated;
  }

  async findStepExecutionsByExecution(executionId: string): Promise<import("../domain/workflow-step-execution").WorkflowStepExecutionProps[]> {
    return Array.from(this.stepExecs.values()).filter((s) => s.executionId === executionId);
  }
}
