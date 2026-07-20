import type { FastifyInstance } from "fastify";
import { registerAdminRoutes } from "./admin/routes";
import { registerCustomerRoutes } from "./customer/routes";
import { registerIntegrationsRoutes } from "./integrations/routes";
import { registerPublicRoutes } from "./public/routes";

export interface ApiV1Deps {
  // include services needed by mounted routes
  empresaService?: any;
  planService?: any;
  roleService?: any;
  suscripcionService?: any;
  usuarioService?: any;
  membershipService?: any;
  conversationService?: any;
  agentService?: any;
  configuracionService?: any;
  taskService?: any;
  tokenService?: any;
  authService?: any;
  authContextFactory?: any;
}

export function registerApiV1(app: FastifyInstance, deps: ApiV1Deps) {
  const plugin = async (instance: FastifyInstance) => {
    registerPublicRoutes(instance);

    // customer: mount with auth middleware applied at this level
    const customerPlugin = async (cust: FastifyInstance) => {
      if (deps.tokenService && deps.authService && deps.authContextFactory) {
        const { createAuthMiddleware } = await import("../middleware");
        cust.addHook("preHandler", createAuthMiddleware({ tokenService: deps.tokenService, authService: deps.authService, authContextFactory: deps.authContextFactory }));
      }
      registerCustomerRoutes(cust, deps);
    };
    instance.register(customerPlugin, { prefix: "/customer" });

    // admin: validate against a fixed server-side API key instead of user tokens
    const adminPlugin = async (adm: FastifyInstance) => {
      const { createAdminApiKeyMiddleware } = await import("../middleware");
      adm.addHook("preHandler", createAdminApiKeyMiddleware());
      registerAdminRoutes(adm, deps);
    };
    instance.register(adminPlugin, { prefix: "/admin" });

    // integrations and public keep existing behavior
    registerIntegrationsRoutes(instance, deps);
  };

  app.register(plugin, { prefix: "/api/v1" });
}

export default registerApiV1;
