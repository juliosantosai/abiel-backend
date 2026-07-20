import { createDomainEvent } from "../../../../shared/events/domain-event";

export interface AgentActivatedPayload {
  agentId: string;
  empresaId: string;
}

export function createAgentActivatedEvent(payload: AgentActivatedPayload, metadata?: { tenantId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `agent-activated-${payload.agentId}`,
    occurredAt: new Date(),
    eventName: "AgentActivated",
    aggregateId: payload.agentId,
    metadata,
    payload: {
      agentId: payload.agentId,
      empresaId: payload.empresaId,
    },
  });
}
