import { createDomainEvent } from "../../../../shared/events/domain-event";

export interface MessageReceivedPayload {
  messageId: string;
  conversationId: string;
  empresaId: string;
}

export function createMessageReceivedEvent(payload: MessageReceivedPayload, metadata?: { tenantId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `message-received-${payload.messageId}`,
    occurredAt: new Date(),
    eventName: "MessageReceived",
    aggregateId: payload.conversationId,
    metadata,
    payload: {
      messageId: payload.messageId,
      conversationId: payload.conversationId,
      empresaId: payload.empresaId,
    },
  });
}
