"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const fastify_1 = __importDefault(require("fastify"));
const logger_1 = require("./shared/logger/logger");
const swagger_1 = require("./shared/config/swagger");
const error_handler_1 = require("./shared/errors/error-handler");
const prisma_empresa_repository_1 = require("./modules/empresa/infrastructure/prisma-empresa-repository");
const empresa_service_1 = require("./modules/empresa/application/empresa-service");
const empresa_controller_1 = require("./modules/empresa/presentation/empresa-controller");
const prisma_usuario_repository_1 = require("./modules/usuario/infrastructure/prisma-usuario-repository");
const usuario_service_1 = require("./modules/usuario/application/usuario-service");
const usuario_controller_1 = require("./modules/usuario/presentation/usuario-controller");
const prisma_plan_repository_1 = require("./modules/plan/infrastructure/prisma-plan-repository");
const plan_service_1 = require("./modules/plan/application/plan-service");
const plan_controller_1 = require("./modules/plan/presentation/plan-controller");
const prisma_suscripcion_repository_1 = require("./modules/suscripcion/infrastructure/prisma-suscripcion-repository");
const suscripcion_service_1 = require("./modules/suscripcion/application/suscripcion-service");
const suscripcion_controller_1 = require("./modules/suscripcion/presentation/suscripcion-controller");
const prisma_configuracion_repository_1 = require("./modules/configuracion/infrastructure/prisma-configuracion-repository");
const configuracion_service_1 = require("./modules/configuracion/application/configuracion-service");
const configuracion_controller_1 = require("./modules/configuracion/presentation/configuracion-controller");
const prisma_role_repository_1 = require("./modules/roles/infrastructure/prisma-role-repository");
const role_service_1 = require("./modules/roles/application/role-service");
const role_controller_1 = require("./modules/roles/presentation/role-controller");
const prisma_membership_repository_1 = require("./modules/usuario/infrastructure/prisma-membership-repository");
const membership_service_1 = require("./modules/usuario/application/membership-service");
const membership_controller_1 = require("./modules/usuario/presentation/membership-controller");
async function createApp() {
    const app = (0, fastify_1.default)({
        logger: logger_1.logger,
    });
    (0, error_handler_1.setupErrorHandler)(app);
    await (0, swagger_1.setupSwagger)(app);
    const empresaRepository = new prisma_empresa_repository_1.PrismaEmpresaRepository();
    const empresaService = new empresa_service_1.EmpresaService(empresaRepository);
    (0, empresa_controller_1.registerEmpresaRoutes)(app, empresaService);
    const usuarioRepository = new prisma_usuario_repository_1.PrismaUsuarioRepository();
    const usuarioService = new usuario_service_1.UsuarioService(usuarioRepository);
    (0, usuario_controller_1.registerUsuarioRoutes)(app, usuarioService);
    const planRepository = new prisma_plan_repository_1.PrismaPlanRepository();
    const planService = new plan_service_1.PlanService(planRepository);
    (0, plan_controller_1.registerPlanRoutes)(app, planService);
    const suscripcionRepository = new prisma_suscripcion_repository_1.PrismaSuscripcionRepository();
    const suscripcionService = new suscripcion_service_1.SuscripcionService(suscripcionRepository, empresaRepository, planRepository);
    (0, suscripcion_controller_1.registerSuscripcionRoutes)(app, suscripcionService);
    const configuracionRepository = new prisma_configuracion_repository_1.PrismaConfiguracionRepository();
    const configuracionService = new configuracion_service_1.ConfiguracionService(configuracionRepository, empresaRepository);
    (0, configuracion_controller_1.registerConfiguracionRoutes)(app, configuracionService);
    const roleRepository = new prisma_role_repository_1.PrismaRoleRepository();
    const membershipRepository = new prisma_membership_repository_1.PrismaMembershipRepository();
    const membershipService = new membership_service_1.MembershipService(membershipRepository, usuarioRepository, roleRepository);
    // Create RoleService with MembershipCreator injected (no runtime casts)
    const roleService = new role_service_1.RoleService(roleRepository, membershipService);
    (0, role_controller_1.registerRoleRoutes)(app, roleService);
    (0, membership_controller_1.registerMembershipRoutes)(app, membershipService);
    app.get("/", {
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
    }, async () => ({
        name: "Abiel Backend",
        version: "1.0.0",
        status: "running",
    }));
    app.get("/health", {
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
    }, async () => ({
        status: "ok",
        service: "abiel-backend",
    }));
    return app;
}
