import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { PrismaConversationRepository } from "../../src/modules/conversacion/infrastructure/prisma-conversation-repository";
import { ConversationStatus } from "../../src/modules/conversacion/domain/conversation-status";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

describe("Conversation Prisma repository", () => {
  const repository = new PrismaConversationRepository();

  beforeAll(() => {
    ensurePrismaSchema();
  });

  afterEach(async () => {
    await prisma.message.deleteMany({ where: { id: { startsWith: "msg-conv-repo-test-" } } });
    await prisma.conversation.deleteMany({ where: { id: { startsWith: "conv-repo-test-" } } });
    await prisma.empresa.deleteMany({ where: { id: { startsWith: "empresa-conv-repo-test-" } } });
  });

  it("saves and retrieves a conversation within the tenant scope", async () => {
    const empresa = await prisma.empresa.create({
      data: {
        id: "empresa-conv-repo-test-1",
        nombre: "Empresa Conv 1",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const created = await repository.create({
      id: "conv-repo-test-1",
      empresaId: empresa.id,
      usuarioId: "cliente-conv-repo-test-1",
      titulo: "Hola",
      estado: ConversationStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(created.id).toBe("conv-repo-test-1");
    expect(created.empresaId).toBe(empresa.id);

    const byId = await repository.findById("conv-repo-test-1", empresa.id);
    expect(byId).not.toBeNull();
    expect(byId?.estado).toBe(ConversationStatus.OPEN);
  });

  it("returns null for a conversation from another tenant", async () => {
    const empresaA = await prisma.empresa.create({
      data: {
        id: "empresa-conv-repo-test-a",
        nombre: "Empresa A",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const empresaB = await prisma.empresa.create({
      data: {
        id: "empresa-conv-repo-test-b",
        nombre: "Empresa B",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await repository.create({
      id: "conv-repo-test-2",
      empresaId: empresaA.id,
      usuarioId: "cliente-conv-repo-test-2",
      titulo: "Privada",
      estado: ConversationStatus.CLOSED,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const byOtherTenant = await repository.findById("conv-repo-test-2", empresaB.id);
    expect(byOtherTenant).toBeNull();
  });
});
