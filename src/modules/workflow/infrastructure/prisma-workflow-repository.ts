import type { WorkflowRepository } from "../domain/repositories/workflow-repository";
import type { WorkflowDefinitionProps } from "../domain/workflow-definition";
import type { WorkflowExecutionProps } from "../domain/workflow-execution";
import { prisma } from "../../../shared/database/prisma";

function mapPrismaDefinitionToDomain(r: any): WorkflowDefinitionProps {
  return {
    id: r.id,
    empresaId: r.empresaId,
    name: r.name,
    description: r.description,
    steps: r.steps as any,
    version: r.version ? Number(r.version) : undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function mapDomainDefinitionToPrisma(d: WorkflowDefinitionProps) {
  return {
    id: d.id,
    empresaId: d.empresaId,
    name: d.name,
    description: d.description,
    steps: d.steps as any,
    version: d.version ? String(d.version) : "1",
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

function mapPrismaExecutionToDomain(r: any): WorkflowExecutionProps {
  return {
    id: r.id,
    empresaId: r.empresaId,
    workflowDefinitionId: r.workflowDefinitionId,
    currentStepIndex: r.currentStepIndex,
    status: r.status,
    input: r.input ?? null,
    output: r.output ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export class PrismaWorkflowRepository implements WorkflowRepository {
  async createDefinition(def: WorkflowDefinitionProps): Promise<WorkflowDefinitionProps> {
    const data = mapDomainDefinitionToPrisma(def);
    const created = await prisma.workflowDefinition.create({ data });
    return mapPrismaDefinitionToDomain(created);
  }

  async findDefinitionById(id: string): Promise<WorkflowDefinitionProps | null> {
    const r = await prisma.workflowDefinition.findUnique({ where: { id } });
    if (!r) return null;
    return mapPrismaDefinitionToDomain(r);
  }

  async createExecution(exec: WorkflowExecutionProps): Promise<WorkflowExecutionProps> {
    const created = await prisma.workflowExecution.create({ data: {
      id: exec.id,
      empresaId: exec.empresaId,
      workflowDefinitionId: exec.workflowDefinitionId,
      workflowVersion: "1",
      correlationId: undefined,
      currentStepIndex: exec.currentStepIndex,
      status: exec.status,
      input: (exec.input as any) ?? undefined,
      output: (exec.output as any) ?? undefined,
    } });
    return mapPrismaExecutionToDomain(created);
  }

  async updateExecution(id: string, patch: Partial<WorkflowExecutionProps>): Promise<WorkflowExecutionProps | null> {
    const data: any = { ...patch };
    // ensure Dates are not passed directly for createdAt/updatedAt
    delete data.id;
    try {
      const updated = await prisma.workflowExecution.update({ where: { id }, data });
      return mapPrismaExecutionToDomain(updated);
    } catch (err) {
      return null;
    }
  }

  async findExecutionById(id: string): Promise<WorkflowExecutionProps | null> {
    const r = await prisma.workflowExecution.findUnique({ where: { id } });
    if (!r) return null;
    return mapPrismaExecutionToDomain(r);
  }

  async createStepExecution(stepExec: import("../domain/workflow-step-execution").WorkflowStepExecutionProps): Promise<import("../domain/workflow-step-execution").WorkflowStepExecutionProps> {
    const created = await prisma.workflowStepExecution.create({ data: {
      id: stepExec.id,
      empresaId: stepExec.empresaId,
      executionId: stepExec.executionId,
      stepId: stepExec.stepId,
      startedAt: stepExec.startedAt,
      endedAt: stepExec.endedAt ?? undefined,
      status: stepExec.status,
      input: (stepExec.input as any) ?? undefined,
      output: (stepExec.output as any) ?? undefined,
      retries: stepExec.retries ?? 0,
    } });
    return {
      id: created.id,
      empresaId: created.empresaId,
      executionId: created.executionId,
      stepId: created.stepId,
      startedAt: created.startedAt,
      endedAt: created.endedAt ?? null,
      status: created.status as any,
      input: created.input ?? null,
      output: created.output ?? null,
      retries: created.retries,
    } as any;
  }

  async updateStepExecution(id: string, patch: Partial<import("../domain/workflow-step-execution").WorkflowStepExecutionProps>): Promise<import("../domain/workflow-step-execution").WorkflowStepExecutionProps | null> {
    try {
      const data: any = { ...patch };
      delete data.id;
      const updated = await prisma.workflowStepExecution.update({ where: { id }, data });
      return {
        id: updated.id,
        empresaId: updated.empresaId,
        executionId: updated.executionId,
        stepId: updated.stepId,
        startedAt: updated.startedAt,
        endedAt: updated.endedAt ?? null,
        status: updated.status as any,
        input: updated.input ?? null,
        output: updated.output ?? null,
        retries: updated.retries,
      } as any;
    } catch (err) {
      return null;
    }
  }

  async findStepExecutionsByExecution(executionId: string): Promise<import("../domain/workflow-step-execution").WorkflowStepExecutionProps[]> {
    const rows = await prisma.workflowStepExecution.findMany({ where: { executionId } });
    return rows.map((r) => ({ id: r.id, empresaId: r.empresaId, executionId: r.executionId, stepId: r.stepId, startedAt: r.startedAt, endedAt: r.endedAt ?? null, status: r.status as any, input: r.input ?? null, output: r.output ?? null, retries: r.retries } as any));
  }
}
