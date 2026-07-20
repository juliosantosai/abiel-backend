import type { EventBus } from "../../../shared/events/event-bus";
import { createDomainEvent } from "../../../shared/events/domain-event";
import type { MessageProps } from "../domain/message";
import type { TenantContext } from "../../../shared/context/tenant-context";

/**
 * MessageBufferService agrupa mensajes entrantes cuando la conversación
 * está en un estado no procesable inmediato.
 *
 * Esto evita que ráfagas de mensajes disparen múltiples ejecuciones de agente.
 */
export class MessageBufferService {
  private pending: MessageProps[] = [];
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(private readonly eventBus: EventBus, private readonly debounceMs: number = 3000) {}

  /**
   * Bufferiza un mensaje y publica `MessagesBuffered` después del debounce.
   */
  async bufferMessage(context: TenantContext, message: MessageProps): Promise<MessageProps> {
    this.pending.push(message);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(async () => {
      const batch = [...this.pending];
      this.pending = [];
      this.timeoutId = null;

      await this.eventBus.publish(createDomainEvent({
        eventId: `messages-buffered-${message.conversationId}-${Date.now()}`,
        occurredAt: new Date(),
        eventName: "MessagesBuffered",
        aggregateId: message.conversationId,
        metadata: { tenantId: context.empresaId, userId: context.usuarioId, correlationId: message.conversationId },
        payload: {
          conversationId: message.conversationId,
          empresaId: context.empresaId,
          messages: batch.map((m) => ({ id: m.id, contenu: m.contenido, rol: m.rol })),
        },
      }));
    }, this.debounceMs);

    return message;
  }
}
