import type { DomainEvent } from "../../../shared/events/domain-event";
import { createDomainEvent } from "../../../shared/events/domain-event";

export interface SendMessageRequestedPayload {
  tenantId: string;
  conversationId: string;
  messageContent: string;
  originalMessageId: string;
  agentId: string;
  executionId: string;
}

export interface SendMessageRequestedMetadata {
  tenantId: string;
  correlationId?: string;
  userId?: string;
}

export function createSendMessageRequestedEvent(
  payload: SendMessageRequestedPayload,
  metadata: SendMessageRequestedMetadata
): DomainEvent {
  return createDomainEvent({
    eventId: `send-message-requested-${payload.conversationId}-${payload.executionId}-${Date.now()}`,
    occurredAt: new Date(),
    eventName: "SendMessageRequested",
    aggregateId: payload.conversationId,
    metadata,
    payload,
  });
}
