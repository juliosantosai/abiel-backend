import Fastify from "fastify";
import { logger } from "./shared/logger/logger";
import { setupSwagger } from "./shared/config/swagger";
import { setupErrorHandler } from "./shared/errors/error-handler";
import { PrismaEmpresaRepository } from "./modules/empresa/infrastructure/prisma-empresa-repository";
import { EmpresaService } from "./modules/empresa/application/empresa-service";
import { registerEmpresaRoutes } from "./modules/empresa/presentation/empresa-controller";
import { PrismaUsuarioRepository } from "./modules/usuario/infrastructure/prisma-usuario-repository";
import { UsuarioService } from "./modules/usuario/application/usuario-service";
import { registerUsuarioRoutes } from "./modules/usuario/presentation/usuario-controller";
import { InMemoryEventBus } from "./shared/events/in-memory-event-bus";
import { PrismaPlanRepository } from "./modules/plan/infrastructure/prisma-plan-repository";
import { PlanService } from "./modules/plan/application/plan-service";
import { registerPlanRoutes } from "./modules/plan/presentation/plan-controller";
import { PrismaSuscripcionRepository } from "./modules/suscripcion/infrastructure/prisma-suscripcion-repository";
import { SuscripcionService } from "./modules/suscripcion/application/suscripcion-service";
import { registerSuscripcionRoutes } from "./modules/suscripcion/presentation/suscripcion-controller";
import { PrismaConfiguracionRepository } from "./modules/configuracion/infrastructure/prisma-configuracion-repository";
import { ConfiguracionService } from "./modules/configuracion/application/configuracion-service";
import { registerConfiguracionRoutes } from "./modules/configuracion/presentation/configuracion-controller";
import { PrismaRoleRepository } from "./modules/roles/infrastructure/prisma-role-repository";
import { RoleService } from "./modules/roles/application/role-service";
import { registerRoleRoutes } from "./modules/roles/presentation/role-controller";
import { PrismaMembershipRepository } from "./modules/usuario/infrastructure/prisma-membership-repository";
import { MembershipService } from "./modules/usuario/application/membership-service";
import { registerMembershipRoutes } from "./modules/usuario/presentation/membership-controller";
import { createAuthInfrastructure } from "./modules/auth/infrastructure/auth-infrastructure-factory";
import { ConversationService } from "./modules/conversacion/application/conversation-service";
import { registerConversationRoutes } from "./modules/conversacion/presentation/conversation-controller";

export async function createApp() {
  const app = Fastify({
    logger,
  });

  setupErrorHandler(app);
  await setupSwagger(app);

  const empresaRepository = new PrismaEmpresaRepository();
  const empresaService = new EmpresaService(empresaRepository);
  registerEmpresaRoutes(app, empresaService);

  const eventBus = new InMemoryEventBus();
  const usuarioRepository = new PrismaUsuarioRepository();
  const usuarioService = new UsuarioService(usuarioRepository, eventBus);
  registerUsuarioRoutes(app, usuarioService);

  const planRepository = new PrismaPlanRepository();
  const planService = new PlanService(planRepository);
  registerPlanRoutes(app, planService);

  const suscripcionRepository = new PrismaSuscripcionRepository();
  const suscripcionService = new SuscripcionService(suscripcionRepository, empresaRepository, planRepository);
  registerSuscripcionRoutes(app, suscripcionService);

  const configuracionRepository = new PrismaConfiguracionRepository();
  const configuracionService = new ConfiguracionService(configuracionRepository, empresaRepository);
  registerConfiguracionRoutes(app, configuracionService);

  const roleRepository = new PrismaRoleRepository();

  const membershipRepository = new PrismaMembershipRepository();
  const membershipService = new MembershipService(membershipRepository, usuarioRepository, roleRepository, empresaRepository);

  const conversationService = new ConversationService(
    { create: async () => ({ id: "conv-1", empresaId: "empresa-1", usuarioId: "user-1", titulo: null, estado: "ACTIVE", createdAt: new Date(), updatedAt: new Date() }), findById: async () => ({ id: "conv-1", empresaId: "empresa-1", usuarioId: "user-1", titulo: null, estado: "ACTIVE", createdAt: new Date(), updatedAt: new Date() }), findByEmpresaId: async () => [] } as any,
    { create: async () => ({ id: "msg-1", conversationId: "conv-1", empresaId: "empresa-1", usuarioId: "user-1", contenido: "", rol: "USER", createdAt: new Date() }), findByConversationId: async () => [] } as any,
    eventBus
  );
  registerConversationRoutes(app, conversationService);

  const { tokenService, authService, authorizationService, authContextFactory, passwordHasher } = createAuthInfrastructure();

  // Create RoleService with MembershipCreator injected (no runtime casts)
  const roleService = new RoleService(roleRepository, membershipService);
  registerRoleRoutes(app, roleService);

  registerMembershipRoutes(app, membershipService);

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


  return app;
}