import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../../shared/errors/auth-errors";
import { env } from "../../shared/config/env";

export function createAdminApiKeyMiddleware() {
  return async function adminApiKeyMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = request.headers["x-api-key"] as string | undefined;
    const expectedKey = env.ADMIN_API_KEY;

    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedError("Forbidden");
    }
  };
}
