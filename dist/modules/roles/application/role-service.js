"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const uuid_1 = require("../../../shared/utils/uuid");
const permiso_1 = require("../domain/permiso");
const rol_1 = require("../domain/rol");
class RoleService {
    roleRepository;
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async crearRol(input) {
        const rol = new rol_1.Rol({
            id: (0, uuid_1.generateUuid)(),
            empresaId: input.empresaId ?? null,
            tipo: input.tipo,
            nombre: input.nombre,
            descripcion: input.descripcion ?? null,
            activo: input.activo ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const existing = await this.roleRepository.findByNameAndType(rol.nombre, rol.tipo, rol.empresaId);
        if (existing) {
            throw new Error(input.tipo === "GLOBAL" ? "Ya existe un rol GLOBAL con ese nombre" : "Ya existe un rol TENANT con ese nombre en la empresa");
        }
        return this.roleRepository.createRol(rol.toJSON());
    }
    async listarRoles() {
        return this.roleRepository.findAll();
    }
    async obtenerRolPorId(id) {
        return this.roleRepository.findById(id);
    }
    async listarRolesPorEmpresa(empresaId) {
        return this.roleRepository.findByEmpresaId(empresaId);
    }
    async actualizarRol(id, input) {
        const existing = await this.roleRepository.findById(id);
        if (!existing) {
            throw new Error("Rol no encontrado");
        }
        const rol = new rol_1.Rol(existing);
        if (input.nombre !== undefined) {
            rol.actualizarNombre(input.nombre);
        }
        if (input.nombre !== undefined || input.descripcion !== undefined || input.activo !== undefined) {
            const duplicate = await this.roleRepository.findByNameAndTypeExcludingId(existing.id, rol.nombre, rol.tipo, rol.empresaId);
            if (duplicate) {
                throw new Error(rol.tipo === "GLOBAL" ? "Ya existe un rol GLOBAL con ese nombre" : "Ya existe un rol TENANT con ese nombre en la empresa");
            }
        }
        if (input.descripcion !== undefined) {
            rol.actualizarDescripcion(input.descripcion);
        }
        if (input.activo !== undefined) {
            if (input.activo) {
                rol.activar();
            }
            else {
                rol.desactivar();
            }
        }
        const updated = await this.roleRepository.updateRol(id, rol.toJSON());
        if (!updated) {
            throw new Error("No se pudo actualizar el rol");
        }
        return updated;
    }
    async activarRol(id) {
        const existing = await this.roleRepository.findById(id);
        if (!existing) {
            throw new Error("Rol no encontrado");
        }
        const rol = new rol_1.Rol(existing);
        rol.activar();
        const updated = await this.roleRepository.updateRol(id, rol.toJSON());
        if (!updated) {
            throw new Error("No se pudo activar el rol");
        }
        return updated;
    }
    async desactivarRol(id) {
        const existing = await this.roleRepository.findById(id);
        if (!existing) {
            throw new Error("Rol no encontrado");
        }
        const rol = new rol_1.Rol(existing);
        rol.desactivar();
        const updated = await this.roleRepository.updateRol(id, rol.toJSON());
        if (!updated) {
            throw new Error("No se pudo desactivar el rol");
        }
        return updated;
    }
    async crearPermiso(input) {
        const permiso = new permiso_1.Permiso({
            id: (0, uuid_1.generateUuid)(),
            nombre: input.nombre,
            slug: input.slug,
            descripcion: input.descripcion ?? null,
            activo: input.activo ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return this.roleRepository.createPermiso(permiso.toJSON());
    }
    async listarPermisos() {
        return this.roleRepository.findAllPermisos();
    }
    async obtenerPermisoPorId(id) {
        return this.roleRepository.findPermisoById(id);
    }
    async actualizarPermiso(id, input) {
        const existing = await this.roleRepository.findPermisoById(id);
        if (!existing) {
            throw new Error("Permiso no encontrado");
        }
        const permiso = new permiso_1.Permiso(existing);
        if (input.nombre !== undefined) {
            permiso.actualizarNombre(input.nombre);
        }
        if (input.slug !== undefined) {
            permiso.actualizarSlug(input.slug);
        }
        if (input.descripcion !== undefined) {
            permiso.actualizarDescripcion(input.descripcion);
        }
        if (input.activo !== undefined) {
            if (input.activo) {
                permiso.activar();
            }
            else {
                permiso.desactivar();
            }
        }
        const updated = await this.roleRepository.updatePermiso(id, permiso.toJSON());
        if (!updated) {
            throw new Error("No se pudo actualizar el permiso");
        }
        return updated;
    }
    async activarPermiso(id) {
        const existing = await this.roleRepository.findPermisoById(id);
        if (!existing) {
            throw new Error("Permiso no encontrado");
        }
        const permiso = new permiso_1.Permiso(existing);
        permiso.activar();
        const updated = await this.roleRepository.updatePermiso(id, permiso.toJSON());
        if (!updated) {
            throw new Error("No se pudo activar el permiso");
        }
        return updated;
    }
    async desactivarPermiso(id) {
        const existing = await this.roleRepository.findPermisoById(id);
        if (!existing) {
            throw new Error("Permiso no encontrado");
        }
        const permiso = new permiso_1.Permiso(existing);
        permiso.desactivar();
        const updated = await this.roleRepository.updatePermiso(id, permiso.toJSON());
        if (!updated) {
            throw new Error("No se pudo desactivar el permiso");
        }
        return updated;
    }
    async asignarRolAUsuario(usuarioId, rolId) {
        const usuario = await this.roleRepository.findUsuarioById(usuarioId);
        const rol = await this.roleRepository.findById(rolId);
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }
        if (!rol) {
            throw new Error("Rol no encontrado");
        }
        if (rol.tipo === "TENANT" && rol.empresaId && usuario.empresaId !== rol.empresaId) {
            throw new Error("El usuario y el rol deben pertenecer al mismo tenant");
        }
        await this.roleRepository.assignRoleToUser(usuarioId, rolId);
    }
    async removerRolDeUsuario(usuarioId, rolId) {
        await this.roleRepository.removeRoleFromUser(usuarioId, rolId);
    }
    async asignarPermisoARol(rolId, permisoId) {
        const rol = await this.roleRepository.findById(rolId);
        const permiso = await this.roleRepository.findPermisoById(permisoId);
        if (!rol) {
            throw new Error("Rol no encontrado");
        }
        if (!permiso) {
            throw new Error("Permiso no encontrado");
        }
        const existingAssociation = await this.roleRepository.findRolPermisoByRolAndPermiso(rolId, permisoId);
        if (existingAssociation) {
            throw new Error("La asociación entre el rol y el permiso ya existe");
        }
        await this.roleRepository.assignPermissionToRole(rolId, permisoId);
    }
    async removerPermisoDeRol(rolId, permisoId) {
        await this.roleRepository.removePermissionFromRole(rolId, permisoId);
    }
}
exports.RoleService = RoleService;
