import { describe, it, expect, vi } from "vitest";
import { ConversationService } from "../../src/modules/conversacion/application/conversation-service";
import { MessageBufferService } from "../../src/modules/conversacion/application/message-buffer-service";
import { ConversationStatus } from "../../src/modules/conversacion/domain/conversation-status";
import { MessageRole } from "../../src/modules/conversacion/domain/message-role";
import { TenantContext } from "../../src/shared/context/tenant-context";

const context = TenantContext.create({
  usuarioId: "user-1",
  empresaId: "empresa-1",
  membershipId: "membership-1",
  rolIds: ["rol-1"],
  permisos: ["CONVERSATION_VIEW"],
  isGlobalTenant: false,
});

describe("ConversationService", () => {
  it("creates a conversation scoped to the tenant context", async () => {
    const conversationRepository = {
      create: vi.fn().mockImplementation(async (conversation) => conversation),
      findById: vi.fn(),
      findByEmpresaId: vi.fn(),
    };
    const messageRepository = {
      create: vi.fn(),
      findByConversationId: vi.fn(),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);
    const created = await service.crearConversation(context, { usuarioId: "user-1", titulo: "Hola" });

    expect(created.empresaId).toBe("empresa-1");
    expect(created.usuarioId).toBe("user-1");
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it("adds a message and enforces tenant ownership", async () => {
    const conversationRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: "conversation-1", empresaId: "empresa-1", estado: ConversationStatus.OPEN }),
      findByEmpresaId: vi.fn(),
    };
    const messageRepository = {
      create: vi.fn().mockImplementation(async (message) => message),
      findByConversationId: vi.fn(),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);
    const created = await service.agregarMensaje(context, { conversationId: "conversation-1", contenido: "Hola", rol: MessageRole.USER });

    expect(created.empresaId).toBe("empresa-1");
    expect(created.contenido).toBe("Hola");
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it("rejects messages for archived conversations and uses tenant-aware repository lookups", async () => {
    const conversationRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: "conversation-1", empresaId: "empresa-1", estado: ConversationStatus.ARCHIVED }),
      findByEmpresaId: vi.fn(),
    };
    const messageRepository = {
      create: vi.fn(),
      findByConversationId: vi.fn(),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);

    await expect(service.agregarMensaje(context, { conversationId: "conversation-1", contenido: "Hola", rol: MessageRole.USER })).rejects.toThrow("No se pueden agregar mensajes a una conversación cerrada o archivada");
    expect(conversationRepository.findById).toHaveBeenCalledWith("conversation-1", "empresa-1");
  });

  it("starts human intervention and emits a human intervention event", async () => {
    const conversationRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: "conversation-2", empresaId: "empresa-1", usuarioId: "user-1", estado: ConversationStatus.BOT_ACTIVE, createdAt: new Date(), updatedAt: new Date() }),
      update: vi.fn().mockImplementation(async (_id, _empresaId, patch) => ({ id: "conversation-2", empresaId: "empresa-1", usuarioId: "user-1", ...patch, createdAt: new Date(), updatedAt: new Date() })),
      findByEmpresaId: vi.fn(),
    };
    const messageRepository = { create: vi.fn(), findByConversationId: vi.fn() };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);
    const updated = await service.iniciarIntervencionHumana(context, "conversation-2");

    expect(updated.estado).toBe(ConversationStatus.HUMAN_INTERVENTION);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({ eventName: "HumanInterventionStarted" }));
  });

  it("buffers messages and publishes a single buffered event after debounce", async () => {
    vi.useFakeTimers();
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };
    const bufferService = new MessageBufferService(eventBus as any, 20);

    await bufferService.bufferMessage(context, {
      id: "msg-buffered-1",
      conversationId: "conversation-buffer-1",
      empresaId: "empresa-1",
      usuarioId: "user-1",
      contenido: "Hola",
      rol: MessageRole.USER,
      createdAt: new Date(),
    } as any);

    vi.advanceTimersByTime(20);

    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({ eventName: "MessagesBuffered" }));
    vi.useRealTimers();
  });
});
