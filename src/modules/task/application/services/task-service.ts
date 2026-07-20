import type { CreateTaskDTO } from "../dtos/create-task-dto";
import type { TenantContext } from "../../../../shared/context/tenant-context";
import type { TaskProps } from "../../domain/task";

export interface TaskService {
  create(context: TenantContext, dto: CreateTaskDTO): Promise<TaskProps>;
  assign(context: TenantContext, taskId: string, actorId: string): Promise<TaskProps>;
  start(context: TenantContext, taskId: string): Promise<TaskProps>;
  complete(context: TenantContext, taskId: string, result?: Record<string, unknown>): Promise<TaskProps>;
  fail(context: TenantContext, taskId: string, error?: Record<string, unknown>): Promise<TaskProps>;
  cancel(context: TenantContext, taskId: string, reason?: string): Promise<TaskProps>;
  findById(context: TenantContext, taskId: string): Promise<TaskProps | null>;
  findByEmpresa(context: TenantContext): Promise<TaskProps[]>;
}
