import type { TenantContext } from "../../../shared/context/tenant-context";
import type { Permission } from "../domain/permission";

export interface AuthorizationService {
  can(context: TenantContext, permiso: Permission, targetEmpresaId?: string): Promise<boolean>;
  hasRole(context: TenantContext, rolId: string): Promise<boolean>;
  assertPermission(context: TenantContext, permiso: Permission, targetEmpresaId?: string): Promise<void>;
}
