import { describe, it, expect } from "vitest";
import { logger, loggerOptions } from "../src/shared/logger/logger";

describe("logger shared", () => {
  it("exposes a logger instance", () => {
    expect(logger).toBeDefined();
    expect(logger.level).toBeDefined();
  });

  it("contains a service base field", () => {
    expect(loggerOptions.base).toBeDefined();
    expect(loggerOptions.base).toMatchObject({ service: "abiel-backend" });
  });

  it("redacts sensitive fields", () => {
    expect(loggerOptions.redact).toEqual(
      expect.arrayContaining(["req.headers.authorization", "password", "token"])
    );
  });
});
