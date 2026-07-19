import { createApp } from "./app";
import { env } from "./shared/config/env";
import { connectDatabase } from "./shared/database/database";

let hasStarted = false;

async function listenWithFallback(app: Awaited<ReturnType<typeof createApp>>, port: number, host: string) {
  const candidates = [port, port + 1, port + 2, port + 3];

  for (const candidate of candidates) {
    try {
      await app.listen({ port: candidate, host });
      return candidate;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;

      if (err.code !== "EADDRINUSE") {
        throw error;
      }

      console.warn(`Port ${candidate} is busy, trying ${candidate + 1}...`);
    }
  }

  throw new Error(`Unable to start the server. Ports ${candidates.join(", ")} are unavailable.`);
}

async function start() {
  if (hasStarted) {
    return;
  }

  hasStarted = true;

  try {
    await connectDatabase();
    const app = await createApp();

    const shutdown = async (signal: NodeJS.Signals) => {
      console.log(`Shutting down server due to ${signal}`);
      await app.close();
      process.exit(0);
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    const port = await listenWithFallback(app, env.PORT, env.HOST);
    console.log(`Abiel Backend running on port ${port}`);
  } catch (error) {
    console.error("Failed to start the server", error);
    process.exit(1);
  }
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});