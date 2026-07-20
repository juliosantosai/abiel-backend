import { createDomainEvent } from "../../../../shared/events/domain-event";

export interface AgentCreatedPayload {
  agentId: string;
  empresaId: string;
}

export function createAgentCreatedEvent(payload: AgentCreatedPayload, metadata?: { tenantId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `agent-created-${payload.agentId}`,
    occurredAt: new Date(),
    eventName: "AgentCreated",
    aggregateId: payload.agentId,
    metadata,
    payload: {
      agentId: payload.agentId,
      empresaId: payload.empresaId,
    },
  });
}
