import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

export const loggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  base: {
    service: "abiel-backend",
  },
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
          singleLine: true,
          messageFormat: "{msg} {time}",
        },
      }
    : undefined,
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "password",
    "token",
  ],
};

export const logger = pino(loggerOptions);