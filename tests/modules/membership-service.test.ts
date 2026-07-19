import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "../../src/shared/database/prisma";
import { PrismaMembershipRepository } from "../../src/modules/usuario/infrastructure/prisma-membership-repository";
import { PrismaUsuarioRepository } from "../../src/modules/usuario/infrastructure/prisma-usuario-repository";
import { PrismaRoleRepository } from "../../src/modules/roles/infrastructure/prisma-role-repository";
import { MembershipService } from "../../src/modules/usuario/application/membership-service";
import { generateUuid } from "../../src/shared/utils/uuid";


describe("MembershipService", () => {
  const testEmpresaA = `empresa-test-a-${Date.now()}`;
  const testEmpresaB = `empresa-test-b-${Date.now()}`;
  const testUsuarioId = `usuario-test-${Date.now()}`;

  beforeEach(async () => {
    await prisma.empresa.create({ data: { id: testEmpresaA, nombre: "A", plan: "basic", activo: true, createdAt: new Date(), updatedAt: new Date() } });
    await prisma.empresa.create({ data: { id: testEmpresaB, nombre: "B", plan: "basic", activo: true, createdAt: new Date(), updatedAt: new Date() } });

    await prisma.usuario.create({ data: { id: testUsuarioId, nombre: "Usuario Test", email: `${testUsuarioId}@example.com`, passwordHash: "hash", activo: true, createdAt: new Date(), updatedAt: new Date() } });
  });

  afterEach(async () => {
    await prisma.membership.deleteMany({ where: { usuarioId: testUsuarioId } });
    await prisma.usuario.deleteMany({ where: { id: testUsuarioId } });
    await prisma.rol.deleteMany({ where: { nombre: { startsWith: "test-role-" } } });
    await prisma.empresa.deleteMany({ where: { id: { in: [testEmpresaA, testEmpresaB] } } });
  });

  it("prevents a user from Empresa A receiving a TENANT role from Empresa B", async () => {
    const roleRepo = new PrismaRoleRepository();
    const usuarioRepo = new PrismaUsuarioRepository();
    const membershipRepo = new PrismaMembershipRepository();
    const empresaFinder = { findById: async (id: string) => prisma.empresa.findUnique({ where: { id } }) };
    const service = new MembershipService(membershipRepo, usuarioRepo, roleRepo, empresaFinder as any);

    const tenantRoleId = generateUuid();
    await prisma.rol.create({ data: { id: tenantRoleId, empresaId: testEmpresaB, tipo: "TENANT", nombre: `test-role-tenant-${Date.now()}`, descripcion: null, activo: true, createdAt: new Date(), updatedAt: new Date() } });

    // First, create a membership for usuario in Empresa A
    const existingMembershipId = generateUuid();
    await prisma.membership.create({ data: { id: existingMembershipId, usuarioId: testUsuarioId, empresaId: testEmpresaA, rolId: tenantRoleId, activo: true, createdAt: new Date(), updatedAt: new Date() } });

    // Attempt to create membership in Empresa B should fail
    await expect(service.crearMembership({ usuarioId: testUsuarioId, empresaId: testEmpresaB, rolId: tenantRoleId })).rejects.toThrow();
  });

  it("allows a user to receive a GLOBAL role", async () => {
    const roleRepo = new PrismaRoleRepository();
    const usuarioRepo = new PrismaUsuarioRepository();
    const membershipRepo = new PrismaMembershipRepository();
    const empresaFinder = { findById: async (id: string) => prisma.empresa.findUnique({ where: { id } }) };
    const service = new MembershipService(membershipRepo, usuarioRepo, roleRepo, empresaFinder as any);

    const globalRoleId = generateUuid();
    await prisma.rol.create({ data: { id: globalRoleId, empresaId: null, tipo: "GLOBAL", nombre: `test-role-global-${Date.now()}`, descripcion: null, activo: true, createdAt: new Date(), updatedAt: new Date() } });

    const created = await service.crearMembership({ usuarioId: testUsuarioId, empresaId: "global", rolId: globalRoleId });
    expect(created).toHaveProperty("id");
  });

  it("does not allow duplicate memberships for same user and company", async () => {
    const roleRepo = new PrismaRoleRepository();
    const usuarioRepo = new PrismaUsuarioRepository();
    const membershipRepo = new PrismaMembershipRepository();
    const empresaFinder = { findById: async (id: string) => prisma.empresa.findUnique({ where: { id } }) };
    const service = new MembershipService(membershipRepo, usuarioRepo, roleRepo, empresaFinder as any);

    const tenantRoleId = generateUuid();
    await prisma.rol.create({ data: { id: tenantRoleId, empresaId: testEmpresaA, tipo: "TENANT", nombre: `test-role-dup-${Date.now()}`, descripcion: null, activo: true, createdAt: new Date(), updatedAt: new Date() } });

    await service.crearMembership({ usuarioId: testUsuarioId, empresaId: testEmpresaA, rolId: tenantRoleId });
    await expect(service.crearMembership({ usuarioId: testUsuarioId, empresaId: testEmpresaA, rolId: tenantRoleId })).rejects.toThrow();
  });

  it("does not allow assigning a non-existent role", async () => {
    const roleRepo = new PrismaRoleRepository();
    const usuarioRepo = new PrismaUsuarioRepository();
    const membershipRepo = new PrismaMembershipRepository();
    const empresaFinder = { findById: async (id: string) => prisma.empresa.findUnique({ where: { id } }) };
    const service = new MembershipService(membershipRepo, usuarioRepo, roleRepo, empresaFinder as any);

    await expect(service.crearMembership({ usuarioId: testUsuarioId, empresaId: testEmpresaA, rolId: "non-existent-role" })).rejects.toThrow("Rol no encontrado");
  });
});
