import dotenv from "dotenv";

dotenv.config();

function getNumberEnv(
  name: string,
  defaultValue: number
): number {
  const value = process.env[name];

  if (!value) return defaultValue;

  const parsed = Number(value);

  return Number.isNaN(parsed)
    ? defaultValue
    : parsed;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: getNumberEnv("PORT", 5000),
  HOST: process.env.HOST ?? "0.0.0.0",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://julio:123456@localhost:5433/database?schema=public",
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1h",
  ADMIN_API_KEY: process.env.ADMIN_API_KEY ?? "dev-admin-key",
};