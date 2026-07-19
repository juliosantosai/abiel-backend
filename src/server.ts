import { createApp } from "./app";
import { env } from "./shared/config/env";
import { connectDatabase } from "./shared/database/database";

let hasStarted = false;

async function listenOnPort(app: Awaited<ReturnType<typeof createApp>>, port: number, host: string) {
  try {
    await app.listen({ port, host });
    return port;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    if (err.code === "EADDRINUSE") {
      console.error(`Port ${port} already in use. Server startup aborted.`);
      process.exit(1);
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

    const port = await listenOnPort(app, env.PORT, env.HOST);
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