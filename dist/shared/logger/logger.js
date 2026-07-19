"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const isDevelopment = process.env.NODE_ENV === "development";
exports.logger = {
    level: process.env.LOG_LEVEL ?? "info",
    prettyPrint: isDevelopment,
    base: {
        service: "abiel-backend",
    },
    redact: [
        "req.headers.authorization",
        "req.headers.cookie",
        "password",
        "token",
    ],
};
