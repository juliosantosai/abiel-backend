import { generateUuid } from "../../../shared/utils/uuid";
import { Conversation, type ConversationProps } from "../domain/conversation";
import { ConversationStatus } from "../domain/conversation-status";
import { Message, type MessageProps } from "../domain/message";
import { MessageRole } from "../domain/message-role";
import type { ConversationRepository } from "../infrastructure/conversation-repository";
import type { MessageRepository } from "../infrastructure/message-repository";
import type { TenantContext } from "../../../shared/context/tenant-context";
import type { EventBus } from "../../../shared/events/event-bus";
import { createDomainEvent } from "../../../shared/events/domain-event";

export type CreateConversationInput = {
  titulo?: string | null;
  usuarioId: string;
};

export type CreateMessageInput = {
  conversationId: string;
  contenido: string;
  rol: MessageRole;
};

export type InboundMessageInput = {
  conversationId: string;
  contenido: string;
  usuarioId: string;
  rol: MessageRole;
};

/**
 * ConversationService encapsulates conversation lifecycle rules and message persistence.
 *
 * Está enfocado en mantener aislamiento por tenant y en publicar eventos de dominio
 * una vez que la operación se completa.
 */
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Crea una conversación nueva dentro del tenant.
   *
   * @param context Contexto de tenant que contiene empresaId y usuarioId.
   * @param input Datos para crear la conversación.
   * @returns La conversación creada.
   */
  async crearConversation(context: TenantContext, input: CreateConversationInput): Promise<ConversationProps> {
    const conversation = new Conversation({
      id: generateUuid(),
      empresaId: context.empresaId,
      usuarioId: input.usuarioId,
      titulo: input.titulo ?? null,
      estado: ConversationStatus.BOT_ACTIVE,
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

  /**
   * Agrega un mensaje a una conversación existente.
   *
   * En conversaciones en estado de intervención humana o bloqueadas,
   * el mensaje se persiste pero se publica `MessagesBuffered`.
   *
   * @param context TenantContext que contiene el tenant actual.
   * @param input Datos del mensaje a agregar.
   */
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

    if (conversation.estado === ConversationStatus.HUMAN_INTERVENTION || conversation.estado === ConversationStatus.BLOCKED) {
      const created = await this.messageRepository.create(message.toJSON());
      await this.eventBus.publish(createDomainEvent({
        eventId: `human-intervention-buffer-${created.id}`,
        occurredAt: new Date(),
        eventName: "MessagesBuffered",
        aggregateId: created.conversationId,
        metadata: { tenantId: context.empresaId, userId: context.usuarioId, correlationId: created.conversationId },
        payload: { conversationId: created.conversationId, empresaId: context.empresaId, messageId: created.id, buffered: true },
      }));
      return created;
    }

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

  /**
   * Procesa un mensaje entrante desde el gateway o desde un evento de dominio.
   *
   * Si la conversación no existe, la crea dentro del tenant actual.
   *
   * @param context TenantContext con empresaId y usuarioId.
   * @param input Datos del mensaje entrante.
   */
  async procesarMensajeEntrante(context: TenantContext, input: InboundMessageInput): Promise<MessageProps> {
    let conversation = await this.conversationRepository.findById(input.conversationId, context.empresaId);

    if (!conversation) {
      const createdConversation = new Conversation({
        id: input.conversationId,
        empresaId: context.empresaId,
        usuarioId: input.usuarioId,
        titulo: null,
        estado: ConversationStatus.BOT_ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        conversation = await this.conversationRepository.create(createdConversation.toJSON());
      } catch (error) {
        // If a concurrent request created the conversation first, re-fetch it.
        const existing = await this.conversationRepository.findById(input.conversationId, context.empresaId);
        if (!existing) {
          throw error;
        }
        conversation = existing;
      }
    }

    return this.agregarMensaje(context, {
      conversationId: input.conversationId,
      contenido: input.contenido,
      rol: input.rol,
    });
  }

  /**
   * Cambia el estado de una conversación a intervención humana.
   *
   * Publica `HumanInterventionStarted` y bloquea la orquestación de agentes para ese flujo.
   */
  async iniciarIntervencionHumana(context: TenantContext, conversationId: string): Promise<ConversationProps> {
    const conversation = await this.conversationRepository.findById(conversationId, context.empresaId);
    if (!conversation) {
      throw new Error("Conversación no encontrada o no pertenece al tenant actual");
    }

    const updated = await this.conversationRepository.update(conversationId, context.empresaId, { estado: ConversationStatus.HUMAN_INTERVENTION });
    if (!updated) {
      throw new Error("No se pudo actualizar la conversación");
    }

    await this.eventBus.publish(createDomainEvent({
      eventId: `human-intervention-started-${conversationId}`,
      occurredAt: new Date(),
      eventName: "HumanInterventionStarted",
      aggregateId: conversationId,
      metadata: { tenantId: context.empresaId, userId: context.usuarioId, correlationId: conversationId },
      payload: { conversationId, empresaId: context.empresaId },
    }));

    return updated;
  }

  /**
   * Finaliza la intervención humana y permite que el bot vuelva a procesar mensajes.
   */
  async finalizarIntervencionHumana(context: TenantContext, conversationId: string): Promise<ConversationProps> {
    const conversation = await this.conversationRepository.findById(conversationId, context.empresaId);
    if (!conversation) {
      throw new Error("Conversación no encontrada o no pertenece al tenant actual");
    }

    const updated = await this.conversationRepository.update(conversationId, context.empresaId, { estado: ConversationStatus.BOT_ACTIVE });
    if (!updated) {
      throw new Error("No se pudo actualizar la conversación");
    }

    await this.eventBus.publish(createDomainEvent({
      eventId: `human-intervention-ended-${conversationId}`,
      occurredAt: new Date(),
      eventName: "HumanInterventionEnded",
      aggregateId: conversationId,
      metadata: { tenantId: context.empresaId, userId: context.usuarioId, correlationId: conversationId },
      payload: { conversationId, empresaId: context.empresaId },
    }));

    return updated;
  }

  /**
   * Lista los mensajes de una conversación dentro del tenant actual.
   */
  async listarMensajes(context: TenantContext, conversationId: string): Promise<MessageProps[]> {
    const conversation = await this.conversationRepository.findById(conversationId, context.empresaId);
    if (!conversation) {
      throw new Error("Conversación no encontrada o no pertenece al tenant actual");
    }

    return this.messageRepository.findByConversationId(conversationId, context.empresaId);
  }
}
