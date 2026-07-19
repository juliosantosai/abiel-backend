import type { TenantContext } from "../../../shared/context/tenant-context";
import type { AuthenticatedUser } from "../domain/auth";

export interface AuthContextFactory {
  buildContext(user: AuthenticatedUser): Promise<TenantContext>;
}
