import { describe, it, expect } from "vitest";
import { createAuthInfrastructure } from "../../src/modules/auth/infrastructure/auth-infrastructure-factory";
import { TokenValidationError, UnauthorizedError } from "../../src/shared/errors/auth-errors";

describe("AuthService.resolveIdentity (noop)", () => {
  const { authService } = createAuthInfrastructure();

  it("returns full AuthenticatedUser for valid token", async () => {
    const token = JSON.stringify({ usuarioId: "u1", empresaId: "e1", membershipId: "m1", email: "u1@x.com", roles: ["user"], permisos: ["read"], activo: true, membershipActive: true });
    const identity = await authService.resolveIdentity(token);
    expect(identity.usuarioId).toBe("u1");
    expect(identity.empresaId).toBe("e1");
    expect(identity.membershipId).toBe("m1");
    expect(identity.permisos).toEqual(["read"]);
  });

  it("throws for user without membership", async () => {
    const token = JSON.stringify({ usuarioId: "u2", empresaId: null, membershipId: null, email: "u2@x.com", roles: ["user"], permisos: ["read"], activo: true, membershipActive: true });
    await expect(authService.resolveIdentity(token)).rejects.toThrow(UnauthorizedError);
  });

  it("throws for suspended user", async () => {
    const token = JSON.stringify({ usuarioId: "u3", empresaId: "e3", membershipId: "m3", email: "u3@x.com", roles: ["user"], permisos: ["read"], activo: false, membershipActive: true });
    await expect(authService.resolveIdentity(token)).rejects.toThrow(UnauthorizedError);
  });

  it("loads permissions correctly", async () => {
    const token = JSON.stringify({ usuarioId: "u4", empresaId: "e4", membershipId: "m4", email: "u4@x.com", roles: ["admin"], permisos: ["read", "write"], activo: true, membershipActive: true });
    const identity = await authService.resolveIdentity(token);
    expect(identity.permisos).toEqual(["read", "write"]);
  });
});
