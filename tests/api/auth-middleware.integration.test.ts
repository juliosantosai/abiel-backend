import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import { createAuthMiddleware } from "../../src/api/middleware/auth-middleware";
import { NoopTokenService } from "../../src/modules/auth/infrastructure/noop-token-service";
import { NoopAuthService } from "../../src/modules/auth/infrastructure/noop-auth-service";
import { NoopAuthContextFactory } from "../../src/modules/auth/infrastructure/noop-auth-context-factory";

class DummyService {
  async resolveIdentity(token: string) {
    if (token !== "valid") throw new Error("invalid");
    return {
      usuarioId: "user-1",
      empresaId: "empresa-1",
      membershipId: "m1",
      activo: true,
      membershipActive: true,
      rolIds: ["rol-1"],
      permisos: ["read"],
      roles: ["user"],
    };
  }
}

describe("Auth middleware integration-style", () => {
  it("passes request with valid bearer token", async () => {
    const tokenService = new NoopTokenService();
    const authService = new DummyService() as any;
    const authContextFactory = new NoopAuthContextFactory();
    const middleware = createAuthMiddleware({ tokenService: tokenService as any, authService, authContextFactory });

    const app = Fastify();
    app.addHook("preHandler", middleware);
    app.get("/secure", async (request) => ({ tenantContext: (request as any).tenantContext }));

    const response = await app.inject({ method: "GET", url: "/secure", headers: { authorization: "Bearer valid" } });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.tenantContext).toEqual(expect.objectContaining({ empresaId: "empresa-1", usuarioId: "user-1" }));
    await app.close();
  });
});
