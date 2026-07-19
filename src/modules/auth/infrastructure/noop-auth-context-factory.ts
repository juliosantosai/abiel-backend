import { UnauthorizedError } from "../../../shared/errors/auth-errors";
import type { AuthContextFactory } from "../application/auth-context-factory";
import type { AuthenticatedUser } from "../domain/auth";
import { TenantContext } from "../../../shared/context/tenant-context";

export class NoopAuthContextFactory implements AuthContextFactory {
  async buildContext(user: AuthenticatedUser): Promise<TenantContext> {
    if (!user) {
      throw new UnauthorizedError("Authenticated user is required to build TenantContext");
    }

    if (!user.activo) {
      throw new UnauthorizedError("User account is inactive");
    }

    if (!user.membershipId || !user.empresaId) {
      throw new UnauthorizedError("Valid membership is required");
    }

    if (!user.membershipActive) {
      throw new UnauthorizedError("Membership is not active");
    }

    if (!user.rolIds || user.rolIds.length === 0) {
      throw new UnauthorizedError("Valid roles are required to build TenantContext");
    }

    if (!user.permisos || user.permisos.length === 0) {
      throw new UnauthorizedError("Permissions must be resolved before building TenantContext");
    }

    return TenantContext.create({
      usuarioId: user.usuarioId,
      empresaId: user.empresaId,
      membershipId: user.membershipId,
      rolIds: user.rolIds,
      permisos: user.permisos,
      isGlobalTenant: user.empresaId === "global",
    });
  }
}
