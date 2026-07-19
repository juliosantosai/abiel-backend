import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthorizationService } from "../application/authorization-service";
import type { Permission } from "../domain/permission";
import type { TenantContext } from "../../../shared/context/tenant-context";

export function createAuthorizationHook(authorizationService: AuthorizationService) {
  return async function authorize(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const config = (request.routeOptions as any)?.config as { requiredPermission?: Permission | undefined } | undefined;
    const permission = config?.requiredPermission;
    if (!permission) {
      return;
    }

    const context = (request as any).tenantContext as TenantContext | undefined;
    if (!context) {
      reply.code(403);
      throw new Error("Unauthorized: TenantContext missing");
    }

    await authorizationService.assertPermission(context, permission);
  };
}

export function requiresPermission(permission: Permission) {
  return {
    config: {
      requiredPermission: permission,
    },
  };
}
