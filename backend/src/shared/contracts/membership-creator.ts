export type CreatedMembership = { id: string };

export type CreateMembershipInput = {
  usuarioId: string;
  empresaId: string;
  rolId: string;
  activo?: boolean;
};

export interface MembershipCreator {
  crearMembership(input: CreateMembershipInput): Promise<CreatedMembership>;
  eliminarMembership(usuarioId: string, rolId: string, empresaId?: string | null): Promise<void>;
}
