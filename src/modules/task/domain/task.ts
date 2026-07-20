import { createDomainEvent } from "../../../shared/events/domain-event";

export type TaskStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "WAITING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type TaskProps = {
  id: string;
  empresaId: string;
  workflowExecutionId?: string | null;
  workflowStepId?: string | null;
  title: string;
  description?: string | null;
  type: "HUMAN" | "AUTOMATED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignedTo?: string | null;
  status: TaskStatus;
  sla?: { dueAt?: Date | null; escalationPolicy?: Record<string, unknown> } | null;
  input?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
};

export class Task {
  public readonly id: string;
  public readonly empresaId: string;
  public readonly workflowExecutionId?: string | null;
  public readonly workflowStepId?: string | null;
  private _title: string;
  private _description?: string | null;
  public readonly type: "HUMAN" | "AUTOMATED";
  public readonly priority: "LOW" | "MEDIUM" | "HIGH";
  private _assignedTo?: string | null;
  private _status: TaskStatus;
  private _sla?: { dueAt?: Date | null; escalationPolicy?: Record<string, unknown> } | null;
  private _input?: Readonly<Record<string, unknown>> | null;
  private _result?: Readonly<Record<string, unknown>> | null;
  private _metadata: Readonly<Record<string, unknown>>;
  public readonly createdAt: Date;
  private _updatedAt: Date;
  private _resolvedAt?: Date | null;

  private constructor(props: TaskProps) {
    this.id = props.id;
    this.empresaId = props.empresaId;
    this.workflowExecutionId = props.workflowExecutionId ?? null;
    this.workflowStepId = props.workflowStepId ?? null;
    this._title = props.title;
    this._description = props.description ?? null;
    this.type = props.type;
    this.priority = props.priority;
    this._assignedTo = props.assignedTo ?? null;
    this._status = props.status;
    this._sla = props.sla ?? null;
    this._input = props.input ? Object.freeze({ ...props.input }) : null;
    this._result = props.result ? Object.freeze({ ...props.result }) : null;
    this._metadata = props.metadata ? Object.freeze({ ...props.metadata }) : Object.freeze({});
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._resolvedAt = props.resolvedAt ?? null;
  }

  public static create(props: Omit<TaskProps, "status" | "createdAt" | "updatedAt">): Task {
    const now = new Date();
    return new Task({ ...props, status: "PENDING", createdAt: now, updatedAt: now });
  }

  public assignTo(actorId: string): Task {
    if (!actorId || actorId.trim() === "") throw new Error("assignedTo es obligatorio");
    return new Task({ ...this.toJSON(), assignedTo: actorId, status: "ASSIGNED", updatedAt: new Date() });
  }

  public start(): Task {
    if (this._status === "COMPLETED" || this._status === "CANCELLED") throw new Error("No se puede iniciar una task finalizada");
    return new Task({ ...this.toJSON(), status: "IN_PROGRESS", updatedAt: new Date() });
  }

  public wait(): Task {
    return new Task({ ...this.toJSON(), status: "WAITING", updatedAt: new Date() });
  }

  public complete(result?: Record<string, unknown> | null): Task {
    const now = new Date();
    return new Task({ ...this.toJSON(), status: "COMPLETED", result: result ?? null, resolvedAt: now, updatedAt: now });
  }

  public fail(error?: Record<string, unknown> | null): Task {
    const now = new Date();
    const metadata = { ...(this._metadata ?? {}), lastError: error ?? null } as Record<string, unknown>;
    return new Task({ ...this.toJSON(), status: "FAILED", metadata, updatedAt: now, resolvedAt: now });
  }

  public cancel(reason?: string): Task {
    const now = new Date();
    const metadata = { ...(this._metadata ?? {}), cancelReason: reason ?? null } as Record<string, unknown>;
    return new Task({ ...this.toJSON(), status: "CANCELLED", metadata, updatedAt: now, resolvedAt: now });
  }

  public toJSON(): TaskProps {
    return {
      id: this.id,
      empresaId: this.empresaId,
      workflowExecutionId: this.workflowExecutionId ?? null,
      workflowStepId: this.workflowStepId ?? null,
      title: this._title,
      description: this._description ?? null,
      type: this.type,
      priority: this.priority,
      assignedTo: this._assignedTo ?? null,
      status: this._status,
      sla: this._sla ?? null,
      input: this._input ?? null,
      result: this._result ?? null,
      metadata: this._metadata ?? {},
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
      resolvedAt: this._resolvedAt ?? null,
    };
  }

  public createDomainEvent(eventName: string, payload: Record<string, unknown> = {}, metadata: Record<string, unknown> = {}) {
    return createDomainEvent({
      eventId: `${eventName}-${this.id}-${Date.now()}`,
      occurredAt: new Date(),
      eventName,
      aggregateId: this.id,
      metadata: { tenantId: this.empresaId, ...metadata },
      payload,
    });
  }

  public static fromJSON(props: TaskProps): Task {
    return new Task(props);
  }
}
