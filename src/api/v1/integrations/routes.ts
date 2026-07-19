import type { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "../../../modules/auth/presentation/auth-controller";

export function registerIntegrationsRoutes(app: FastifyInstance, deps: any) {
  const plugin = async (instance: FastifyInstance) => {
    // Expose token verification and other integration endpoints
    registerAuthRoutes(instance, deps.tokenService);
  };

  app.register(plugin, { prefix: "/integrations" });
}
