import { createDomainEvent, type DomainEventPayload } from "../../../../shared/events/domain-event";

export interface UsuarioCreatedPayload extends DomainEventPayload {
  usuarioId: string;
  email: string;
  empresaId?: string;
}

export type UsuarioCreatedEvent = ReturnType<typeof createUsuarioCreatedEvent>;

export function createUsuarioCreatedEvent(payload: UsuarioCreatedPayload, metadata?: { tenantId?: string; userId?: string; correlationId?: string }) {
  return createDomainEvent({
    eventId: `usuario-created-${payload.usuarioId}-${Date.now()}`,
    occurredAt: new Date(),
    eventName: "UsuarioCreated",
    aggregateId: payload.usuarioId,
    metadata,
    payload: {
      usuarioId: payload.usuarioId,
      email: payload.email,
      empresaId: payload.empresaId,
    },
  });
}
