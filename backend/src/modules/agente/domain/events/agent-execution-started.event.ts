import { createDomainEvent } from "../../../../shared/events/domain-event";
import type { AgentExecution } from "../agent-execution";

export function createAgentExecutionStartedEvent(execution: AgentExecution, metadata?: { tenantId?: string; userId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `agent-execution-started-${execution.id}`,
    occurredAt: new Date(),
    eventName: "AgentExecutionStarted",
    aggregateId: execution.conversationId ?? execution.id,
    metadata,
    payload: execution.toJSON(),
  });
}
