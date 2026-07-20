import type { TaskProps } from "../task";

export interface TaskRepository {
  findById(id: string, empresaId: string): Promise<TaskProps | null>;
  findAllByEmpresa(empresaId: string): Promise<TaskProps[]>;
  findByWorkflowExecutionId(workflowExecutionId: string): Promise<TaskProps[]>;
  create(task: TaskProps): Promise<TaskProps>;
  update(id: string, patch: Partial<TaskProps>): Promise<TaskProps | null>;
  delete(id: string): Promise<void>;
}
