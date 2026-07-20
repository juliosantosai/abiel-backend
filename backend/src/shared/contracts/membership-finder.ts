import type { AuthMembershipData } from "./auth-membership";

export interface MembershipFinder {
  findById(id: string): Promise<AuthMembershipData | null>;
  findActiveByUsuarioId(usuarioId: string): Promise<AuthMembershipData[]>;
  findActiveByUsuarioIdAndEmpresaId(usuarioId: string, empresaId: string): Promise<AuthMembershipData | null>;
}
