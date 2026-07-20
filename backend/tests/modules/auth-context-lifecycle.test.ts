import { describe, it, expect } from "vitest";
import { NoopAuthContextFactory } from "../../src/modules/auth/infrastructure/noop-auth-context-factory";
import { TenantContext } from "../../src/shared/context/tenant-context";

const makeUser = (overrides: Partial<Record<string, any>> = {}) => ({
  usuarioId: "user-1",
  email: "user1@abiel.com",
  activo: true,
  membershipId: "membership-1",
  empresaId: "empresa-a",
  membershipActive: true,
  rolIds: ["rol-1"],
  permisos: ["CLIENT_CREATE"],
  ...overrides,
});

describe("AuthContextFactory lifecycle", () => {
  it("creates a valid TenantContext for a user with active membership", async () => {
    const factory = new NoopAuthContextFactory();
    const user = makeUser();

    const context = await factory.buildContext(user);

    expect(context).toBeInstanceOf(TenantContext);
    expect(context.usuarioId).toBe(user.usuarioId);
    expect(context.empresaId).toBe(user.empresaId);
    expect(context.membershipId).toBe(user.membershipId);
    expect(context.rolIds).toEqual(["rol-1"]);
    expect(context.permisos).toEqual(["CLIENT_CREATE"]);
    expect(context.isGlobalTenant).toBe(false);
  });

  it("denies TenantContext creation for a user without membership", async () => {
    const factory = new NoopAuthContextFactory();
    const user = makeUser({ membershipId: null, empresaId: null, membershipActive: false });

    await expect(factory.buildContext(user)).rejects.toThrow();
  });

  it("creates TenantContext for a user belonging to a different tenant if the authenticated membership is valid", async () => {
    const factory = new NoopAuthContextFactory();
    const user = makeUser({ empresaId: "empresa-b", membershipId: "membership-b" });

    const context = await factory.buildContext(user);

    expect(context.empresaId).toBe("empresa-b");
    expect(context.membershipId).toBe("membership-b");
  });

  it("creates read-only TenantContext arrays", async () => {
    const factory = new NoopAuthContextFactory();
    const user = makeUser();

    const context = await factory.buildContext(user);

    expect(Object.isFrozen(context.rolIds)).toBe(true);
    expect(Object.isFrozen(context.permisos)).toBe(true);
  });

  it("creates a valid TenantContext for a GLOBAL user", async () => {
    const factory = new NoopAuthContextFactory();
    const user = makeUser({ empresaId: "global", membershipActive: true, permisos: ["AGENT_CREATE"] });

    const context = await factory.buildContext(user);

    expect(context.isGlobalTenant).toBe(true);
    expect(context.permisos).toContain("AGENT_CREATE");
  });

  it("denies TenantContext creation for an invalid membership", async () => {
    const factory = new NoopAuthContextFactory();
    const user = makeUser({ membershipActive: false });

    await expect(factory.buildContext(user)).rejects.toThrow("Membership is not active");
  });

  it("denies TenantContext creation when permissions are missing", async () => {
    const factory = new NoopAuthContextFactory();
    const user = makeUser({ permisos: [] });

    await expect(factory.buildContext(user)).rejects.toThrow();
  });
});
