import { createDomainEvent } from "../../../../shared/events/domain-event";

export interface ConversationClosedPayload {
  conversationId: string;
  empresaId: string;
}

export function createConversationClosedEvent(payload: ConversationClosedPayload, metadata?: { tenantId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `conversation-closed-${payload.conversationId}`,
    occurredAt: new Date(),
    eventName: "ConversationClosed",
    aggregateId: payload.conversationId,
    metadata,
    payload: {
      conversationId: payload.conversationId,
      empresaId: payload.empresaId,
    },
  });
}
