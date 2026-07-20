import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../src/shared/database/prisma";
import { createAuthInfrastructure } from "../../src/modules/auth/infrastructure/auth-infrastructure-factory";
import { generateUuid } from "../../src/shared/utils/uuid";

describe("DatabaseAuthService", () => {
  const { authService, tokenService } = createAuthInfrastructure();

  beforeAll(async () => {
    // clean relevant tables in safe order (FK-aware)
    await prisma.rolPermiso.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.permiso.deleteMany();
    await prisma.rol.deleteMany();
    await prisma.empresa.deleteMany();
    await prisma.usuario.deleteMany();
  });

  afterAll(async () => {
    await prisma.rolPermiso.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.permiso.deleteMany();
    await prisma.rol.deleteMany();
    await prisma.empresa.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.$disconnect();
  });

  it("returns identity for active user with active membership", async () => {
    const userId = generateUuid();
    const empresaId = "empresa-db-1";
    const rolId = generateUuid();
    const permisoId = generateUuid();

    await prisma.usuario.create({ data: { id: userId, nombre: "u1", email: "u1@x.com", passwordHash: "x", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    await prisma.empresa.create({ data: { id: empresaId, nombre: "Emp 1", activo: true, plan: "free", createdAt: new Date(), updatedAt: new Date() } });
    await prisma.rol.create({ data: { id: rolId, empresaId: empresaId, tipo: "TENANT", nombre: "tenant-role", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    await prisma.permiso.create({ data: { id: permisoId, nombre: "Read", slug: "read", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    await prisma.rolPermiso.create({ data: { id: `${rolId}-${permisoId}`, rolId, permisoId, activo: true, createdAt: new Date(), updatedAt: new Date() } });
    const membership = await prisma.membership.create({ data: { id: generateUuid(), usuarioId: userId, empresaId, rolId, activo: true, createdAt: new Date(), updatedAt: new Date() } });

    const token = tokenService.generate({ usuarioId: userId, empresaId, membershipId: membership.id, iat: Date.now(), exp: Date.now() + 10000 });
    const identity = await authService.resolveIdentity(token);

    expect(identity.usuarioId).toBe(userId);
    expect(identity.membershipId).toBe(membership.id);
    expect(identity.permisos).toContain("read");
  });

  it("throws when user without membership", async () => {
    const userId = generateUuid();
    await prisma.usuario.create({ data: { id: userId, nombre: "u2", email: "u2@x.com", passwordHash: "x", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    const token = tokenService.generate({ usuarioId: userId, empresaId: "no-exists", membershipId: null, iat: Date.now(), exp: Date.now() + 10000 });
    await expect(authService.resolveIdentity(token)).rejects.toThrow();
  });

  it("throws when user is suspended", async () => {
    const userId = generateUuid();
    const empresaId = "empresa-db-3";
    const rolId = generateUuid();
    await prisma.usuario.create({ data: { id: userId, nombre: "u3", email: "u3@x.com", passwordHash: "x", activo: false, createdAt: new Date(), updatedAt: new Date() } });
    await prisma.empresa.create({ data: { id: empresaId, nombre: "Emp 3", activo: true, plan: "free", createdAt: new Date(), updatedAt: new Date() } });
    await prisma.rol.create({ data: { id: rolId, empresaId, tipo: "TENANT", nombre: "r3", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    await prisma.membership.create({ data: { id: generateUuid(), usuarioId: userId, empresaId, rolId, activo: true, createdAt: new Date(), updatedAt: new Date() } });
    const token = tokenService.generate({ usuarioId: userId, empresaId, membershipId: null, iat: Date.now(), exp: Date.now() + 10000 });
    await expect(authService.resolveIdentity(token)).rejects.toThrow();
  });

  it("user of empresa A cannot resolve for empresa B", async () => {
    const userId = generateUuid();
    const empresaA = "empresa-A";
    const empresaB = "empresa-B";
    const rolId = generateUuid();
    await prisma.usuario.create({ data: { id: userId, nombre: "u4", email: "u4@x.com", passwordHash: "x", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    await prisma.empresa.create({ data: { id: empresaA, nombre: "Emp A", activo: true, plan: "free", createdAt: new Date(), updatedAt: new Date() } });
    await prisma.empresa.create({ data: { id: empresaB, nombre: "Emp B", activo: true, plan: "free", createdAt: new Date(), updatedAt: new Date() } });
    await prisma.rol.create({ data: { id: rolId, empresaId: empresaA, tipo: "TENANT", nombre: "r4", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    await prisma.membership.create({ data: { id: generateUuid(), usuarioId: userId, empresaId: empresaA, rolId, activo: true, createdAt: new Date(), updatedAt: new Date() } });
    const token = tokenService.generate({ usuarioId: userId, empresaId: empresaB, membershipId: null, iat: Date.now(), exp: Date.now() + 10000 });
    await expect(authService.resolveIdentity(token)).rejects.toThrow();
  });
});
