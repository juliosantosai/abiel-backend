import { generateUuid } from "../../../shared/utils/uuid";
import { Conversation, type ConversationProps } from "../domain/conversation";
import { ConversationStatus } from "../domain/conversation-status";
import { Message, type MessageProps } from "../domain/message";
import { MessageRole } from "../domain/message-role";
import type { ConversationRepository } from "../infrastructure/conversation-repository";
import type { MessageRepository } from "../infrastructure/message-repository";
import type { TenantContext } from "../../../shared/context/tenant-context";
import type { EventBus } from "../../../shared/events/event-bus";

export type CreateConversationInput = {
  titulo?: string | null;
  usuarioId: string;
};

export type CreateMessageInput = {
  conversationId: string;
  contenido: string;
  rol: MessageRole;
};

export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly eventBus: EventBus
  ) {}

  async crearConversation(context: TenantContext, input: CreateConversationInput): Promise<ConversationProps> {
    const conversation = new Conversation({
      id: generateUuid(),
      empresaId: context.empresaId,
      usuarioId: input.usuarioId,
      titulo: input.titulo ?? null,
      estado: ConversationStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.conversationRepository.create(conversation.toJSON());
    await this.eventBus.publish({
      eventId: `conversation-created-${created.id}`,
      occurredAt: new Date(),
      eventName: "ConversationCreated",
      aggregateId: created.id,
      metadata: {
        tenantId: context.empresaId,
        userId: context.usuarioId,
        correlationId: created.id,
      },
      payload: {
        conversationId: created.id,
        empresaId: context.empresaId,
        usuarioId: input.usuarioId,
      },
    });

    return created;
  }

  async agregarMensaje(context: TenantContext, input: CreateMessageInput): Promise<MessageProps> {
    const conversation = await this.conversationRepository.findById(input.conversationId, context.empresaId);
    if (!conversation) {
      throw new Error("Conversación no encontrada o no pertenece al tenant actual");
    }

    if (conversation.estado === ConversationStatus.CLOSED || conversation.estado === ConversationStatus.ARCHIVED) {
      throw new Error("No se pueden agregar mensajes a una conversación cerrada o archivada");
    }

    const message = new Message({
      id: generateUuid(),
      conversationId: input.conversationId,
      empresaId: context.empresaId,
      usuarioId: context.usuarioId,
      contenido: input.contenido,
      rol: input.rol,
      createdAt: new Date(),
    });

    const created = await this.messageRepository.create(message.toJSON());
    await this.eventBus.publish({
      eventId: `message-created-${created.id}`,
      occurredAt: new Date(),
      eventName: "MessageCreated",
      aggregateId: created.conversationId,
      metadata: {
        tenantId: context.empresaId,
        userId: context.usuarioId,
        correlationId: created.id,
      },
      payload: {
        conversationId: created.conversationId,
        empresaId: context.empresaId,
        messageId: created.id,
        rol: created.rol,
      },
    });

    return created;
  }

  async listarMensajes(context: TenantContext, conversationId: string): Promise<MessageProps[]> {
    const conversation = await this.conversationRepository.findById(conversationId, context.empresaId);
    if (!conversation) {
      throw new Error("Conversación no encontrada o no pertenece al tenant actual");
    }

    return this.messageRepository.findByConversationId(conversationId, context.empresaId);
  }
}
