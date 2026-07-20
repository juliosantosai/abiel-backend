import { execSync } from "child_process";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { Client } from "pg";
import { env } from "../config/env";
import { logger } from "../logger/logger";

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, "\"\"")}"`;
}

function parseDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const databaseName = url.pathname.replace(/^\//, "");

  if (!databaseName) {
    throw new Error("DATABASE_URL must include a database name");
  }

  url.pathname = "/postgres";
  return { adminUrl: url.toString(), databaseName };
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(connectionString: string, retries = 10, delayMs = 2000) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const client = new Client({ connectionString });

    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => undefined);

      if (attempt === retries) {
        throw error;
      }

      logger.warn({ attempt, retries, delayMs }, "postgres is not ready yet; retrying");
      await wait(delayMs);
    }
  }

  throw lastError;
}

function hasPrismaMigrations() {
  const migrationsPath = join(process.cwd(), "prisma", "migrations");
  return existsSync(migrationsPath) && readdirSync(migrationsPath).length > 0;
}

export async function createDatabaseIfNotExists() {
  if (env.NODE_ENV === "production") {
    // In production we do not auto-create databases from the app.
    return;
  }

  const { adminUrl, databaseName } = parseDatabaseUrl(env.DATABASE_URL);
  const client = await connectWithRetry(adminUrl, 15, 2000);

  try {
    const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);

    if (result.rowCount === 0) {
      logger.info({ databaseName }, "database does not exist; creating it");
      await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
      logger.info({ databaseName }, "database created successfully");
    } else {
      logger.info({ databaseName }, "database already exists");
    }
  } finally {
    await client.end();
  }

  if (hasPrismaMigrations()) {
    logger.info("applying prisma migrations");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
  } else {
    logger.info("no prisma migrations found; pushing schema to database");
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
  }
}
