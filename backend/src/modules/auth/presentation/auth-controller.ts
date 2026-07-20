import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { TokenService, TokenPayload } from "../application/token-service";
import type { AuthService } from "../application/auth-service";

export class AuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authService: AuthService
  ) {}

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

  async login(request: FastifyRequest<{ Body: { email?: string; password?: string } }>, reply: FastifyReply) {
    const email = request.body.email?.trim();
    const password = request.body.password?.trim();

    if (!email || !password) {
      return reply.code(400).send({ error: "Email and password are required" });
    }

    const result = await this.authService.login({ email, password });
    return reply.send({ token: result.token, user: result.user });
  }
}

export function registerAuthRoutes(app: FastifyInstance, tokenService: TokenService, authService?: AuthService) {
  const controller = new AuthController(tokenService, authService ?? {
    login: async () => { throw new Error("AuthService not provided"); },
    validateToken: async () => ({ usuarioId: "", empresaId: "", membershipId: "" }),
    resolveIdentity: async () => { throw new Error("AuthService not provided"); },
  });

  app.post("/auth/login", controller.login.bind(controller));
  app.post("/auth/verify", controller.verify.bind(controller));
  app.get("/auth/health", controller.health.bind(controller));
}
