"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./shared/config/env");
const database_1 = require("./shared/database/database");
let hasStarted = false;
async function listenWithFallback(app, port, host) {
    const candidates = [port, port + 1, port + 2, port + 3];
    for (const candidate of candidates) {
        try {
            await app.listen({ port: candidate, host });
            return candidate;
        }
        catch (error) {
            const err = error;
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
        const port = await listenWithFallback(app, env_1.env.PORT, env_1.env.HOST);
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
