import { generateUuid } from "../../../shared/utils/uuid";
import { Membership, type MembershipProps } from "../domain/membership";
import type { MembershipRepository } from "../infrastructure/membership-repository";
import type { UsuarioRepository } from "../infrastructure/usuario-repository";
import type { RoleFinder } from "../../../shared/contracts/role-finder";
import type { EmpresaFinder } from "../../../shared/contracts/empresa-finder";

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
    private readonly roleFinder: RoleFinder,
    private readonly empresaFinder: EmpresaFinder
  ) {}

  async crearMembership(input: CreateMembershipInput): Promise<MembershipProps> {
    const existingUsuario = await this.usuarioRepository.findById(input.usuarioId);
    if (!existingUsuario) {
      throw new Error("Usuario no encontrado");
    }

    const existingRol = await this.roleFinder.findById(input.rolId);
    if (!existingRol) {
      throw new Error("Rol no encontrado");
    }

    if (existingRol.tipo === "TENANT" && existingRol.empresaId !== input.empresaId) {
      throw new Error("El rol TENANT debe pertenecer a la empresa indicada");
    }

    if (existingRol.tipo === "GLOBAL" && input.empresaId !== "global") {
      throw new Error('El rol GLOBAL debe usar empresaId "global"');
    }

    if (existingRol.tipo === "TENANT" && input.empresaId === "global") {
      throw new Error('Los roles TENANT no pueden usar empresaId "global"');
    }

    if (input.empresaId !== "global") {
      const empresa = await this.empresaFinder.findById(input.empresaId);
      if (!empresa) {
        throw new Error("Empresa no encontrada");
      }
    }

    const existingMembership = await this.membershipRepository.findByUsuarioAndEmpresa(input.usuarioId, input.empresaId);
    if (existingMembership) {
      throw new Error("La membership ya existe para este usuario en la empresa");
    }

    const memberships = await this.membershipRepository.findByUsuarioId(input.usuarioId);
    if (memberships && memberships.length > 0 && input.empresaId !== "global") {
      const other = memberships.find((m) => m.empresaId !== input.empresaId && m.empresaId !== "global");
      if (other) {
        throw new Error("El usuario ya pertenece a otra empresa");
      }
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

  async eliminarMembership(usuarioId: string, rolId: string, empresaId?: string | null): Promise<void> {
    // allow removal or deactivation via repository
    await this.membershipRepository.deleteByUsuarioRolAndEmpresa(usuarioId, rolId, empresaId ?? null);
  }
}
