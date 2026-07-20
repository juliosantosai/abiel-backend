import { describe, expect, it, vi } from "vitest";
import { DatabaseAuthService } from "../../src/modules/auth/infrastructure/database-auth-service";
import { UnauthorizedError, TokenValidationError } from "../../src/shared/errors/auth-errors";

function createTokenService() {
  return {
    generate: vi.fn((payload: any) => JSON.stringify(payload)),
    verify: vi.fn((token: string) => JSON.parse(token)),
  };
}

describe("DatabaseAuthService (unit)", () => {
  it("logs in active user with valid membership", async () => {
    const tokenService = createTokenService();
    const usuarioRepository = { findByEmail: vi.fn(async () => ({ id: "u1", email: "u1@x.com", passwordHash: "secret", activo: true })) };
    const membershipRepository = { findByUsuarioId: vi.fn(async () => [{ id: "m1", empresaId: "e1", rolId: "r1", activo: true }]) };
    const roleRepository = { findById: vi.fn(async () => ({ id: "r1", activo: true })), findAllPermisos: vi.fn(async () => []), findRolPermisoByRolAndPermiso: vi.fn() };
    const service = new DatabaseAuthService(tokenService as any, usuarioRepository as any, membershipRepository as any, roleRepository as any);

    const result = await service.login({ email: "u1@x.com", password: "secret" });

    expect(result.user.email).toBe("u1@x.com");
    expect(result.membershipId).toBe("m1");
    expect(tokenService.generate).toHaveBeenCalled();
  });

  it("rejects login for wrong password", async () => {
    const tokenService = createTokenService();
    const usuarioRepository = { findByEmail: vi.fn(async () => ({ id: "u1", email: "u1@x.com", passwordHash: "secret", activo: true })) };
    const membershipRepository = { findByUsuarioId: vi.fn(async () => [{ id: "m1", empresaId: "e1", rolId: "r1", activo: true }]) };
    const roleRepository = { findById: vi.fn(), findAllPermisos: vi.fn(), findRolPermisoByRolAndPermiso: vi.fn() };
    const service = new DatabaseAuthService(tokenService as any, usuarioRepository as any, membershipRepository as any, roleRepository as any);

    await expect(service.login({ email: "u1@x.com", password: "wrong" })).rejects.toThrow(UnauthorizedError);
  });

  it("rejects resolveIdentity when token is invalid", async () => {
    const tokenService = { generate: vi.fn(), verify: vi.fn(() => { throw new Error("bad token"); }) };
    const service = new DatabaseAuthService(tokenService as any, {} as any, {} as any, {} as any);
    await expect(service.resolveIdentity("bad-token")).rejects.toThrow(TokenValidationError);
  });

  it("rejects resolveIdentity when user is not found", async () => {
    const tokenService = createTokenService();
    const usuarioRepository = { findById: vi.fn(async () => null) };
    const membershipRepository = { findByUsuarioAndEmpresa: vi.fn(async () => ({ id: "m1", empresaId: "e1", rolId: "r1", activo: true })) };
    const roleRepository = { findById: vi.fn(), findAllPermisos: vi.fn(), findRolPermisoByRolAndPermiso: vi.fn() };
    const service = new DatabaseAuthService(tokenService as any, usuarioRepository as any, membershipRepository as any, roleRepository as any);

    const token = JSON.stringify({ usuarioId: "u1", empresaId: "e1", membershipId: "m1" });
    await expect(service.resolveIdentity(token)).rejects.toThrow(UnauthorizedError);
  });

  it("loads permissions from role repository when role is active", async () => {
    const tokenService = createTokenService();
    const usuarioRepository = { findById: vi.fn(async () => ({ id: "u1", email: "user@e.com", activo: true })) };
    const membershipRepository = { findByUsuarioAndEmpresa: vi.fn(async () => ({ id: "m1", empresaId: "e1", rolId: "r1", activo: true })) };
    const roleRepository = {
      findById: vi.fn(async () => ({ id: "r1", activo: true })),
      findAllPermisos: vi.fn(async () => [{ id: "p1", slug: "read" }]),
      findRolPermisoByRolAndPermiso: vi.fn(async () => ({ id: "rel-1" })),
    };
    const service = new DatabaseAuthService(tokenService as any, usuarioRepository as any, membershipRepository as any, roleRepository as any);

    const token = JSON.stringify({ usuarioId: "u1", empresaId: "e1", membershipId: "m1" });
    const identity = await service.resolveIdentity(token);

    expect(identity.permisos).toEqual(["read"]);
  });
});
