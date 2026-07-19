import type { FastifyReply, FastifyRequest } from "fastify";
import type { TokenService } from "../../modules/auth/application/token-service";
import type { AuthService } from "../../modules/auth/application/auth-service";
import type { AuthContextFactory } from "../../modules/auth/application/auth-context-factory";
import { TokenValidationError, UnauthorizedError } from "../../shared/errors/auth-errors";

export function createAuthMiddleware(deps: { tokenService: TokenService; authService: AuthService; authContextFactory: AuthContextFactory }) {
  return async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const header = request.headers["authorization"] as string | undefined;
    if (!header) {
      throw new TokenValidationError("Missing Authorization header");
    }

    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new TokenValidationError("Invalid Authorization header format");
    }

    const token = parts[1];

    // Resolve full identity via AuthService. The AuthService is responsible
    // for validating the token, loading user, membership, roles and permisos.
    let identity: any;
    try {
      identity = await deps.authService.resolveIdentity(token);
    } catch (err: any) {
      if (err?.statusCode) throw err; // already an AuthError
      throw new TokenValidationError(err?.message ?? "Token validation failed");
    }

    // Build TenantContext via AuthContextFactory (authority for TenantContext)
    let tenantContext;
    try {
      tenantContext = await deps.authContextFactory.buildContext(identity);
    } catch (err: any) {
      throw new UnauthorizedError(err?.message ?? "Unauthorized");
    }

    (request as any).authContext = identity;
    (request as any).tenantContext = tenantContext;
  };
}
