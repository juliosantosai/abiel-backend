import { createDomainEvent } from "../../../../shared/events/domain-event";

export interface AgentPausedPayload {
  agentId: string;
  empresaId: string;
}

export function createAgentPausedEvent(payload: AgentPausedPayload, metadata?: { tenantId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `agent-paused-${payload.agentId}`,
    occurredAt: new Date(),
    eventName: "AgentPaused",
    aggregateId: payload.agentId,
    metadata,
    payload: {
      agentId: payload.agentId,
      empresaId: payload.empresaId,
    },
  });
}
