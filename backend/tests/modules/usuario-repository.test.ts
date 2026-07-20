import { afterEach, describe, expect, it } from "vitest";
import { PrismaUsuarioRepository } from "../../src/modules/usuario/infrastructure/prisma-usuario-repository";
import { prisma } from "../../src/shared/database/prisma";

const repository = new PrismaUsuarioRepository();

describe("Usuario Prisma repository", () => {
  const testId = `usuario-test-${Date.now()}`;
  const testEmpresaId = "empresa-test-1";

  afterEach(async () => {
    await prisma.membership.deleteMany({ where: { usuarioId: testId } });
    await prisma.usuario.deleteMany({ where: { id: testId } });
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
      nombre: "Usuario Test",
      email: "usuario-test@example.com",
      passwordHash: "hash-123",
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

    // create a role and membership to link usuario to empresa, then validate membership
    const role = await prisma.rol.create({ data: { id: `rol-${Date.now()}`, empresaId: testEmpresaId, tipo: "TENANT", nombre: `role-${Date.now()}`, descripcion: null, activo: true, createdAt: new Date(), updatedAt: new Date() } });
    await prisma.membership.create({ data: { id: `m-${Date.now()}`, usuarioId: testId, empresaId: testEmpresaId, rolId: role.id, activo: true, createdAt: new Date(), updatedAt: new Date() } });

    const memberships = await prisma.membership.findMany({ where: { usuarioId: testId } });
    expect(memberships.length).toBeGreaterThan(0);
  });
});
