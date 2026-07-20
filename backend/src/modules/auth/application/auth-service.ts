import type { AuthIdentity, LoginCredentials, AuthenticatedUser } from "../domain/auth";
import type { TokenPayload } from "./token-service";

export interface AuthService {
  login(credentials: LoginCredentials): Promise<{ token: string; user: AuthIdentity; membershipId: string }>;
  validateToken(token: string): Promise<TokenPayload>;
  resolveIdentity(token: string): Promise<AuthenticatedUser>;
}
