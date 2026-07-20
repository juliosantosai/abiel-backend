import { describe, it, expect, vi } from "vitest";
import { ConversationService } from "../../../src/modules/conversacion/application/conversation-service";
import { MessageReceivedEventHandler } from "../../../src/modules/conversacion/application/message-received-event-handler";
import { ConversationStatus } from "../../../src/modules/conversacion/domain/conversation-status";
import { MessageRole } from "../../../src/modules/conversacion/domain/message-role";
import { TenantContext } from "../../../src/shared/context/tenant-context";

class InMemoryConversationRepository {
  private readonly conversations: Map<string, any> = new Map();

  async create(conversation: any) {
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async findById(id: string, empresaId: string) {
    const conversation = this.conversations.get(id);
    return conversation && conversation.empresaId === empresaId ? conversation : null;
  }

  async findByEmpresaId(empresaId: string) {
    return Array.from(this.conversations.values()).filter((c) => c.empresaId === empresaId);
  }

  async update(id: string, empresaId: string, patch: any) {
    const conversation = this.conversations.get(id);
    if (!conversation || conversation.empresaId !== empresaId) return null;
    const updated = { ...conversation, ...patch };
    this.conversations.set(id, updated);
    return updated;
  }
}

class InMemoryMessageRepository {
  public readonly messages: any[] = [];

  async create(message: any) {
    this.messages.push(message);
    return message;
  }

  async findByConversationId(conversationId: string, empresaId: string) {
    return this.messages.filter((m) => m.conversationId === conversationId && m.empresaId === empresaId);
  }
}

describe("ConversationService inbound processing", () => {
  it("creates a conversation and stores incoming webhook messages", async () => {
    const conversationRepository = new InMemoryConversationRepository();
    const messageRepository = new InMemoryMessageRepository();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);
    const context = TenantContext.create({
      usuarioId: "sender-1",
      empresaId: "empresa-1",
      membershipId: "membership-1",
      rolIds: [],
      permisos: [],
      isGlobalTenant: false,
    });

    const result = await service.procesarMensajeEntrante(context, {
      conversationId: "empresa-1:sender-1",
      contenido: "Hola desde WhatsApp",
      usuarioId: "sender-1",
      rol: MessageRole.USER,
    });

    expect(result.contenido).toBe("Hola desde WhatsApp");
    expect(await conversationRepository.findById("empresa-1:sender-1", "empresa-1")).toMatchObject({
      id: "empresa-1:sender-1",
      estado: ConversationStatus.BOT_ACTIVE,
    });
    expect(messageRepository.messages).toHaveLength(1);
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it("consumes MessageReceived events and stores the inbound message", async () => {
    const conversationRepository = new InMemoryConversationRepository();
    const messageRepository = new InMemoryMessageRepository();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);
    const handler = new MessageReceivedEventHandler(service);

    await handler.handle({
      eventId: "evt-1",
      occurredAt: new Date(),
      eventName: "MessageReceived",
      aggregateId: "empresa-1:sender-2",
      metadata: {
        tenantId: "empresa-1",
        correlationId: "corr-1",
      },
      payload: {
        messageId: "msg-2",
        conversationId: "empresa-1:sender-2",
        empresaId: "empresa-1",
        senderId: "sender-2",
        contentType: "text",
        text: "Evento recibido",
      },
    } as any);

    expect(messageRepository.messages).toHaveLength(1);
    expect(messageRepository.messages[0].contenido).toBe("Evento recibido");
  });
});
