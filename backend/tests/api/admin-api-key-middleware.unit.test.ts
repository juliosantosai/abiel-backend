import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createAdminApiKeyMiddleware } from "../../src/api/middleware/admin-api-key-middleware";
import { UnauthorizedError } from "../../src/shared/errors/auth-errors";

describe("Admin API key middleware", () => {
  const originalAdminApiKey = process.env.ADMIN_API_KEY;

  beforeEach(() => {
    process.env.ADMIN_API_KEY = "secret-admin-key";
  });

  afterEach(() => {
    process.env.ADMIN_API_KEY = originalAdminApiKey;
  });

  it("allows requests with a matching x-api-key header", async () => {
    const middleware = createAdminApiKeyMiddleware();
    const request = { headers: { "x-api-key": "secret-admin-key" } } as any;
    const reply = {} as any;

    await expect(middleware(request, reply)).resolves.toBeUndefined();
  });

  it("rejects requests without x-api-key header", async () => {
    const middleware = createAdminApiKeyMiddleware();
    const request = { headers: {} } as any;
    const reply = {} as any;

    await expect(middleware(request, reply)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects requests with an invalid x-api-key header", async () => {
    const middleware = createAdminApiKeyMiddleware();
    const request = { headers: { "x-api-key": "wrong-key" } } as any;
    const reply = {} as any;

    await expect(middleware(request, reply)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
