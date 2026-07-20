import type { AuthUserData } from "./auth-user";

export interface UsuarioFinder {
  findByEmail(email: string): Promise<AuthUserData | null>;
  findById(id: string): Promise<AuthUserData | null>;
}
