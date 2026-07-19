"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipService = void 0;
const uuid_1 = require("../../../shared/utils/uuid");
const membership_1 = require("../domain/membership");
class MembershipService {
    membershipRepository;
    usuarioRepository;
    roleRepository;
    constructor(membershipRepository, usuarioRepository, roleRepository) {
        this.membershipRepository = membershipRepository;
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
    }
    async crearMembership(input) {
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
        // Enforce tenant uniqueness: if the usuario already has memberships in a different empresa, reject
        const memberships = await this.membershipRepository.findByUsuarioId(input.usuarioId);
        if (memberships && memberships.length > 0) {
            const other = memberships.find((m) => m.empresaId !== input.empresaId);
            if (other) {
                throw new Error("El usuario ya pertenece a otra empresa");
            }
        }
        if (existingRol.tipo === "TENANT" && existingRol.empresaId !== input.empresaId) {
            throw new Error("El rol TENANT debe pertenecer a la empresa indicada");
        }
        const membership = new membership_1.Membership({
            id: (0, uuid_1.generateUuid)(),
            usuarioId: input.usuarioId,
            empresaId: input.empresaId,
            rolId: input.rolId,
            activo: input.activo ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return this.membershipRepository.create(membership.toJSON());
    }
    async obtenerMembershipsPorUsuario(usuarioId) {
        return this.membershipRepository.findByUsuarioId(usuarioId);
    }
    async activarMembership(id) {
        const existing = await this.membershipRepository.findById(id);
        if (!existing) {
            throw new Error("Membership no encontrada");
        }
        const membership = new membership_1.Membership(existing);
        membership.activar();
        const updated = await this.membershipRepository.update(id, membership.toJSON());
        if (!updated) {
            throw new Error("No se pudo activar la membership");
        }
        return updated;
    }
    async desactivarMembership(id) {
        const existing = await this.membershipRepository.findById(id);
        if (!existing) {
            throw new Error("Membership no encontrada");
        }
        const membership = new membership_1.Membership(existing);
        membership.desactivar();
        const updated = await this.membershipRepository.update(id, membership.toJSON());
        if (!updated) {
            throw new Error("No se pudo desactivar la membership");
        }
        return updated;
    }
    async eliminarMembership(usuarioId, rolId, empresaId) {
        // allow removal or deactivation via repository
        await this.membershipRepository.deleteByUsuarioRolAndEmpresa(usuarioId, rolId, empresaId ?? null);
    }
}
exports.MembershipService = MembershipService;
