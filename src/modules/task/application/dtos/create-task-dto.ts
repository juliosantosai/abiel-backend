export type CreateTaskDTO = {
  id: string;
  empresaId: string;
  title: string;
  description?: string;
  type: "HUMAN" | "AUTOMATED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  input?: Record<string, unknown>;
  workflowExecutionId?: string;
  workflowStepId?: string;
  metadata?: Record<string, unknown>;
};
