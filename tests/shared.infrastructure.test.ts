import { describe, it, expect, vi } from "vitest";
import Fastify from "fastify";

const { connectMock } = vi.hoisted(() => ({ connectMock: vi.fn() }));

vi.mock("../src/shared/database/prisma", () => ({
  prisma: { $connect: connectMock },
}));

describe("shared infrastructure", () => {
  it("exposes env defaults and logger configuration", async () => {
    const { env } = await import("../src/shared/config/env");
    const { logger, loggerOptions } = await import("../src/shared/logger/logger");

    expect(env.NODE_ENV).toBeDefined();
    expect(env.PORT).toBeGreaterThan(0);
    expect(env.JWT_SECRET).toBeTruthy();
    expect(logger.level).toBeDefined();
    expect(loggerOptions.base.service).toBe("abiel-backend");
  });

  it("connects to the database with prisma", async () => {
    const { connectDatabase } = await import("../src/shared/database/database");

    await connectDatabase();

    expect(connectMock).toHaveBeenCalled();
  });

  it("registers swagger and swagger ui", async () => {
    const { setupSwagger } = await import("../src/shared/config/swagger");
    const app = Fastify();

    await expect(setupSwagger(app)).resolves.toBeUndefined();

    const response = await app.inject({ method: "GET", url: "/docs/" });
    expect(response.statusCode).toBeGreaterThanOrEqual(200);

    await app.close();
  });

  it("initializes the prisma client module", async () => {
    const module = await import("../src/shared/database/prisma");

    expect(module.prisma).toBeDefined();
    expect(typeof module.prisma.$connect).toBe("function");
  });
});
