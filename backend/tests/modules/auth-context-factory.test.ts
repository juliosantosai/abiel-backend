import { describe, it, expect } from "vitest";
import { NoopAuthContextFactory } from "../../src/modules/auth/infrastructure/noop-auth-context-factory";

describe("AuthContextFactory", () => {
  it("returns null when payload is null", async () => {
    const factory = new NoopAuthContextFactory();

    const context = await factory.buildContext(null);

    expect(context).toBeNull();
  });
});
