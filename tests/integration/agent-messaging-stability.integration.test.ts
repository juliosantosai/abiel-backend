import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { InMemoryEventBus } from "../../src/shared/events/in-memory-event-bus";
import { AgentOrchestrator } from "../../src/modules/agente/application/agent-orchestrator";
import { MessageReceivedEventHandler as AgentMessageReceivedEventHandler } from "../../src/modules/agente/application/message-received-event-handler";
import { OutboundMessageHandler } from "../../src/modules/gateway/application/outbound-message-handler";
import { EchoCapability } from "../../src/modules/agente/application/echo-capability";
import { CapabilityRegistry } from "../../src/modules/agente/application/capability-registry";
import { ConversationService } from "../../src/modules/conversacion/application/conversation-service";
import { MessageRole } from "../../src/modules/conversacion/domain/message-role";
import type { DomainEvent } from "../../src/shared/events/domain-event";
import type { TenantContext } from "../../src/shared/context/tenant-context";

const makeMessageReceivedEvent = (tenantId: string, conversationId: string, messageId: string, correlationId = "corr-1") => ({
  eventId: `message-received-${messageId}`,
  occurredAt: new Date(),
  eventName: "MessageReceived",
  aggregateId: conversationId,
  metadata: { tenantId, correlationId },
  payload: { messageId, conversationId, empresaId: tenantId, senderId: "user-1", contentType: "text", text: "hello" },
});

