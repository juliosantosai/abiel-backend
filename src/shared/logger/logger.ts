const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
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