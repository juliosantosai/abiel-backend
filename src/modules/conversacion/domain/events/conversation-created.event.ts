import { createDomainEvent } from "../../../../shared/events/domain-event";

export interface ConversationCreatedPayload {
  conversationId: string;
  empresaId: string;
}

export function createConversationCreatedEvent(payload: ConversationCreatedPayload, metadata?: { tenantId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `conversation-created-${payload.conversationId}`,
    occurredAt: new Date(),
    eventName: "ConversationCreated",
    aggregateId: payload.conversationId,
    metadata,
    payload: {
      conversationId: payload.conversationId,
      empresaId: payload.empresaId,
    },
  });
}
