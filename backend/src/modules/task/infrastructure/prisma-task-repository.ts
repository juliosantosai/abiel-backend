import { prisma } from "../../../shared/database/prisma";
import type { TaskProps } from "../domain/task";
import type { TaskRepository } from "../domain/repositories/task-repository";

function mapPrismaToDomain(p: any): TaskProps {
  return {
    id: p.id,
    empresaId: p.empresaId,
    workflowExecutionId: p.workflowExecutionId ?? null,
    workflowStepId: p.workflowStepId ?? null,
    title: p.title,
    description: p.description ?? null,
    type: p.type,
    priority: p.priority,
    assignedTo: p.assignedTo ?? null,
    status: p.status,
    sla: p.sla ?? null,
    input: p.input ?? null,
    result: p.result ?? null,
    metadata: p.metadata ?? {},
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    resolvedAt: p.resolvedAt ?? null,
  } as TaskProps;
}

function mapDomainToPrisma(t: TaskProps | Partial<TaskProps>) {
  // Prisma expects JSON fields as plain JS objects or null
  return {
    ...t,
    sla: (t as any).sla ?? null,
    input: (t as any).input ?? null,
    result: (t as any).result ?? null,
    metadata: (t as any).metadata ?? null,
  } as any;
}

export class PrismaTaskRepository implements TaskRepository {
  async findById(id: string, empresaId: string): Promise<TaskProps | null> {
    const p = await prisma.task.findFirst({ where: { id, empresaId } });
    if (!p) return null;
    return mapPrismaToDomain(p);
  }

  async findAllByEmpresa(empresaId: string): Promise<TaskProps[]> {
    const list = await prisma.task.findMany({ where: { empresaId } });
    return list.map(mapPrismaToDomain);
  }

  async findByWorkflowExecutionId(workflowExecutionId: string): Promise<TaskProps[]> {
    const list = await prisma.task.findMany({ where: { workflowExecutionId } });
    return list.map(mapPrismaToDomain);
  }

  async create(task: TaskProps): Promise<TaskProps> {
    const data = mapDomainToPrisma(task);
    const p = await prisma.task.create({ data });
    return mapPrismaToDomain(p);
  }

  async update(id: string, patch: Partial<TaskProps>): Promise<TaskProps | null> {
    const data = mapDomainToPrisma(patch as Partial<TaskProps>);
    const p = await prisma.task.update({ where: { id }, data });
    return mapPrismaToDomain(p);
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }
}
