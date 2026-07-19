import type { MembershipProps } from "../domain/membership";

export interface MembershipRepository {
  findById(id: string): Promise<MembershipProps | null>;
  findByUsuarioId(usuarioId: string): Promise<MembershipProps[]>;
  findByEmpresaId(empresaId: string): Promise<MembershipProps[]>;
  findByUsuarioAndEmpresa(usuarioId: string, empresaId: string): Promise<MembershipProps | null>;
  create(membership: MembershipProps): Promise<MembershipProps>;
  update(id: string, membership: Partial<MembershipProps>): Promise<MembershipProps | null>;
}
