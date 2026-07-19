import { generateUuid } from "../../../shared/utils/uuid";
import { Membership, type MembershipProps } from "../domain/membership";
import type { MembershipRepository } from "../infrastructure/membership-repository";
import type { UsuarioRepository } from "../infrastructure/usuario-repository";
import type { RoleRepository } from "../../roles/infrastructure/role-repository";

export type CreateMembershipInput = {
  usuarioId: string;
  empresaId: string;
  rolId: string;
  activo?: boolean;
};

export class MembershipService {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly usuarioRepository: UsuarioRepository,
    private readonly roleRepository: RoleRepository
  ) {}

  async crearMembership(input: CreateMembershipInput): Promise<MembershipProps> {
    const existingUsuario = await this.usuarioRepository.findById(input.usuarioId);
    if (!existingUsuario) {
      throw new Error("Usuario no encontrado");
    }

    const existingRol = await this.roleRepository.findById(input.rolId);
    if (!existingRol) {
      throw new Error("Rol no encontrado");
    }

    const existingMembership = await this.membershipRepository.findByUsuarioAndEmpresa(input.usuarioId, input.empresaId);
    if (existingMembership) {
      throw new Error("La membership ya existe para este usuario en la empresa");
    }

    if (existingRol.tipo === "TENANT" && existingRol.empresaId !== input.empresaId) {
      throw new Error("El rol TENANT debe pertenecer a la empresa indicada");
    }

    const membership = new Membership({
      id: generateUuid(),
      usuarioId: input.usuarioId,
      empresaId: input.empresaId,
      rolId: input.rolId,
      activo: input.activo ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.membershipRepository.create(membership.toJSON());
  }

  async obtenerMembershipsPorUsuario(usuarioId: string): Promise<MembershipProps[]> {
    return this.membershipRepository.findByUsuarioId(usuarioId);
  }

  async activarMembership(id: string): Promise<MembershipProps> {
    const existing = await this.membershipRepository.findById(id);
    if (!existing) {
      throw new Error("Membership no encontrada");
    }

    const membership = new Membership(existing);
    membership.activar();

    const updated = await this.membershipRepository.update(id, membership.toJSON());
    if (!updated) {
      throw new Error("No se pudo activar la membership");
    }

    return updated;
  }

  async desactivarMembership(id: string): Promise<MembershipProps> {
    const existing = await this.membershipRepository.findById(id);
    if (!existing) {
      throw new Error("Membership no encontrada");
    }

    const membership = new Membership(existing);
    membership.desactivar();

    const updated = await this.membershipRepository.update(id, membership.toJSON());
    if (!updated) {
      throw new Error("No se pudo desactivar la membership");
    }

    return updated;
  }
}
