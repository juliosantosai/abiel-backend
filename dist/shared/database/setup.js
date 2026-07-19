"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabaseIfNotExists = createDatabaseIfNotExists;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const pg_1 = require("pg");
const env_1 = require("../config/env");
function quoteIdentifier(identifier) {
    return `"${identifier.replace(/"/g, "\"\"")}"`;
}
function parseDatabaseUrl(databaseUrl) {
    const url = new URL(databaseUrl);
    const databaseName = url.pathname.replace(/^\//, "");
    if (!databaseName) {
        throw new Error("DATABASE_URL must include a database name");
    }
    url.pathname = "/postgres";
    return { adminUrl: url.toString(), databaseName };
}
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function connectWithRetry(connectionString, retries = 10, delayMs = 2000) {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt += 1) {
        const client = new pg_1.Client({ connectionString });
        try {
            await client.connect();
            return client;
        }
        catch (error) {
            lastError = error;
            await client.end().catch(() => undefined);
            if (attempt === retries) {
                throw error;
            }
            console.log(`Postgres is not ready yet (attempt ${attempt}/${retries}). Retrying in ${delayMs}ms...`);
            await wait(delayMs);
        }
    }
    throw lastError;
}
function hasPrismaMigrations() {
    const migrationsPath = (0, path_1.join)(process.cwd(), "prisma", "migrations");
    return (0, fs_1.existsSync)(migrationsPath) && (0, fs_1.readdirSync)(migrationsPath).length > 0;
}
async function createDatabaseIfNotExists() {
    if (env_1.env.NODE_ENV === "production") {
        // In production we do not auto-create databases from the app.
        return;
    }
    const { adminUrl, databaseName } = parseDatabaseUrl(env_1.env.DATABASE_URL);
    const client = await connectWithRetry(adminUrl, 15, 2000);
    try {
        const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);
        if (result.rowCount === 0) {
            console.log(`Database ${databaseName} does not exist. Creating...`);
            await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
            console.log(`Database ${databaseName} created successfully.`);
        }
        else {
            console.log(`Database ${databaseName} already exists.`);
        }
    }
    finally {
        await client.end();
    }
    if (hasPrismaMigrations()) {
        console.log("Applying Prisma migrations...");
        (0, child_process_1.execSync)("npx prisma migrate deploy", { stdio: "inherit" });
    }
    else {
        console.log("No Prisma migrations found. Pushing schema to database...");
        (0, child_process_1.execSync)("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    }
}
