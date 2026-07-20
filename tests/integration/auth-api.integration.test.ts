import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app";
import { NoopTokenService } from "../../src/modules/auth/infrastructure/noop-token-service";
import type { AuthService } from "../../src/modules/auth/application/auth-service";
import type { TokenService } from "../../src/modules/auth/application/token-service";

describe("Auth API integration", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  let tokenService: TokenService;
  let authService: AuthService;

  beforeEach(async () => {
    tokenService = new NoopTokenService();
    authService = {
      login: vi.fn(async ({ email }) => ({
        token: tokenService.generate({ usuarioId: "user-1", empresaId: "empresa-1", membershipId: "m1", iat: Date.now(), exp: Date.now() + 10000 }),
        user: { usuarioId: "user-1", email: email ?? "user-1@abiel.com" },
        membershipId: "m1",
      })),
      validateToken: vi.fn(async (token) => tokenService.verify(token)),
      resolveIdentity: vi.fn(async (token) => tokenService.verify(token) as any),
    } as any;

    app = await createApp({ tokenService, authService });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  it("allows login through the auth API", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/integrations/auth/login",
      headers: { "content-type": "application/json" },
      payload: { email: "user-1@abiel.com", password: "secret" },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as any;
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe("user-1@abiel.com");
    expect(authService.login).toHaveBeenCalled();
  });

  it("returns token payload on verify endpoint", async () => {
    const token = tokenService.generate({ usuarioId: "user-2", empresaId: "empresa-2", membershipId: "m2", iat: Date.now(), exp: Date.now() + 10000 });

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/integrations/auth/verify",
      headers: { "content-type": "application/json" },
      payload: { token },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as any;
    expect(body.usuarioId).toBe("user-2");
    expect(body.empresaId).toBe("empresa-2");
  });

  it("rejects login when email or password are missing", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/integrations/auth/login",
      headers: { "content-type": "application/json" },
      payload: { email: "", password: "" },
    });

    expect(response.statusCode).toBe(400);
  });
});
