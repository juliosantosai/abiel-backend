import { afterEach, describe, expect, it } from "vitest";
import { PrismaUsuarioRepository } from "../../src/modules/usuario/infrastructure/prisma-usuario-repository";
import { prisma } from "../../src/shared/database/prisma";

const repository = new PrismaUsuarioRepository();

describe("Usuario Prisma repository", () => {
  const testId = `usuario-test-${Date.now()}`;

  afterEach(async () => {
    await prisma.usuario.deleteMany({ where: { id: testId } });
  });

  it("creates, reads, updates and deletes a usuario", async () => {
    const created = await repository.create({
      id: testId,
      nombre: "Usuario Test",
      email: "usuario-test@example.com",
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(created).toMatchObject({
      id: testId,
      nombre: "Usuario Test",
      email: "usuario-test@example.com",
      activo: true,
    });

    const found = await repository.findById(testId);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(testId);

    const updated = await repository.update(testId, {
      nombre: "Usuario Test Updated",
      activo: false,
    });

    expect(updated).not.toBeNull();
    expect(updated?.nombre).toBe("Usuario Test Updated");
    expect(updated?.activo).toBe(false);

    await repository.delete(testId);

    const deleted = await repository.findById(testId);
    expect(deleted).toBeNull();
  });
});
