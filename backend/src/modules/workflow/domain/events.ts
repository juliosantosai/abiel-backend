export type WorkflowEvents =
  | "WorkflowExecutionStarted"
  | "WorkflowStepWaiting"
  | "WorkflowStepCompleted"
  | "WorkflowExecutionCompleted"
  | "TaskCreateRequested"
  | "AgentExecutionRequested";
