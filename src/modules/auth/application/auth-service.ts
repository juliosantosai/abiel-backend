import type { AuthIdentity, LoginCredentials } from "../domain/auth";
import type { TokenPayload } from "./token-service";

export interface AuthService {
  login(credentials: LoginCredentials): Promise<{ token: string; user: AuthIdentity; membershipId: string }>;
  validateToken(token: string): Promise<TokenPayload>;
}
