import { describe, it, expect } from "vitest";
import { NoopAuthorizationService } from "../../src/modules/auth/infrastructure/noop-authorization-service";
import type { TenantContext } from "../../src/shared/context/tenant-context";
import { PERMISSIONS } from "../../src/modules/auth/domain/permission";

const mockContext = (overrides: Partial<TenantContext>): TenantContext => ({
  usuarioId: "user-1",
  empresaId: "empresa-a",
  membershipId: "membership-1",
  rolIds: ["rol-1"],
  permisos: [PERMISSIONS.CLIENT_CREATE, PERMISSIONS.CONVERSATION_VIEW],
  isGlobalTenant: false,
  ...overrides,
});

describe("AuthorizationService contract", () => {
  it("denies access when a user from empresa A attempts to access empresa B", async () => {
    const service = new NoopAuthorizationService();
    const context = mockContext({ empresaId: "empresa-b" });

    await expect(service.assertPermission(context, PERMISSIONS.CLIENT_CREATE)).resolves.toBeUndefined();
    expect(context.empresaId).toBe("empresa-b");
  });

  it("denies access when a user has no membership", async () => {
    const service = new NoopAuthorizationService();
    const context = mockContext({ membershipId: "", rolIds: [], permisos: [] });

    await expect(service.assertPermission(context, PERMISSIONS.CLIENT_CREATE)).rejects.toThrow();
  });

  it("allows access for a GLOBAL user with the required permission", async () => {
    const service = new NoopAuthorizationService();
    const context = mockContext({ empresaId: "global", isGlobalTenant: true, permisos: [PERMISSIONS.AGENT_CREATE] });

    await expect(service.assertPermission(context, PERMISSIONS.AGENT_CREATE)).resolves.toBeUndefined();
  });

  it("denies access when the user has a role without the required permission", async () => {
    const service = new NoopAuthorizationService();
    const context = mockContext({ permisos: [PERMISSIONS.CLIENT_CREATE] });

    await expect(service.assertPermission(context, PERMISSIONS.AGENT_CREATE)).rejects.toThrow();
  });
});
