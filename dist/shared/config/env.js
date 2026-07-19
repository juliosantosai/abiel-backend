"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getNumberEnv(name, fallback) {
    const value = process.env[name];
    if (!value) {
        return fallback;
    }
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}
exports.env = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: getNumberEnv("PORT", 3000),
    HOST: process.env.HOST ?? "0.0.0.0",
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://abiel:abiel@localhost:5432/abiel",
    JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1h",
};
