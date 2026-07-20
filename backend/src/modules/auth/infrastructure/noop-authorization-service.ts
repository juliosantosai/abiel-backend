import { UnauthorizedError } from "../../../shared/errors/auth-errors";
import type { AuthorizationService } from "../application/authorization-service";
import type { TenantContext } from "../../../shared/context/tenant-context";
import type { Permission } from "../domain/permission";

export class NoopAuthorizationService implements AuthorizationService {
  async can(context: TenantContext, permiso: Permission, targetEmpresaId?: string): Promise<boolean> {
    if (!context || !context.usuarioId || !context.empresaId || !context.membershipId) {
      throw new UnauthorizedError("TenantContext is required");
    }

    if (targetEmpresaId && context.empresaId !== targetEmpresaId && !context.isGlobalTenant) {
      return false;
    }

    return context.permisos.includes(permiso);
  }

  async hasRole(context: TenantContext, rolId: string): Promise<boolean> {
    if (!context || !context.usuarioId || !context.empresaId || !context.membershipId) {
      throw new UnauthorizedError("TenantContext is required");
    }

    return context.rolIds.includes(rolId);
  }

  async assertPermission(context: TenantContext, permiso: Permission, targetEmpresaId?: string): Promise<void> {
    const allowed = await this.can(context, permiso, targetEmpresaId);
    if (!allowed) {
      throw new UnauthorizedError(`Permission denied: ${permiso}`);
    }
  }
}
