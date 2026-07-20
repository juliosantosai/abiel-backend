import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import { InMemoryEventBus } from "../../src/shared/events/in-memory-event-bus";
import { ConversationService } from "../../src/modules/conversacion/application/conversation-service";
import { MessageReceivedEventHandler as ConversationMessageReceivedEventHandler } from "../../src/modules/conversacion/application/message-received-event-handler";
import { AgentOrchestrator } from "../../src/modules/agente/application/agent-orchestrator";
import { MessageReceivedEventHandler as AgentMessageReceivedEventHandler } from "../../src/modules/agente/application/message-received-event-handler";
import { CapabilityRegistry } from "../../src/modules/agente/application/capability-registry";
import { EchoCapability } from "../../src/modules/agente/application/echo-capability";
import { EvolutionWebhookNormalizer } from "../../src/modules/gateway/application/evolution-webhook-normalizer";
import { registerWebhookController } from "../../src/modules/gateway/presentation/webhook.controller";
import { AgentStatus } from "../../src/modules/agente/domain/agent-status";
import { MessageRole } from "../../src/modules/conversacion/domain/message-role";
import type { DomainEvent } from "../../src/shared/events/domain-event";

const createWebhookPayload = (messageId: string, remoteJid: string, text: string) => ({
  event: "messages.upsert",
  data: {
    id: messageId,
    key: { remoteJid },
    message: { conversation: text },
    messageTimestamp: Math.floor(Date.now() / 1000),
  },
});

function createConversationRepo() {
  const conversations = new Map<string, any>();

  return {
    create: vi.fn(async (conversation: any) => {
      conversations.set(conversation.id, conversation);
      return conversation;
    }),
    findById: vi.fn(async (id: string, empresaId: string) => {
      const conversation = conversations.get(id);
      return conversation?.empresaId === empresaId ? conversation : null;
    }),
    update: vi.fn(async (id: string, empresaId: string, patch: any) => {
      const conversation = conversations.get(id);
      if (!conversation || conversation.empresaId !== empresaId) return null;
      const updated = { ...conversation, ...patch, updatedAt: new Date() };
      conversations.set(id, updated);
      return updated;
    }),
    findByEmpresaId: vi.fn(async () => []),
  };
}

function createMessageRepo() {
  const messages = new Map<string, any[]>();

  return {
    create: vi.fn(async (message: any) => {
      const existing = messages.get(message.conversationId) ?? [];
      const stored = { ...message, createdAt: message.createdAt ?? new Date() };
      existing.push(stored);
      messages.set(message.conversationId, existing);
      return stored;
    }),
    findByConversationId: vi.fn(async (conversationId: string) => messages.get(conversationId) ?? []),
  };
}

