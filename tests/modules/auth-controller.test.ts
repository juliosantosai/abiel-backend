import { describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import { AuthController } from "../../src/modules/auth/presentation/auth-controller";
import { NoopTokenService } from "../../src/modules/auth/infrastructure/noop-token-service";

function createApp(authService: any, tokenService: any) {
  const app = Fastify();
  const controller = new AuthController(tokenService, authService);

  app.post("/auth/login", controller.login.bind(controller));
  app.post("/auth/verify", controller.verify.bind(controller));

  return app;
}

describe("AuthController", () => {
  it("returns a token for valid login", async () => {
    const tokenService = new NoopTokenService();
    const authService = {
      login: vi.fn(async () => ({ token: tokenService.generate({ usuarioId: "u1", empresaId: "e1", membershipId: "m1" }), user: { usuarioId: "u1", email: "u1@x.com" } })),
      validateToken: vi.fn(),
      resolveIdentity: vi.fn(),
    };

    const app = createApp(authService, tokenService);
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      headers: { "content-type": "application/json" },
      payload: { email: "u1@x.com", password: "secret" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as any;
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe("u1@x.com");
    expect(authService.login).toHaveBeenCalled();
  });

  it("returns 400 when login payload is missing fields", async () => {
    const tokenService = new NoopTokenService();
    const authService = { login: vi.fn() };
    const app = createApp(authService, tokenService);

    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      headers: { "content-type": "application/json" },
      payload: { email: "", password: "" },
    });

    expect(response.statusCode).toBe(400);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("verifies token payload successfully", async () => {
    const tokenService = new NoopTokenService();
    const authService = { login: vi.fn(), validateToken: vi.fn(), resolveIdentity: vi.fn() };
    const token = tokenService.generate({ usuarioId: "u2", empresaId: "e2", membershipId: "m2" });
    const app = createApp(authService, tokenService);

    const response = await app.inject({
      method: "POST",
      url: "/auth/verify",
      headers: { "content-type": "application/json" },
      payload: { token },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ usuarioId: "u2", empresaId: "e2", membershipId: "m2" });
  });
});
