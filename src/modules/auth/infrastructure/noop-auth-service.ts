import type { AuthService } from "../application/auth-service";
import type { LoginCredentials } from "../domain/auth";
import type { TokenPayload } from "../application/token-service";

export class NoopAuthService implements AuthService {
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
      throw new Error("Invalid token format");
    }
  }
}
