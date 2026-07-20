import type { TaskProps } from "../domain/task";
import type { TaskRepository } from "../domain/repositories/task-repository";

export class InMemoryTaskRepository implements TaskRepository {
  private readonly store: Map<string, TaskProps> = new Map();

  async findById(id: string, empresaId: string): Promise<TaskProps | null> {
    const t = this.store.get(id);
    if (!t) return null;
    return t.empresaId === empresaId ? t : null;
  }

  async findAllByEmpresa(empresaId: string): Promise<TaskProps[]> {
    return Array.from(this.store.values()).filter((t) => t.empresaId === empresaId);
  }

  async findByWorkflowExecutionId(workflowExecutionId: string): Promise<TaskProps[]> {
    return Array.from(this.store.values()).filter((t) => t.workflowExecutionId === workflowExecutionId);
  }

  async create(task: TaskProps): Promise<TaskProps> {
    this.store.set(task.id, task);
    return task;
  }

  async update(id: string, patch: Partial<TaskProps>): Promise<TaskProps | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: TaskProps = { ...existing, ...patch, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
