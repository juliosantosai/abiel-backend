export type WorkflowExecutionStatus = "CREATED" | "RUNNING" | "WAITING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type WorkflowExecutionProps = {
  id: string;
  empresaId: string;
  workflowDefinitionId: string;
  correlationId?: string | null;
  currentStepIndex: number;
  status: WorkflowExecutionStatus;
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

export class WorkflowExecution {
  constructor(private readonly props: WorkflowExecutionProps) {}

  toJSON(): WorkflowExecutionProps {
    return { ...this.props };
  }

  static create(props: Omit<WorkflowExecutionProps, "createdAt" | "updatedAt" | "status" | "currentStepIndex">) {
    const now = new Date();
    return new WorkflowExecution({ ...props, currentStepIndex: 0, status: "CREATED", createdAt: now, updatedAt: now });
  }

  advanceStep(): WorkflowExecution {
    const nextIndex = this.props.currentStepIndex + 1;
    return new WorkflowExecution({ ...this.props, currentStepIndex: nextIndex, updatedAt: new Date() });
  }

  setStatus(status: WorkflowExecutionStatus): WorkflowExecution {
    return new WorkflowExecution({ ...this.props, status, updatedAt: new Date() });
  }
}