describe("Agent and messaging stability integration", () => {
  let eventBus: InMemoryEventBus;
  let publishSpy: ReturnType<typeof vi.spyOn>;
  let capabilityRegistry: CapabilityRegistry;

  const createMockConversationRepo = (existingConversation = false): any => ({
    create: vi.fn(async (conversation) => conversation),
    findById: vi.fn(async (id, empresaId) =>
      existingConversation && id === "conversation-1" && empresaId === "tenant-1"
        ? { id, empresaId, usuarioId: "user-1", estado: "BOT_ACTIVE", createdAt: new Date(), updatedAt: new Date() }
        : null
    ),
    findByEmpresaId: vi.fn(async () => []),
    update: vi.fn(async (id, empresaId, patch) => ({ id, empresaId, usuarioId: "user-1", estado: patch.estado ?? "BOT_ACTIVE", createdAt: new Date(), updatedAt: new Date() })),
  });

  const createMockMessageRepo = (): any => ({
    create: vi.fn(async (message) => message),
    findByConversationId: vi.fn(async (conversationId, empresaId) => [{ id: "msg-1", conversationId, empresaId, contenido: "hello", createdAt: new Date() }]),
  });

  const createMockAgentRepo = (agentTenant = "tenant-1", capabilities: string[] = ["echo-capability"]): any => ({
    findByEmpresa: vi.fn(async (empresaId) => [
      { id: "agent-1", empresaId: agentTenant, estado: "ACTIVE", capabilities },
    ]),
  });

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
    publishSpy = vi.spyOn(eventBus, "publish");
    capabilityRegistry = new CapabilityRegistry();
    capabilityRegistry.register(new EchoCapability(eventBus));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("happy path should route MessageReceived through EchoCapability and emit SendMessageRequested", async () => {
    const conversationRepo = createMockConversationRepo(true);
    const messageRepo = createMockMessageRepo();
    const mockAgentRepo = createMockAgentRepo("tenant-1", ["echo-capability"]);
    const orchestrator = new AgentOrchestrator(mockAgentRepo, conversationRepo, messageRepo, { execute: async () => ({ success: true }) } as any, eventBus, capabilityRegistry);
    const handler = new AgentMessageReceivedEventHandler(orchestrator);

    const event = makeMessageReceivedEvent("tenant-1", "conversation-1", "message-1", "happy-path-1");
    await handler.handle(event as any);

    expect(publishSpy).toHaveBeenCalled();
    const sent = publishSpy.mock.calls.find((call) => call[0].eventName === "SendMessageRequested");
    expect(sent).toBeDefined();
    expect(sent?.[0].metadata?.tenantId).toBe("tenant-1");
    expect(sent?.[0].payload?.messageContent).toContain("Echo:");
  });

  it("tenant isolation should reject processing when agent belongs to another tenant", async () => {
    const conversationRepo = createMockConversationRepo(true);
    const messageRepo = createMockMessageRepo();
    const mockAgentRepo = createMockAgentRepo("tenant-2", ["echo-capability"]);
    const orchestrator = new AgentOrchestrator(mockAgentRepo, conversationRepo, messageRepo, { execute: async () => ({ success: true }) } as any, eventBus, capabilityRegistry);
    const handler = new AgentMessageReceivedEventHandler(orchestrator);

    const event = makeMessageReceivedEvent("tenant-1", "conversation-1", "message-2", "security-1");
    await handler.handle(event as any);

    const sent = publishSpy.mock.calls.find((call) => call[0].eventName === "SendMessageRequested");
    expect(sent).toBeUndefined();
  });

  it("fallback resilience should not publish SendMessageRequested when no capabilities registered", async () => {
    const conversationRepo = createMockConversationRepo(true);
    const messageRepo = createMockMessageRepo();
    const mockAgentRepo = createMockAgentRepo("tenant-1", []);
    const orchestrator = new AgentOrchestrator(mockAgentRepo, conversationRepo, messageRepo, { execute: async () => ({ success: true }) } as any, eventBus, new CapabilityRegistry());
    const handler = new AgentMessageReceivedEventHandler(orchestrator);

    const event = makeMessageReceivedEvent("tenant-1", "conversation-1", "message-3", "fallback-1");
    await handler.handle(event as any);

    const sent = publishSpy.mock.calls.find((call) => call[0].eventName === "SendMessageRequested");
    expect(sent).toBeUndefined();
  });

  it("consistency should create only one conversation for two rapid same-remoteJid messages", async () => {
    const savedConversations = new Map<string, any>();
    const conversationRepo = {
      create: vi.fn(async (conversation) => {
        if (savedConversations.has(conversation.id)) {
          throw new Error("Unique constraint violation");
        }
        savedConversations.set(conversation.id, conversation);
        return conversation;
      }),
      findById: vi.fn(async (id, empresaId) =>
        savedConversations.has(id)
          ? { id, empresaId, usuarioId: "user-1", estado: "BOT_ACTIVE", createdAt: new Date(), updatedAt: new Date() }
          : null
      ),
      findByEmpresaId: vi.fn(async () => []),
      update: vi.fn(async (id, empresaId, patch) => ({ id, empresaId, usuarioId: "user-1", estado: patch.estado ?? "BOT_ACTIVE", createdAt: new Date(), updatedAt: new Date() })),
    };

    const messageRepo = {
      create: vi.fn(async (message) => message),
      findByConversationId: vi.fn(async (conversationId, empresaId) => [{ id: "msg-1", conversationId, empresaId, contenido: "hello", createdAt: new Date() }]),
    };

    const conversationService = new ConversationService(conversationRepo as any, messageRepo as any, eventBus as any);
    const context = {
      usuarioId: "user-1",
      empresaId: "tenant-1",
      membershipId: "membership-1",
      rolIds: [],
      permisos: [],
      isGlobalTenant: false,
    } as TenantContext;

    await Promise.all([
      conversationService.procesarMensajeEntrante(context, { conversationId: "conversation-1", contenido: "hello", usuarioId: "user-1", rol: MessageRole.USER }),
      conversationService.procesarMensajeEntrante(context, { conversationId: "conversation-1", contenido: "hello", usuarioId: "user-1", rol: MessageRole.USER }),
    ]);

    expect(conversationRepo.create).toHaveBeenCalledTimes(2);
    expect(conversationRepo.findById).toHaveBeenCalled();
    expect(savedConversations.size).toBe(1);
  });
});
