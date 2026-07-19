import { createDomainEvent } from "../../../../shared/events/domain-event";

export interface AgentUpdatedPayload {
  agentId: string;
  empresaId: string;
}

export function createAgentUpdatedEvent(payload: AgentUpdatedPayload, metadata?: { tenantId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `agent-updated-${payload.agentId}`,
    occurredAt: new Date(),
    eventName: "AgentUpdated",
    aggregateId: payload.agentId,
    metadata,
    payload: {
      agentId: payload.agentId,
      empresaId: payload.empresaId,
    },
  });
}
