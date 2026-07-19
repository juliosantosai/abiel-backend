import { createDomainEvent } from "../../../../shared/events/domain-event";

export interface AgentDisabledPayload {
  agentId: string;
  empresaId: string;
}

export function createAgentDisabledEvent(payload: AgentDisabledPayload, metadata?: { tenantId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `agent-disabled-${payload.agentId}`,
    occurredAt: new Date(),
    eventName: "AgentDisabled",
    aggregateId: payload.agentId,
    metadata,
    payload: {
      agentId: payload.agentId,
      empresaId: payload.empresaId,
    },
  });
}
