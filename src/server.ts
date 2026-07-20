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
  const MAX_WAIT_ATTEMPTS = 300; // ~5 minutes at 1s intervals

  while (!isFree && attempt < MAX_WAIT_ATTEMPTS) {
    attempt += 1;
    logger.warn({ port, host, attempt }, "port is busy, waiting for it to become available");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isFree = await isPortFree(port, host);
  }

  if (!isFree && attempt >= MAX_WAIT_ATTEMPTS) {
    logger.error(
      { port, host, maxAttempts: MAX_WAIT_ATTEMPTS },
      "port still busy after max wait attempts; likely a zombie process; try: lsof -i :PORT or pkill -9 -f node"
    );
    process.exit(1);
  }

  try {
    await app.listen({ port, host });
    return port;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code === "EADDRINUSE") {
      logger.warn({ port, host }, "port became busy while starting; waiting again");
      let retryFree = await isPortFree(port, host);
      let retryAttempt = 0;

      while (!retryFree && retryAttempt < 30) {
        retryAttempt += 1;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retryFree = await isPortFree(port, host);
      }

      if (!retryFree) {
        logger.error({ port, host }, "port still busy after retry attempts; aborting");
        process.exit(1);
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