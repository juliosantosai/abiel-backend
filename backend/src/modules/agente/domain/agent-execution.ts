export type AgentExecutionStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export type AgentExecutionProps = {
  id: string;
  agentId: string;
  conversationId?: string | null;
  empresaId: string;
  status: AgentExecutionStatus;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  metadata?: Record<string, unknown>;
};

export class AgentExecution {
  public readonly id: string;
  public readonly agentId: string;
  public readonly conversationId?: string | null;
  public readonly empresaId: string;
  public readonly status: AgentExecutionStatus;
  public readonly startedAt?: Date | null;
  public readonly finishedAt?: Date | null;
  public readonly metadata?: Readonly<Record<string, unknown>>;

  private constructor(props: AgentExecutionProps) {
    this.id = props.id;
    this.agentId = props.agentId;
    this.conversationId = props.conversationId ?? null;
    this.empresaId = props.empresaId;
    this.status = props.status;
    this.startedAt = props.startedAt ?? null;
    this.finishedAt = props.finishedAt ?? null;
    this.metadata = props.metadata ? Object.freeze({ ...props.metadata }) : Object.freeze({});
  }

  public static createPending(props: Omit<AgentExecutionProps, "status" | "startedAt" | "finishedAt">): AgentExecution {
    return new AgentExecution({ ...props, status: "PENDING", startedAt: null, finishedAt: null });
  }

  public start(): AgentExecution {
    return new AgentExecution({ ...this.toJSON(), status: "RUNNING", startedAt: new Date(), finishedAt: null });
  }

  public complete(): AgentExecution {
    return new AgentExecution({ ...this.toJSON(), status: "COMPLETED", finishedAt: new Date() });
  }

  public fail(): AgentExecution {
    return new AgentExecution({ ...this.toJSON(), status: "FAILED", finishedAt: new Date() });
  }

  public toJSON(): AgentExecutionProps {
    return {
      id: this.id,
      agentId: this.agentId,
      conversationId: this.conversationId ?? null,
      empresaId: this.empresaId,
      status: this.status,
      startedAt: this.startedAt ?? null,
      finishedAt: this.finishedAt ?? null,
      metadata: this.metadata ?? {},
    };
  }
}
