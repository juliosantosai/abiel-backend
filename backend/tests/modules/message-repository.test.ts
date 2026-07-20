import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { PrismaConversationRepository } from "../../src/modules/conversacion/infrastructure/prisma-conversation-repository";
import { PrismaMessageRepository } from "../../src/modules/conversacion/infrastructure/prisma-message-repository";
import { ConversationStatus } from "../../src/modules/conversacion/domain/conversation-status";
import { MessageRole } from "../../src/modules/conversacion/domain/message-role";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

describe("Message Prisma repository", () => {
  const conversationRepository = new PrismaConversationRepository();
  const repository = new PrismaMessageRepository();

  beforeAll(() => {
    ensurePrismaSchema();
  });

  afterEach(async () => {
    await prisma.message.deleteMany({ where: { id: { startsWith: "msg-repo-test-" } } });
    await prisma.conversation.deleteMany({ where: { id: { startsWith: "conv-repo-test-" } } });
    await prisma.empresa.deleteMany({ where: { id: { startsWith: "empresa-msg-repo-test-" } } });
  });

  it("saves and lists messages for a single conversation and tenant", async () => {
    const empresa = await prisma.empresa.create({
      data: {
        id: "empresa-msg-repo-test-1",
        nombre: "Empresa Msg 1",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const conversation = await conversationRepository.create({
      id: "conv-repo-test-3",
      empresaId: empresa.id,
      usuarioId: "cliente-msg-repo-test-1",
      titulo: "Conversación",
      estado: ConversationStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await repository.create({
      id: "msg-repo-test-1",
      conversationId: conversation.id,
      empresaId: empresa.id,
      usuarioId: "cliente-msg-repo-test-1",
      contenido: "Hola",
      rol: MessageRole.USER,
      createdAt: new Date(),
    });

    expect(created.id).toBe("msg-repo-test-1");

    const messages = await repository.findByConversationId(conversation.id, empresa.id);
    expect(messages).toHaveLength(1);
    expect(messages[0]?.contenido).toBe("Hola");
  });

  it("never returns messages from another tenant", async () => {
    const empresaA = await prisma.empresa.create({
      data: {
        id: "empresa-msg-repo-test-a",
        nombre: "Empresa A",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const empresaB = await prisma.empresa.create({
      data: {
        id: "empresa-msg-repo-test-b",
        nombre: "Empresa B",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const conversation = await conversationRepository.create({
      id: "conv-repo-test-4",
      empresaId: empresaA.id,
      usuarioId: "cliente-msg-repo-test-2",
      titulo: "Privada",
      estado: ConversationStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await repository.create({
      id: "msg-repo-test-2",
      conversationId: conversation.id,
      empresaId: empresaA.id,
      usuarioId: "cliente-msg-repo-test-2",
      contenido: "Secreto",
      rol: MessageRole.USER,
      createdAt: new Date(),
    });

    const messages = await repository.findByConversationId(conversation.id, empresaB.id);
    expect(messages).toEqual([]);
  });
});
