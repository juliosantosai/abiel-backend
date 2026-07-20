import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import { SecurityMiddleware } from "../../src/modules/security/infrastructure/security-middleware";
import { SecurityService } from "../../src/modules/security/application/security-service";
import { InMemorySecurityRepository } from "../../src/modules/security/infrastructure/in-memory-security-repository";
import { NoopNotificationService } from "../../src/modules/security/infrastructure/noop-notification-service";

describe("SecurityMiddleware", () => {
  it("blocks suspicious requests before the route handler runs", async () => {
    const app = Fastify();
    const service = new SecurityService(new NoopNotificationService(), new InMemorySecurityRepository(), "+1234567890");
    const middleware = new SecurityMiddleware(service);

    app.addHook("onRequest", middleware.handle.bind(middleware));
    app.get("/secure", async () => ({ ok: true }));

    const response = await app.inject({
      method: "GET",
      url: "/secure",
      headers: {
        "user-agent": "sqlmap/1.0",
        "x-forwarded-for": "203.0.113.10",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.headers["x-security-block"]).toBe("true");

    await app.close();
  });
});
