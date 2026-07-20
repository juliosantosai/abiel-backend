import type { DomainEventPayload } from "../../../shared/events/domain-event";

export type TaskCreatedPayload = {
  taskId: string;
  workflowExecutionId?: string | null;
  workflowStepId?: string | null;
  title: string;
};

export type TaskAssignedPayload = {
  taskId: string;
  assignedTo: string;
};

export type TaskCompletedPayload = {
  taskId: string;
  result?: Record<string, unknown> | null;
};

export type TaskFailedPayload = {
  taskId: string;
  error?: Record<string, unknown> | null;
};

export type TaskCancelledPayload = {
  taskId: string;
  reason?: string | null;
};

export type TaskDomainEventPayload = DomainEventPayload;
