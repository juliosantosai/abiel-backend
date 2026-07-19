import { createDomainEvent } from "../../../../shared/events/domain-event";
import type { AgentExecution } from "../agent-execution";

export function createAgentExecutionFailedEvent(execution: AgentExecution, error: unknown, metadata?: { tenantId?: string; userId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `agent-execution-failed-${execution.id}`,
    occurredAt: new Date(),
    eventName: "AgentExecutionFailed",
    aggregateId: execution.conversationId ?? execution.id,
    metadata,
    payload: { execution: execution.toJSON(), error },
  });
}
