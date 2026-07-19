"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./shared/config/env");
const database_1 = require("./shared/database/database");
let hasStarted = false;
async function listenOnPort(app, port, host) {
    try {
        await app.listen({ port, host });
        return port;
    }
    catch (error) {
        const err = error;
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
        await (0, database_1.connectDatabase)();
        const app = await (0, app_1.createApp)();
        const shutdown = async (signal) => {
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
        const port = await listenOnPort(app, env_1.env.PORT, env_1.env.HOST);
        console.log(`Abiel Backend running on port ${port}`);
    }
    catch (error) {
        console.error("Failed to start the server", error);
        process.exit(1);
    }
}
start().catch((error) => {
    console.error(error);
    process.exit(1);
});
