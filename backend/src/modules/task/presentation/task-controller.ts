import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { TaskService } from "../application/services/task-service";
import type { TenantContext } from "../../../shared/context/tenant-context";

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  async createTask(request: FastifyRequest<{ Body: { title: string; description?: string; type?: "HUMAN" | "AUTOMATED"; priority?: "LOW" | "MEDIUM" | "HIGH"; input?: Record<string, unknown> } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const dto = request.body;
    const created = await this.taskService.create(context, { ...dto } as any);
    return reply.status(201).send(created);
  }

  async listTasks(_request: FastifyRequest, reply: FastifyReply) {
    const context = (_request as any).tenantContext as TenantContext;
    const tasks = await this.taskService.findByEmpresa(context);
    return reply.send(tasks);
  }

  async getTask(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const found = await this.taskService.findById(context, request.params.id);
    if (!found) return reply.status(404).send({ error: true, message: "Task not found" });
    return reply.send(found);
  }

  async patchStatus(request: FastifyRequest<{ Params: { id: string }; Body: { action: string; result?: Record<string, unknown>; reason?: string } }>, reply: FastifyReply) {
    const context = (request as any).tenantContext as TenantContext;
    const { action, result, reason } = request.body;
    const id = request.params.id;

    let updated;
    switch (action) {
      case "start":
        updated = await this.taskService.start(context, id);
        break;
      case "complete":
        updated = await this.taskService.complete(context, id, result ?? undefined);
        break;
      case "fail":
        updated = await this.taskService.fail(context, id, result ?? undefined);
        break;
      case "cancel":
        updated = await this.taskService.cancel(context, id, reason ?? undefined);
        break;
      default:
        return reply.status(400).send({ error: true, message: "Invalid action" });
    }

    return reply.send(updated);
  }
}

export function registerTaskRoutes(app: FastifyInstance, taskService: TaskService) {
  const controller = new TaskController(taskService);

  app.post("/tasks", controller.createTask.bind(controller));
  app.get("/tasks", controller.listTasks.bind(controller));
  app.get("/tasks/:id", controller.getTask.bind(controller));
  app.patch("/tasks/:id/status", controller.patchStatus.bind(controller));
}
