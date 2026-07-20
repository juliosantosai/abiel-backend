import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../../src/app";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../src/shared/database/prisma";

/**
 * Integration Test: Complete Message Flow
 * 
 * Flow:
 * 1. POST webhook with message
 * 2. Webhook normalizes and publishes MessageReceived event
 * 3. ConversationMessageHandler persists message & creates conversation if needed
 * 4. AgentOrchestrator processes message (if agent exists)
 * 5. Verify message appears in database
 */

describe("Messaging Flow Integration", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp();
    // Ensure test tenant exists and cleanup any previous test data
    await prisma.empresa.upsert({
      where: { id: "empresa-1" },
      update: { webhookToken: "test-token", activo: true, updatedAt: new Date() },
      create: {
        id: "empresa-1",
        nombre: "Empresa Test",
        plan: "test-plan",
        activo: true,
        webhookToken: "test-token",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Remove any leftover conversations/messages from previous runs
    const testConversationIds = [
      "empresa-1:test-conv-001@s.whatsapp.net",
      "empresa-1:test-human-001@s.whatsapp.net",
      "empresa-1:test-corr-001@s.whatsapp.net",
    ];
    await prisma.message.deleteMany({ where: { conversationId: { in: testConversationIds } } });
    await prisma.conversation.deleteMany({ where: { id: { in: testConversationIds } } });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("should create conversation and persist message when webhook receives inbound message", async () => {
    const conversationId = "empresa-1:test-conv-001@s.whatsapp.net";
    const messageContent = "Integration test message payload";

    // Send webhook request
    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/test-token",
      headers: {
        "content-type": "application/json",
        "x-correlation-id": "integration-test-flow-001",
      },
      payload: {
        event: "messages.upsert",
        data: {
          id: "msg-integration-test-001",
          key: { remoteJid: "test-conv-001@s.whatsapp.net" },
          message: { conversation: messageContent },
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      },
    });

    // Verify webhook accepted the request
    expect(response.statusCode).toBe(202);
    const body = JSON.parse(response.payload) as Record<string, unknown>;
    expect(body.status).toBe("accepted");
    expect(body.correlationId).toBe("integration-test-flow-001");

    // Give event bus time to process handlers
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify conversation was created
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    expect(conversation).toBeDefined();
    expect(conversation?.empresaId).toBe("empresa-1");
    expect(conversation?.status).toBe("BOT_ACTIVE");

    // Verify message was persisted
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        empresaId: "empresa-1",
      },
      orderBy: { createdAt: "desc" },
    });
    expect(messages.length).toBeGreaterThan(0);
    const latestMessage = messages[0];
    expect(latestMessage.content).toBe(messageContent);
    expect(latestMessage.role).toBe("USER");
  });

  it("should NOT execute agent when conversation is in HUMAN_INTERVENTION state", async () => {
    const conversationId = "empresa-1:test-human-001@s.whatsapp.net";

    // First, create conversation with HUMAN_INTERVENTION state
    await prisma.conversation.create({
      data: {
        id: conversationId,
        empresaId: "empresa-1",
        clienteId: "test-user-human",
        status: "HUMAN_INTERVENTION",
        titulo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const messageContent = "Message during human intervention";

    // Send webhook request
    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/test-token",
      headers: {
        "content-type": "application/json",
        "x-correlation-id": "human-intervention-test-001",
      },
      payload: {
        event: "messages.upsert",
        data: {
          id: "msg-human-001",
          key: { remoteJid: "test-human-001@s.whatsapp.net" },
          message: { conversation: messageContent },
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      },
    });

    expect(response.statusCode).toBe(202);

    // Give event bus time to process
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify message was persisted
    const messages = await prisma.message.findMany({
      where: { conversationId, empresaId: "empresa-1" },
    });
    expect(messages.length).toBeGreaterThan(0);

    // Verify conversation is still in HUMAN_INTERVENTION (not changed by orchestrator)
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    expect(conversation?.status).toBe("HUMAN_INTERVENTION");
  });

  it("should use correlation ID from request header for traceability", async () => {
    const conversationId = "empresa-1:test-corr-001@s.whatsapp.net";
    const correlationId = "trace-test-correlationid-12345";

    const response = await app.inject({
      method: "POST",
      url: "/webhooks/whatsapp/test-token",
      headers: {
        "content-type": "application/json",
        "x-correlation-id": correlationId,
      },
      payload: {
        event: "messages.upsert",
        data: {
          id: "msg-corr-001",
          key: { remoteJid: "test-corr-001@s.whatsapp.net" },
          message: { conversation: "Correlation test" },
          messageTimestamp: Math.floor(Date.now() / 1000),
        },
      },
    });

    expect(response.statusCode).toBe(202);
    const body = JSON.parse(response.payload) as Record<string, unknown>;
    expect(body.correlationId).toBe(correlationId);
  });
});
