import { describe, it, expect } from "vitest";
import { registerApiV1 } from "../../src/api/v1";
import { createApp } from "../../src/app";

describe("API v1 router", () => {
  it("exports registerApiV1", () => {
    expect(typeof registerApiV1).toBe("function");
  });

  it("mounts public and customer routes and preserves health", async () => {
    const app = await createApp();
    await app.ready();

    const publicRes = await app.inject({ method: "GET", url: "/api/v1/public/health" });
    expect(publicRes.statusCode).toBe(200);
    const publicBody = JSON.parse(publicRes.payload);
    expect(publicBody).toHaveProperty("status", "ok");

    const convRes = await app.inject({ method: "GET", url: "/api/v1/customer/conversations/conv-1/messages" });
    expect(convRes.statusCode).toBe(200);

    const healthRes = await app.inject({ method: "GET", url: "/health" });
    expect(healthRes.statusCode).toBe(200);

    await app.close();
  });
});
