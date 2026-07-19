import { describe, it, expect } from "vitest";
import { createApp } from "../src/app";

describe("app bootstrap", () => {
  it("creates the app and serves the main routes", async () => {
    const app = await createApp();

    const rootResponse = await app.inject({ method: "GET", url: "/" });
    const healthResponse = await app.inject({ method: "GET", url: "/health" });

    expect(rootResponse.statusCode).toBe(200);
    expect(healthResponse.statusCode).toBe(200);

    await app.close();
  });

  it("handles auth login and profile routes", async () => {
    const app = await createApp();

    const loginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "admin@abiel.com", password: "123456" },
    });

    const meResponse = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: { authorization: "Bearer invalid-token" },
    });

    expect(loginResponse.statusCode).toBe(200);
    expect(meResponse.statusCode).toBe(401);

    await app.close();
  });
});
