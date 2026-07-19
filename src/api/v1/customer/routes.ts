import type { FastifyInstance } from "fastify";
import { registerConversationRoutes } from "../../../modules/conversacion/presentation/conversation-controller";
import { registerAgentRoutes } from "../../../modules/agente/presentation/agent-controller";
import { registerConfiguracionRoutes } from "../../../modules/configuracion/presentation/configuracion-controller";
import { TenantContext } from "../../../shared/context/tenant-context";

export function registerCustomerRoutes(app: FastifyInstance, deps: any) {
  registerConversationRoutes(app, deps.conversationService);
  registerAgentRoutes(app, deps.agentService);
  registerConfiguracionRoutes(app, deps.configuracionService);
}

