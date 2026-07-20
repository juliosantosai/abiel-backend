import type { AuthService } from "../application/auth-service";
import type { LoginCredentials, AuthenticatedUser } from "../domain/auth";
import type { TokenPayload } from "../application/token-service";
import { UnauthorizedError, TokenValidationError } from "../../../shared/errors/auth-errors";
import type { TokenService } from "../application/token-service";

export class NoopAuthService implements AuthService {
  constructor(private readonly tokenService?: TokenService) {}

  async login(_credentials: LoginCredentials): Promise<{ token: string; user: { usuarioId: string; email: string }; membershipId: string }> {
    return {
      token: JSON.stringify({ usuarioId: "unauthenticated", empresaId: "global", membershipId: "none", iat: Date.now(), exp: Date.now() + 60_000 }),
      user: { usuarioId: "unauthenticated", email: "unknown@abiel.com" },
      membershipId: "none",
    };
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      return JSON.parse(token) as TokenPayload;
    } catch (error) {
      throw new TokenValidationError();
    }
  }

  async resolveIdentity(token: string): Promise<AuthenticatedUser> {
    let claims: TokenPayload;

    // Prefer tokenService if available
    try {
      if (this.tokenService) {
        claims = this.tokenService.verify(token);
      } else {
        claims = await this.validateToken(token as string);
      }
    } catch (err) {
      throw new TokenValidationError("Token verification failed");
    }

    const user: AuthenticatedUser = {
      usuarioId: claims.usuarioId,
      email: (claims as any).email ?? "unknown@abiel.com",
      activo: (claims as any).activo === undefined ? true : !!(claims as any).activo,
      membershipId: claims.membershipId ?? null,
      empresaId: claims.empresaId ?? null,
      membershipActive: (claims as any).membershipActive === undefined ? true : !!(claims as any).membershipActive,
      rolIds: (claims as any).roles ?? ["user"],
      permisos: (claims as any).permisos ?? ["*"],
    };

    if (!user.activo) {
      throw new UnauthorizedError("User account is inactive");
    }

    if (!user.membershipId || !user.empresaId) {
      throw new UnauthorizedError("Valid membership is required");
    }

    if (!user.membershipActive) {
      throw new UnauthorizedError("Membership is not active");
    }

    return user;
  }
}
