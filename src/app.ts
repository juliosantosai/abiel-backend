import Fastify from "fastify";
import { logger, loggerOptions } from "./shared/logger/logger";
import { setupSwagger } from "./shared/config/swagger";
import { setupErrorHandler } from "./shared/errors/error-handler";
import { PrismaEmpresaRepository } from "./modules/empresa/infrastructure/prisma-empresa-repository";
import { EmpresaService } from "./modules/empresa/application/empresa-service";
import { PrismaUsuarioRepository } from "./modules/usuario/infrastructure/prisma-usuario-repository";
import { UsuarioService } from "./modules/usuario/application/usuario-service";
import { InMemoryEventBus } from "./shared/events/in-memory-event-bus";
import { PrismaAgentRepository } from "./modules/agente/infrastructure/prisma-agent-repository";
import { AgentOrchestrator } from "./modules/agente/application/agent-orchestrator";
import { MessageReceivedEventHandler as AgentMessageReceivedEventHandler } from "./modules/agente/application/message-received-event-handler";
import { MessageReceivedEventHandler as ConversationMessageReceivedEventHandler } from "./modules/conversacion/application/message-received-event-handler";
import { NoopAgentRuntime } from "./shared/ai/noop-agent-runtime";
import { AgentService } from "./modules/agente/application/agent-service";
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
import { registerApiV1 } from "./api/v1";
import { registerWebhookController } from "./modules/gateway/presentation/webhook.controller";
import { EvolutionWebhookNormalizer } from "./modules/gateway/application/evolution-webhook-normalizer";
import { MessageGateway } from "./modules/gateway/application/message-gateway";
import { PrismaWebhookDeliveryRepository } from "./modules/gateway/infrastructure/prisma-webhook-delivery-repository";
import { SecurityService } from "./modules/security/application/security-service";
import { PrismaSecurityRepository } from "./modules/security/infrastructure/prisma-security-repository";
import { NoopNotificationService } from "./modules/security/infrastructure/noop-notification-service";
import { SecurityMiddleware } from "./modules/security/infrastructure/security-middleware";
import { CapabilityRegistry } from "./modules/agente/application/capability-registry";
import { EchoCapability } from "./modules/agente/application/echo-capability";
import { OutboundMessageHandler } from "./modules/gateway/application/outbound-message-handler";

export async function createApp(overrides?: { tokenService?: any; authService?: any; authContextFactory?: any }) {
  const app = Fastify({
    logger: loggerOptions,
  });

  setupErrorHandler(app);
  await setupSwagger(app);

  const empresaRepository = new PrismaEmpresaRepository();
  const empresaService = new EmpresaService(empresaRepository);

  const eventBus = new InMemoryEventBus();
  const usuarioRepository = new PrismaUsuarioRepository();
  const usuarioService = new UsuarioService(usuarioRepository, eventBus);

  const planRepository = new PrismaPlanRepository();
  const planService = new PlanService(planRepository);

  const suscripcionRepository = new PrismaSuscripcionRepository();
  const suscripcionService = new SuscripcionService(suscripcionRepository, empresaRepository, planRepository);

  const configuracionRepository = new PrismaConfiguracionRepository();
  const configuracionService = new ConfiguracionService(configuracionRepository, empresaRepository);

  const roleRepository = new PrismaRoleRepository();

  const membershipRepository = new PrismaMembershipRepository();
  const membershipService = new MembershipService(membershipRepository, usuarioRepository, roleRepository, empresaRepository);

  const { PrismaConversationRepository } = await import("./modules/conversacion/infrastructure/prisma-conversation-repository");
  const { PrismaMessageRepository } = await import("./modules/conversacion/infrastructure/prisma-message-repository");
  const convRepo = new PrismaConversationRepository();
  const msgRepo = new PrismaMessageRepository();
  const conversationService = new ConversationService(convRepo, msgRepo, eventBus);
  // Conversation routes will be mounted by registerApiV1

  // Agent orchestration wiring: repository + runtime + orchestrator + handler
  const agentRepository = new PrismaAgentRepository();
  const noopRuntime = new NoopAgentRuntime();

  // Setup capability registry and register capabilities
  const capabilityRegistry = new CapabilityRegistry();
  const echoCapability = new EchoCapability(eventBus);
  capabilityRegistry.register(echoCapability);

  // Create orchestrator with capability registry
  const agentOrchestrator = new AgentOrchestrator(agentRepository, convRepo, msgRepo, noopRuntime, eventBus, capabilityRegistry);
  const agentMessageHandler = new AgentMessageReceivedEventHandler(agentOrchestrator);
  const conversationMessageHandler = new ConversationMessageReceivedEventHandler(conversationService);
  // CRITICAL: Conversation persistence handler MUST execute BEFORE agent orchestration
  // This ensures message exists in DB when orchestrator tries to process it
  eventBus.subscribe("MessageReceived", conversationMessageHandler);
  eventBus.subscribe("MessageReceived", agentMessageHandler);

  // Setup outbound message handler for SendMessageRequested events
  const outboundHandler = new OutboundMessageHandler();
  eventBus.subscribe("SendMessageRequested", outboundHandler);

  const agentService = new AgentService(agentRepository, eventBus);

  const deliveryRepository = new PrismaWebhookDeliveryRepository();
  const gateway = new MessageGateway(eventBus, new EvolutionWebhookNormalizer(), deliveryRepository);
  registerWebhookController(app, {
    empresaRepository,
    eventBus,
    normalizerService: new EvolutionWebhookNormalizer(),
    gateway,
  });

  const securityRepository = new PrismaSecurityRepository();
  const securityNotificationService = new NoopNotificationService();
  const securityService = new SecurityService(securityNotificationService, securityRepository, process.env.ADMIN_WHATSAPP_NUMBER ?? "+1234567890");
  const securityMiddleware = new SecurityMiddleware(securityService);

  app.addHook("onRequest", securityMiddleware.handle.bind(securityMiddleware));

  const defaultAuth = createAuthInfrastructure();
  const authInfra = overrides ? { ...defaultAuth, ...overrides } : defaultAuth;
  const { tokenService, authService, authContextFactory } = authInfra as any;

  // Create RoleService with MembershipCreator injected (no runtime casts)
  const roleService = new RoleService(roleRepository, membershipService);

  // Register API v1 in a single place. This will mount sub-routers under /api/v1
  registerApiV1(app, {
    empresaService,
    planService,
    roleService,
    suscripcionService,
    usuarioService,
    membershipService,
    conversationService,
    agentService,
    configuracionService,
    tokenService,
    authService,
    authContextFactory,
  });

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