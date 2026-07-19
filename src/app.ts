import Fastify from "fastify";
import { logger } from "./shared/logger/logger";
import { setupSwagger } from "./shared/config/swagger";
import { setupErrorHandler } from "./shared/errors/error-handler";
import { loginUser, getUserFromToken } from "./shared/auth/login";

export async function createApp() {
  const app = Fastify({
    logger,
  });

  setupErrorHandler(app);
  await setupSwagger(app);

  app.get(
    "/",
    {
      schema: {
        description: "API base endpoint",
        summary: "Root endpoint",
        response: {
          200: {
            type: "object",
            properties: {
              name: { type: "string" },
              version: { type: "string" },
              status: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({
      name: "Abiel Backend",
      version: "1.0.0",
      status: "running",
    })
  );

  app.get(
    "/health",
    {
      schema: {
        description: "Health check endpoint",
        summary: "Health status",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              service: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({
      status: "ok",
      service: "abiel-backend",
    })
  );

  app.post("/auth/login", async (request, reply) => {
    const { email, password } = request.body as { email?: string; password?: string };

    if (!email || !password) {
      return reply.status(400).send({ error: true, message: "Email and password are required" });
    }

    try {
      const result = loginUser(email, password);
      return reply.status(200).send(result);
    } catch (error) {
      return reply.status(401).send({ error: true, message: "Invalid credentials" });
    }
  });

  app.get("/auth/me", async (request, reply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: true, message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const user = getUserFromToken(token);
      return reply.status(200).send({ user });
    } catch (error) {
      return reply.status(401).send({ error: true, message: "Invalid token" });
    }
  });

  return app;
}