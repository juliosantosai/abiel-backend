import { createDomainEvent } from "../../../../shared/events/domain-event";
import type { AgentExecution } from "../agent-execution";

export function createAgentExecutionCompletedEvent(execution: AgentExecution, result: unknown, metadata?: { tenantId?: string; userId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `agent-execution-completed-${execution.id}`,
    occurredAt: new Date(),
    eventName: "AgentExecutionCompleted",
    aggregateId: execution.conversationId ?? execution.id,
    metadata,
    payload: { execution: execution.toJSON(), result },
  });
}
