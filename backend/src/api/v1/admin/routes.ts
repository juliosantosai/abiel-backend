import type { FastifyInstance } from "fastify";
import { registerEmpresaRoutes } from "../../../modules/empresa/presentation/empresa-controller";
import { registerPlanRoutes } from "../../../modules/plan/presentation/plan-controller";
import { registerRoleRoutes } from "../../../modules/roles/presentation/role-controller";
import { registerSuscripcionRoutes } from "../../../modules/suscripcion/presentation/suscripcion-controller";
import { registerUsuarioRoutes } from "../../../modules/usuario/presentation/usuario-controller";
import { registerMembershipRoutes } from "../../../modules/usuario/presentation/membership-controller";

export function registerAdminRoutes(app: FastifyInstance, deps: any) {
  registerEmpresaRoutes(app, deps.empresaService);
  registerPlanRoutes(app, deps.planService);
  registerRoleRoutes(app, deps.roleService);
  registerSuscripcionRoutes(app, deps.suscripcionService);
  registerUsuarioRoutes(app, deps.usuarioService);
  registerMembershipRoutes(app, deps.membershipService);
}

