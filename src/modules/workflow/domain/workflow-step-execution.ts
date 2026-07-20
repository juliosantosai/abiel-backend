export type WorkflowStepExecutionStatus = "PENDING" | "RUNNING" | "WAITING" | "COMPLETED" | "FAILED";

export type WorkflowStepExecutionProps = {
  id: string;
  empresaId: string;
  executionId: string;
  stepId: string;
  startedAt: Date;
  endedAt?: Date | null;
  status: WorkflowStepExecutionStatus;
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  retries?: number;
};

export class WorkflowStepExecution {
  constructor(private readonly props: WorkflowStepExecutionProps) {}

  toJSON(): WorkflowStepExecutionProps {
    return { ...this.props };
  }

  static create(props: Omit<WorkflowStepExecutionProps, "startedAt" | "retries" | "endedAt">) {
    return new WorkflowStepExecution({ ...props, startedAt: new Date(), retries: 0 });
  }

  complete(output?: Record<string, unknown> | null) {
    return new WorkflowStepExecution({ ...this.props, output: output ?? null, endedAt: new Date(), status: "COMPLETED" });
  }
}
