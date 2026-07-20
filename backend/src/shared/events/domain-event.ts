export interface DomainEventPayload {
  readonly [key: string]: unknown;
}

export interface EventMetadata {
  readonly tenantId?: string;
  readonly userId?: string;
  readonly correlationId?: string;
}

export interface DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventName: string;
  readonly aggregateId: string;
  readonly metadata: EventMetadata;
  readonly payload: DomainEventPayload;
}

export function createDomainEvent<T extends DomainEventPayload>(event: {
  eventId: string;
  occurredAt: Date;
  eventName: string;
  aggregateId: string;
  metadata?: EventMetadata;
  payload: T;
}): Readonly<DomainEvent> {
  return Object.freeze({
    eventId: event.eventId,
    occurredAt: new Date(event.occurredAt),
    eventName: event.eventName,
    aggregateId: event.aggregateId,
    metadata: Object.freeze({ ...(event.metadata ?? {}) }),
    payload: Object.freeze({ ...event.payload }),
  });
}
