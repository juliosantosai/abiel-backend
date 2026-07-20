export type WorkflowStepType = "AUTOMATIC" | "HUMAN" | "EXTERNAL_EVENT" | "AGENT_CALL";

export type WorkflowStep = {
  id: string;
  name?: string;
  description?: string | null;
  type: WorkflowStepType;
  expectsTask?: boolean;
  inputSchema?: unknown;
  outputSchema?: unknown;
  metadata?: Record<string, unknown>;
};
