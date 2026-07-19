import { describe, it, expect } from "vitest";
import { createApp } from "../../src/app";

describe("Auth middleware", () => {
  it("accepts valid token and attaches tenantContext", async () => {
    const app = await createApp();
    await app.ready();

    const token = JSON.stringify({ usuarioId: "user-1", empresaId: "empresa-1", membershipId: "m1", iat: Date.now(), exp: Date.now() + 10000, roles: ["user"], permisos: ["*"] });

    const res = await app.inject({ method: "GET", url: "/api/v1/customer/conversations/conv-1/messages", headers: { Authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);

    await app.close();
  });

  it("rejects invalid token", async () => {
    const app = await createApp();
    await app.ready();

    const res = await app.inject({ method: "GET", url: "/api/v1/customer/conversations/conv-1/messages", headers: { Authorization: `Bearer invalid` } });
    expect(res.statusCode).toBe(401);

    await app.close();
  });

  it("rejects user without membership", async () => {
    const app = await createApp();
    await app.ready();

    const token = JSON.stringify({ usuarioId: "user-2", empresaId: null, membershipId: null, iat: Date.now(), exp: Date.now() + 10000, roles: ["user"], permisos: ["*"] });

    const res = await app.inject({ method: "GET", url: "/api/v1/customer/conversations/conv-1/messages", headers: { Authorization: `Bearer ${token}` } });
    expect(res.statusCode).not.toBe(200);

    await app.close();
  });

  it("public endpoint works without auth", async () => {
    const app = await createApp();
    await app.ready();

    const res = await app.inject({ method: "GET", url: "/api/v1/public/health" });
    expect(res.statusCode).toBe(200);

    await app.close();
  });
});
