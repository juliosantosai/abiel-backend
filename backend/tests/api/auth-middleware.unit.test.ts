import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAuthMiddleware } from "../../src/api/middleware/auth-middleware";
import { TokenValidationError, UnauthorizedError } from "../../src/shared/errors/auth-errors";
import { TenantContext } from "../../src/shared/context/tenant-context";

describe("Auth middleware unit tests", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
  });

  it("injects default tenant context when Authorization header is missing in test env", async () => {
    process.env.NODE_ENV = "test";
    const tokenService = { verify: vi.fn() } as any;
    const authService = { resolveIdentity: vi.fn() } as any;
    const authContextFactory = { buildContext: vi.fn() } as any;

    const middleware = createAuthMiddleware({ tokenService, authService, authContextFactory });
    const request = { headers: {} } as any;
    const reply = {} as any;

    await expect(middleware(request, reply)).resolves.toBeUndefined();
    expect(request.authContext).toBeDefined();
    expect(request.tenantContext).toBeInstanceOf(TenantContext);
    expect(authService.resolveIdentity).not.toHaveBeenCalled();
  });

  it("throws TokenValidationError when Authorization header is missing outside test env", async () => {
    process.env.NODE_ENV = "production";
    const tokenService = { verify: vi.fn() } as any;
    const authService = { resolveIdentity: vi.fn() } as any;
    const authContextFactory = { buildContext: vi.fn() } as any;

    const middleware = createAuthMiddleware({ tokenService, authService, authContextFactory });
    const request = { headers: {} } as any;
    const reply = {} as any;

    await expect(middleware(request, reply)).rejects.toBeInstanceOf(TokenValidationError);
  });

  it("throws TokenValidationError for malformed Authorization header", async () => {
    const tokenService = { verify: vi.fn() } as any;
    const authService = { resolveIdentity: vi.fn() } as any;
    const authContextFactory = { buildContext: vi.fn() } as any;
    const middleware = createAuthMiddleware({ tokenService, authService, authContextFactory });

    const request = { headers: { authorization: "BadHeader value" } } as any;
    const reply = {} as any;

    await expect(middleware(request, reply)).rejects.toBeInstanceOf(TokenValidationError);
  });

  it("throws TokenValidationError when authService.resolveIdentity fails", async () => {
    const tokenService = { verify: vi.fn() } as any;
    const authService = { resolveIdentity: vi.fn().mockRejectedValue(new Error("invalid token")) } as any;
    const authContextFactory = { buildContext: vi.fn() } as any;
    const middleware = createAuthMiddleware({ tokenService, authService, authContextFactory });

    const request = { headers: { authorization: "Bearer invalid" } } as any;
    const reply = {} as any;

    await expect(middleware(request, reply)).rejects.toBeInstanceOf(TokenValidationError);
  });

  it("throws UnauthorizedError when authContextFactory rejects", async () => {
    const tokenService = { verify: vi.fn() } as any;
    const authService = { resolveIdentity: vi.fn().mockResolvedValue({ usuarioId: "user-1" }) } as any;
    const authContextFactory = { buildContext: vi.fn().mockRejectedValue(new Error("no context")) } as any;
    const middleware = createAuthMiddleware({ tokenService, authService, authContextFactory });

    const request = { headers: { authorization: "Bearer valid-token" } } as any;
    const reply = {} as any;

    await expect(middleware(request, reply)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("attaches authContext and tenantContext for valid tokens", async () => {
    const tokenService = { verify: vi.fn() } as any;
    const authService = { resolveIdentity: vi.fn().mockResolvedValue({ usuarioId: "user-1", empresaId: "empresa-1", membershipId: "m1" }) } as any;
    const tenantContext = TenantContext.create({ usuarioId: "user-1", empresaId: "empresa-1", membershipId: "m1", rolIds: ["rol-1"], permisos: ["read"], isGlobalTenant: false });
    const authContextFactory = { buildContext: vi.fn().mockResolvedValue(tenantContext) } as any;
    const middleware = createAuthMiddleware({ tokenService, authService, authContextFactory });

    const request = { headers: { authorization: "Bearer valid-token" } } as any;
    const reply = {} as any;

    await middleware(request, reply);

    expect(request.authContext).toEqual({ usuarioId: "user-1", empresaId: "empresa-1", membershipId: "m1" });
    expect(request.tenantContext).toBe(tenantContext);
    expect(authService.resolveIdentity).toHaveBeenCalledWith("valid-token");
    expect(authContextFactory.buildContext).toHaveBeenCalledWith({ usuarioId: "user-1", empresaId: "empresa-1", membershipId: "m1" });
  });
});
