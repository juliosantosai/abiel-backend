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

  it("finalizes human intervention and emits HumanInterventionEnded", async () => {
    const conversationRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: "conversation-3", empresaId: "empresa-1", usuarioId: "user-1", estado: ConversationStatus.HUMAN_INTERVENTION, createdAt: new Date(), updatedAt: new Date() }),
      update: vi.fn().mockImplementation(async (_id, _empresaId, patch) => ({ id: "conversation-3", empresaId: "empresa-1", usuarioId: "user-1", ...patch, createdAt: new Date(), updatedAt: new Date() })),
      findByEmpresaId: vi.fn(),
    };
    const messageRepository = { create: vi.fn(), findByConversationId: vi.fn() };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);
    const updated = await service.finalizarIntervencionHumana(context, "conversation-3");

    expect(updated.estado).toBe(ConversationStatus.BOT_ACTIVE);
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({ eventName: "HumanInterventionEnded" }));
  });

  it("adds an inbound message to an existing conversation without creating a new one", async () => {
    const conversationRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: "conversation-4", empresaId: "empresa-1", estado: ConversationStatus.OPEN }),
      findByEmpresaId: vi.fn(),
    };
    const messageRepository = {
      create: vi.fn().mockImplementation(async (message) => message),
      findByConversationId: vi.fn().mockResolvedValue([]),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);
    const result = await service.procesarMensajeEntrante(context, {
      conversationId: "conversation-4",
      contenido: "Mensaje existente",
      usuarioId: "user-1",
      rol: MessageRole.USER,
    });

    expect(conversationRepository.create).not.toHaveBeenCalled();
    expect(messageRepository.create).toHaveBeenCalled();
    expect(result.contenido).toBe("Mensaje existente");
  });

  it("buffers a message when the conversation is in human intervention", async () => {
    const conversationRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: "conversation-5", empresaId: "empresa-1", estado: ConversationStatus.HUMAN_INTERVENTION }),
      findByEmpresaId: vi.fn(),
    };
    const messageRepository = {
      create: vi.fn().mockImplementation(async (message) => message),
      findByConversationId: vi.fn().mockResolvedValue([]),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);
    const created = await service.agregarMensaje(context, { conversationId: "conversation-5", contenido: "Hola en intervención", rol: MessageRole.USER });

    expect(created.contenido).toBe("Hola en intervención");
    expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({ eventName: "MessagesBuffered" }));
  });

  it("lists messages and enforces tenant conversation scope", async () => {
    const conversationRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: "conversation-6", empresaId: "empresa-1", estado: ConversationStatus.OPEN }),
      findByEmpresaId: vi.fn(),
    };
    const messageRepository = {
      create: vi.fn(),
      findByConversationId: vi.fn().mockResolvedValue([{ id: "msg-1", conversationId: "conversation-6", empresaId: "empresa-1", contenido: "t1" }]),
    };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);
    const messages = await service.listarMensajes(context, "conversation-6");

    expect(messages).toHaveLength(1);
    expect(messages[0].contenido).toBe("t1");
  });

  it("throws when listing messages for a conversation that does not belong to the tenant", async () => {
    const conversationRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByEmpresaId: vi.fn(),
    };
    const messageRepository = { create: vi.fn(), findByConversationId: vi.fn() };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);

    await expect(service.listarMensajes(context, "conversation-missing")).rejects.toThrow("Conversación no encontrada o no pertenece al tenant actual");
  });

  it("throws when adding a message to a non-existent conversation", async () => {
    const conversationRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByEmpresaId: vi.fn(),
    };
    const messageRepository = { create: vi.fn(), findByConversationId: vi.fn() };
    const eventBus = { publish: vi.fn().mockResolvedValue(undefined) };

    const service = new ConversationService(conversationRepository as any, messageRepository as any, eventBus as any);

    await expect(service.agregarMensaje(context, { conversationId: "conversation-unknown", contenido: "Hola", rol: MessageRole.USER })).rejects.toThrow("Conversación no encontrada o no pertenece al tenant actual");
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
