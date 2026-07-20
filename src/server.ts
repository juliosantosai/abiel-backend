import { createApp } from "./app";
import { env } from "./shared/config/env";
import { connectDatabase } from "./shared/database/database";
import { logger } from "./shared/logger/logger";
import { isPortFree } from "./shared/network/port";

let hasStarted = false;

async function listenOnPort(app: Awaited<ReturnType<typeof createApp>>, port: number, host: string) {
  logger.info({ port, host }, "checking if port is available before startup");

  let isFree = await isPortFree(port, host);
  let attempt = 0;

  while (!isFree) {
    attempt += 1;
    logger.warn({ port, host, attempt }, "port is busy, waiting for it to become available");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isFree = await isPortFree(port, host);
  }

  try {
    await app.listen({ port, host });
    return port;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code === "EADDRINUSE") {
      logger.warn({ port, host }, "port became busy while starting; waiting again");
      let retryFree = await isPortFree(port, host);

      while (!retryFree) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retryFree = await isPortFree(port, host);
      }

      await app.listen({ port, host });
      return port;
    }

    throw error;
  }
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
      logger.info({ signal }, "shutting down server");
      await app.close();
      process.exit(0);
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    const port = await listenOnPort(app, 5000, env.HOST);
    logger.info({ port }, "abiel backend running");
  } catch (error) {
    logger.error({ err: error }, "failed to start the server");
    process.exit(1);
  }
}

start().catch((error) => {
  logger.error({ err: error }, "server startup failed");
  process.exit(1);
});