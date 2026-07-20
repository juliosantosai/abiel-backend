import { describe, it, expect, vi } from "vitest";
import Fastify from "fastify";
import { SecurityMiddleware } from "../../src/modules/security/infrastructure/security-middleware";
import { SecurityService } from "../../src/modules/security/application/security-service";
import { Severity, IncidentType } from "../../src/modules/security/domain/severity";
import type { NotificationService } from "../../src/modules/security/application/notification-service";
import type { SecurityRepository } from "../../src/modules/security/infrastructure/security-repository";

const createMockNotificationService = (): NotificationService => ({
  sendSecurityAlert: vi.fn().mockResolvedValue(undefined),
});

const createMockSecurityRepository = (): SecurityRepository => ({
  create: vi.fn().mockResolvedValue(undefined),
  findByIP: vi.fn().mockResolvedValue([]),
  findByType: vi.fn().mockResolvedValue([]),
  countRecent: vi.fn().mockResolvedValue(0),
});

describe("SecurityMiddleware", () => {
  it("allows safe requests when security service permits", async () => {
    const repo = createMockSecurityRepository();
    const notif = createMockNotificationService();
    const securityService = new SecurityService(notif, repo, "+1234567890");
    const middleware = new SecurityMiddleware(securityService);

    const app = Fastify();
    app.addHook("onRequest", middleware.handle.bind(middleware));
    app.get("/ok", async () => ({ ok: true }));

    const response = await app.inject({ method: "GET", url: "/ok", headers: { "user-agent": "Mozilla/5.0" } });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });

    await app.close();
  });

  it("blocks requests when security service denies", async () => {
    const repo = createMockSecurityRepository();
    const notif = createMockNotificationService();
    const securityService = new SecurityService(notif, repo, "+1234567890");
    vi.spyOn(securityService, "checkRequest").mockResolvedValue({ allow: false, message: "Blocked", reason: IncidentType.SCANNER_DETECTED });
    const middleware = new SecurityMiddleware(securityService);

    const app = Fastify();
    app.addHook("onRequest", middleware.handle.bind(middleware));
    app.get("/secure", async () => ({ ok: true }));

    const response = await app.inject({ method: "GET", url: "/secure", headers: { "user-agent": "sqlmap/1.0" } });
    expect(response.statusCode).toBe(403);
    expect(response.headers["x-security-block"]).toBe("true");
    expect(response.json()).toEqual({ error: "Blocked" });

    await app.close();
  });
});