function createAgentRepo(activeTenant: string, capabilities: string[] = ["echo-capability"], status: AgentStatus = AgentStatus.ACTIVE) {
  return {
    findByEmpresa: vi.fn(async (empresaId: string) => {
      if (empresaId !== activeTenant) {
        return [];
      }

      return [
        {
          id: "agent-1",
          empresaId: activeTenant,
          nombre: "EchoAgent",
          descripcion: "Test agent",
          estado: status,
          capabilities,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }),
  };
}

describe("Messaging capability integration flow", () => {
  let app: ReturnType<typeof Fastify>;
  let eventBus: InMemoryEventBus;
  let publishedOutboundEvents: DomainEvent[];
  let capabilityRegistry: CapabilityRegistry;
  let normalizer: EvolutionWebhookNormalizer;

  beforeEach(() => {
    app = Fastify();
    eventBus = new InMemoryEventBus();
    publishedOutboundEvents = [];
    capabilityRegistry = new CapabilityRegistry();
    normalizer = new EvolutionWebhookNormalizer();

    eventBus.subscribe("SendMessageRequested", {
      handle: async (event: DomainEvent) => {
        publishedOutboundEvents.push(event);
      },
    } as any);
  });

  afterEach(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  it("processes webhook to conversation and echoes via capability to outbound handler", async () => {
    const conversationRepo = createConversationRepo();
    const messageRepo = createMessageRepo();
    const agentRepo = createAgentRepo("tenant-1", ["echo-capability"], AgentStatus.ACTIVE);
    capabilityRegistry.register(new EchoCapability(eventBus));

    const conversationService = new ConversationService(conversationRepo as any, messageRepo as any, eventBus as any);
    const orchestrator = new AgentOrchestrator(agentRepo as any, conversationRepo as any, messageRepo as any, { execute: vi.fn() } as any, eventBus as any, capabilityRegistry);

    eventBus.subscribe("MessageReceived", new ConversationMessageReceivedEventHandler(conversationService));
    eventBus.subscribe("MessageReceived", new AgentMessageReceivedEventHandler(orchestrator));

    registerWebhookController(app, {
      empresaRepository: {
        findByWebhookToken: async () => ({ id: "tenant-1", activo: true }),
      } as any,
      eventBus,
      normalizerService: normalizer,
    });

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/test-token",
      headers: { "content-type": "application/json" },
      payload: createWebhookPayload("msg-001", "user-1@s.whatsapp.net", "hola mundo"),
    });

    expect(response.statusCode).toBe(202);
    expect(publishedOutboundEvents).toHaveLength(1);
    expect(publishedOutboundEvents[0].eventName).toBe("SendMessageRequested");
    expect((publishedOutboundEvents[0].payload as any).messageContent).toContain("Echo:");
    expect(conversationRepo.create).toHaveBeenCalledTimes(1);
    expect(messageRepo.create).toHaveBeenCalledTimes(1);
  });

  it("isolates tenants and does not execute outbound when the active agent belongs to another tenant", async () => {
    const conversationRepo = createConversationRepo();
    const messageRepo = createMessageRepo();
    const agentRepo = createAgentRepo("tenant-2", ["echo-capability"], AgentStatus.ACTIVE);
    capabilityRegistry.register(new EchoCapability(eventBus));

    const conversationService = new ConversationService(conversationRepo as any, messageRepo as any, eventBus as any);
    const orchestrator = new AgentOrchestrator(agentRepo as any, conversationRepo as any, messageRepo as any, { execute: vi.fn() } as any, eventBus as any, capabilityRegistry);

    eventBus.subscribe("MessageReceived", new ConversationMessageReceivedEventHandler(conversationService));
    eventBus.subscribe("MessageReceived", new AgentMessageReceivedEventHandler(orchestrator));

    registerWebhookController(app, {
      empresaRepository: {
        findByWebhookToken: async () => ({ id: "tenant-1", activo: true }),
      } as any,
      eventBus,
      normalizerService: normalizer,
    });

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/test-token",
      headers: { "content-type": "application/json" },
      payload: createWebhookPayload("msg-002", "user-2@s.whatsapp.net", "mensaje seguro"),
    });

    expect(response.statusCode).toBe(202);
    expect(publishedOutboundEvents).toHaveLength(0);
    expect(conversationRepo.create).toHaveBeenCalledTimes(1);
    expect(agentRepo.findByEmpresa).toHaveBeenCalledWith("tenant-1");
  });

  it("falls back to runtime when there are no registered capabilities and does not publish outbound events", async () => {
    const conversationRepo = createConversationRepo();
    const messageRepo = createMessageRepo();
    const agentRepo = createAgentRepo("tenant-1", [], AgentStatus.ACTIVE);
    const runtime = { execute: vi.fn(async () => ({ success: true, response: { output: "runtime fallback" } })) } as any;

    const conversationService = new ConversationService(conversationRepo as any, messageRepo as any, eventBus as any);
    const orchestrator = new AgentOrchestrator(agentRepo as any, conversationRepo as any, messageRepo as any, runtime, eventBus as any, capabilityRegistry);

    eventBus.subscribe("MessageReceived", new ConversationMessageReceivedEventHandler(conversationService));
    eventBus.subscribe("MessageReceived", new AgentMessageReceivedEventHandler(orchestrator));

    registerWebhookController(app, {
      empresaRepository: {
        findByWebhookToken: async () => ({ id: "tenant-1", activo: true }),
      } as any,
      eventBus,
      normalizerService: normalizer,
    });

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/test-token",
      headers: { "content-type": "application/json" },
      payload: createWebhookPayload("msg-003", "user-3@s.whatsapp.net", "fallback test"),
    });

    expect(response.statusCode).toBe(202);
    expect(runtime.execute).toHaveBeenCalledTimes(1);
    expect(publishedOutboundEvents).toHaveLength(0);
  });

  it("does not execute outbound when the tenant agent is inactive", async () => {
    const conversationRepo = createConversationRepo();
    const messageRepo = createMessageRepo();
    const agentRepo = createAgentRepo("tenant-1", ["echo-capability"], AgentStatus.DISABLED);
    capabilityRegistry.register(new EchoCapability(eventBus));

    const conversationService = new ConversationService(conversationRepo as any, messageRepo as any, eventBus as any);
    const orchestrator = new AgentOrchestrator(agentRepo as any, conversationRepo as any, messageRepo as any, { execute: vi.fn() } as any, eventBus as any, capabilityRegistry);

    eventBus.subscribe("MessageReceived", new ConversationMessageReceivedEventHandler(conversationService));
    eventBus.subscribe("MessageReceived", new AgentMessageReceivedEventHandler(orchestrator));

    registerWebhookController(app, {
      empresaRepository: {
        findByWebhookToken: async () => ({ id: "tenant-1", activo: true }),
      } as any,
      eventBus,
      normalizerService: normalizer,
    });

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/test-token",
      headers: { "content-type": "application/json" },
      payload: createWebhookPayload("msg-004", "user-4@s.whatsapp.net", "inactive agent"),
    });

    expect(response.statusCode).toBe(202);
    expect(publishedOutboundEvents).toHaveLength(0);
    expect(agentRepo.findByEmpresa).toHaveBeenCalledWith("tenant-1");
  });
});
