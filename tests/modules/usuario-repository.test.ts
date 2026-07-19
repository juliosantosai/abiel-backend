import { afterEach, describe, expect, it } from "vitest";
import { PrismaUsuarioRepository } from "../../src/modules/usuario/infrastructure/prisma-usuario-repository";
import { prisma } from "../../src/shared/database/prisma";

const repository = new PrismaUsuarioRepository();

describe("Usuario Prisma repository", () => {
  const testId = `usuario-test-${Date.now()}`;
  const testEmpresaId = "empresa-test-1";

  afterEach(async () => {
    await prisma.usuario.deleteMany({ where: { empresaId: testEmpresaId } });
    await prisma.empresa.deleteMany({ where: { id: testEmpresaId } });
  });

  it("creates, reads and updates a usuario and queries by empresaId", async () => {
    await prisma.empresa.create({
      data: {
        id: testEmpresaId,
        nombre: "Empresa Test",
        plan: "STARTER",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const created = await repository.create({
      id: testId,
      empresaId: testEmpresaId,
      nombre: "Usuario Test",
      email: "usuario-test@example.com",
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(created).toMatchObject({
      id: testId,
      empresaId: testEmpresaId,
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

    const foundByEmpresa = await repository.findByEmpresaId(testEmpresaId);
    expect(foundByEmpresa.some((item) => item.id === testId)).toBe(true);

    const foundByIdAndEmpresa = await repository.findByIdAndEmpresaId(testId, testEmpresaId);
    expect(foundByIdAndEmpresa).not.toBeNull();
    expect(foundByIdAndEmpresa?.empresaId).toBe(testEmpresaId);
  });
});
