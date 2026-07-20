import type { WorkflowDefinitionProps } from "../workflow-definition";
import type { WorkflowExecutionProps } from "../workflow-execution";

export interface WorkflowRepository {
  // definitions
  createDefinition(def: WorkflowDefinitionProps): Promise<WorkflowDefinitionProps>;
  findDefinitionById(id: string): Promise<WorkflowDefinitionProps | null>;
  // executions
  createExecution(exec: WorkflowExecutionProps): Promise<WorkflowExecutionProps>;
  updateExecution(id: string, patch: Partial<WorkflowExecutionProps>): Promise<WorkflowExecutionProps | null>;
  findExecutionById(id: string): Promise<WorkflowExecutionProps | null>;
  // step executions (history)
  createStepExecution(stepExec: import("../workflow-step-execution").WorkflowStepExecutionProps): Promise<import("../workflow-step-execution").WorkflowStepExecutionProps>;
  updateStepExecution(id: string, patch: Partial<import("../workflow-step-execution").WorkflowStepExecutionProps>): Promise<import("../workflow-step-execution").WorkflowStepExecutionProps | null>;
  findStepExecutionsByExecution(executionId: string): Promise<import("../workflow-step-execution").WorkflowStepExecutionProps[]>;
}
