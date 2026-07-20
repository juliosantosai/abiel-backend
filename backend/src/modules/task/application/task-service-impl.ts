import type { TaskService } from "./services/task-service";
import type { CreateTaskDTO } from "./dtos/create-task-dto";
import type { TaskRepository } from "../domain/repositories/task-repository";
import type { EventBus } from "../../../shared/events/event-bus";
import { Task } from "../domain/task";
import { generateUuid } from "../../../shared/utils/uuid";
import type { TenantContext } from "../../../shared/context/tenant-context";

export class TaskServiceImpl implements TaskService {
  constructor(private readonly repository: TaskRepository, private readonly eventBus: EventBus) {}

  async create(context: TenantContext, dto: CreateTaskDTO) {
    const id = generateUuid();
    const now = new Date();
    const task = Task.fromJSON({
      id,
      empresaId: context.empresaId,
      workflowExecutionId: dto.workflowExecutionId ?? null,
      workflowStepId: dto.workflowStepId ?? null,
      title: dto.title,
      description: dto.description ?? null,
      type: dto.type,
      priority: dto.priority ?? "MEDIUM",
      assignedTo: null,
      status: "PENDING",
      sla: null,
      input: dto.input ?? null,
      result: null,
      metadata: dto.metadata ?? {},
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    });

    const persisted = await this.repository.create(task.toJSON());

    const event = task.createDomainEvent("TaskCreated", { taskId: task.id, workflowExecutionId: task.workflowExecutionId ?? null, workflowStepId: task.workflowStepId ?? null, title: task.toJSON().title }, { correlationId: task.id });

    await this.eventBus.publish(event);

    return persisted;
  }

  async assign(context: TenantContext, taskId: string, actorId: string) {
    const found = await this.repository.findById(taskId, context.empresaId);
    if (!found) throw new Error("Task not found");
    const task = Task.fromJSON(found);
    const updated = task.assignTo(actorId);
    const persisted = await this.repository.update(taskId, updated.toJSON());
    const event = updated.createDomainEvent("TaskAssigned", { taskId, assignedTo: actorId });
    await this.eventBus.publish(event);
    return persisted as any;
  }

  async start(context: TenantContext, taskId: string) {
    const found = await this.repository.findById(taskId, context.empresaId);
    if (!found) throw new Error("Task not found");
    const task = Task.fromJSON(found);
    const updated = task.start();
    const persisted = await this.repository.update(taskId, updated.toJSON());
    const event = updated.createDomainEvent("TaskStarted", { taskId });
    await this.eventBus.publish(event);
    return persisted as any;
  }

  async complete(context: TenantContext, taskId: string, result?: Record<string, unknown>) {
    const found = await this.repository.findById(taskId, context.empresaId);
    if (!found) throw new Error("Task not found");
    const task = Task.fromJSON(found);
    const updated = task.complete(result ?? undefined);
    const persisted = await this.repository.update(taskId, updated.toJSON());
    const event = updated.createDomainEvent("TaskCompleted", { taskId, result: result ?? null });
    await this.eventBus.publish(event);
    return persisted as any;
  }

  async fail(context: TenantContext, taskId: string, error?: Record<string, unknown>) {
    const found = await this.repository.findById(taskId, context.empresaId);
    if (!found) throw new Error("Task not found");
    const task = Task.fromJSON(found);
    const updated = task.fail(error ?? undefined);
    const persisted = await this.repository.update(taskId, updated.toJSON());
    const event = updated.createDomainEvent("TaskFailed", { taskId, error: error ?? null });
    await this.eventBus.publish(event);
    return persisted as any;
  }

  async cancel(context: TenantContext, taskId: string, reason?: string) {
    const found = await this.repository.findById(taskId, context.empresaId);
    if (!found) throw new Error("Task not found");
    const task = Task.fromJSON(found);
    const updated = task.cancel(reason ?? undefined);
    const persisted = await this.repository.update(taskId, updated.toJSON());
    const event = updated.createDomainEvent("TaskCancelled", { taskId, reason: reason ?? null });
    await this.eventBus.publish(event);
    return persisted as any;
  }

  async findById(context: TenantContext, taskId: string) {
    return this.repository.findById(taskId, context.empresaId);
  }

  async findByEmpresa(context: TenantContext) {
    return this.repository.findAllByEmpresa(context.empresaId);
  }
}
