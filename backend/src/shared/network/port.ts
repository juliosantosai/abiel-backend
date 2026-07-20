import net from "node:net";

export async function isPortFree(port: number, host = "127.0.0.1") {
  return new Promise<boolean>((resolve) => {
    const server = net.createServer();

    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close((closeError) => {
        if (closeError) {
          resolve(false);
          return;
        }

        resolve(true);
      });
    });

    server.listen({ port, host });
  });
}

export async function waitForPort(port: number, host = "127.0.0.1", options?: { retries?: number; delayMs?: number }) {
  const retries = options?.retries ?? 30;
  const delayMs = options?.delayMs ?? 1000;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const free = await isPortFree(port, host);
    if (free) {
      return true;
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return false;
}
