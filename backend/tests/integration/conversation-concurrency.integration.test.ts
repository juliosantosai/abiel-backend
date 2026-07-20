import { describe, expect, it, vi } from "vitest";
import { ConversationService } from "../../src/modules/conversacion/application/conversation-service";
import { MessageRole } from "../../src/modules/conversacion/domain/message-role";
import { TenantContext } from "../../src/shared/context/tenant-context";
import { InMemoryEventBus } from "../../src/shared/events/in-memory-event-bus";

describe("Conversation concurrency resilience", () => {
  it("does not create duplicate conversations for concurrent inbound messages", async () => {
    const savedConversations = new Map<string, any>();
    const conversationRepo = {
      create: vi.fn(async (conversation: any) => {
        if (savedConversations.has(conversation.id)) {
          throw new Error("Unique constraint violation");
        }
        savedConversations.set(conversation.id, conversation);
        return conversation;
      }),
      findById: vi.fn(async (id: string, empresaId: string) => {
        const conversation = savedConversations.get(id);
        return conversation?.empresaId === empresaId ? conversation : null;
      }),
      update: vi.fn(async (id: string, empresaId: string, patch: any) => {
        const conversation = savedConversations.get(id);
        if (!conversation || conversation.empresaId !== empresaId) return null;
        const updated = { ...conversation, ...patch, updatedAt: new Date() };
        savedConversations.set(id, updated);
        return updated;
      }),
      findByEmpresaId: vi.fn(async () => []),
    } as any;

    const messages: any[] = [];
    const messageRepo = {
      create: vi.fn(async (message: any) => {
        messages.push(message);
        return message;
      }),
      findByConversationId: vi.fn(async (conversationId: string) => messages.filter((m) => m.conversationId === conversationId)),
    } as any;

    const eventBus = new InMemoryEventBus();
    const service = new ConversationService(conversationRepo, messageRepo, eventBus as any);

    const context = TenantContext.create({
      usuarioId: "user-1",
      empresaId: "tenant-1",
      membershipId: "membership-1",
      rolIds: ["rol-1"],
      permisos: ["CONVERSATION_VIEW"],
      isGlobalTenant: false,
    });

    const calls = [
      service.procesarMensajeEntrante(context, {
        conversationId: "conversation-1",
        contenido: "hola 1",
        usuarioId: "user-1",
        rol: MessageRole.USER,
      }),
      service.procesarMensajeEntrante(context, {
        conversationId: "conversation-1",
        contenido: "hola 2",
        usuarioId: "user-1",
        rol: MessageRole.USER,
      }),
    ];

    await Promise.all(calls);

    expect(conversationRepo.create).toHaveBeenCalledTimes(2);
    expect(savedConversations.size).toBe(1);
    expect(messages.length).toBe(2);
    expect(messageRepo.create).toHaveBeenCalledTimes(2);
  });
});
