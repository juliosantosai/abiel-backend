import type { DomainEvent } from "../../../shared/events/domain-event";
import type { EventHandler } from "../../../shared/events/event-handler";
import type { ConversationService } from "./conversation-service";
import { MessageRole } from "../domain/message-role";
import { TenantContext } from "../../../shared/context/tenant-context";

export class MessageReceivedEventHandler implements EventHandler {
  constructor(private readonly conversationService: ConversationService) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.eventName !== "MessageReceived") {
      return;
    }

    const tenantId = event.metadata?.tenantId;
    if (!tenantId) return;

    const payload = event.payload as Record<string, unknown>;
    const conversationId = typeof payload.conversationId === "string" ? payload.conversationId : event.aggregateId;
    const text = typeof payload.text === "string" ? payload.text : undefined;
    const senderId = typeof payload.senderId === "string" ? payload.senderId : undefined;

    if (!text || !conversationId || !senderId) {
      return;
    }

    const context = TenantContext.create({
      usuarioId: senderId,
      empresaId: tenantId,
      membershipId: `membership-${tenantId}`,
      rolIds: [],
      permisos: [],
      isGlobalTenant: false,
    });

    await this.conversationService.procesarMensajeEntrante(context, {
      conversationId,
      contenido: text,
      usuarioId: senderId,
      rol: MessageRole.USER,
    });
  }
}
