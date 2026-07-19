import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { TokenService, TokenPayload } from "../application/token-service";

export class AuthController {
  constructor(private readonly tokenService: TokenService) {}

  async health(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({ status: "ok" });
  }

  async verify(
    request: FastifyRequest<{ Body: { token?: string } }>,
    reply: FastifyReply
  ) {
    const token = request.body.token ?? "";
    const payload = this.tokenService.verify(token);
    return reply.send(payload);
  }
}

export function registerAuthRoutes(app: FastifyInstance, tokenService: TokenService) {
  const controller = new AuthController(tokenService);

  app.post("/auth/verify", controller.verify.bind(controller));
  app.get("/auth/health", controller.health.bind(controller));
}
