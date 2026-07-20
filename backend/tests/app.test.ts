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
});
