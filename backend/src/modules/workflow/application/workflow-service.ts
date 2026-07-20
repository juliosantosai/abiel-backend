import type { WorkflowDefinitionProps } from "../domain/workflow-definition";
import type { WorkflowExecutionProps } from "../domain/workflow-execution";
import type { TenantContext } from "../../../shared/context/tenant-context";

export interface WorkflowService {
  createDefinition(context: TenantContext, def: Omit<WorkflowDefinitionProps, "empresaId" | "createdAt" | "updatedAt">): Promise<WorkflowDefinitionProps>;
  startExecution(context: TenantContext, workflowDefinitionId: string, input?: Record<string, unknown>, correlationId?: string): Promise<WorkflowExecutionProps>;
  handleEvent(event: any): Promise<void>;
}
