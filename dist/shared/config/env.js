"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getNumberEnv(name, defaultValue) {
    const value = process.env[name];
    if (!value)
        return defaultValue;
    const parsed = Number(value);
    return Number.isNaN(parsed)
        ? defaultValue
        : parsed;
}
function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.env = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: getNumberEnv("PORT", 5000),
    HOST: process.env.HOST ?? "0.0.0.0",
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://julio:123456@localhost:5433/database?schema=public",
    JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1h",
};
