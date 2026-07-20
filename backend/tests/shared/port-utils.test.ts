import net from "node:net";
import { describe, expect, it } from "vitest";
import { isPortFree } from "../../src/shared/network/port";

describe("isPortFree", () => {
  it("detects when a port is busy and when it becomes free again", async () => {
    const server = net.createServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected a TCP address");
    }

    const port = address.port;
    expect(await isPortFree(port, "127.0.0.1")).toBe(false);

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    expect(await isPortFree(port, "127.0.0.1")).toBe(true);
  });
});
