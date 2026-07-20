import { generateUuid } from "../../../shared/utils/uuid";
import { Permiso, type PermisoProps } from "../domain/permiso";
import { Rol, type RolProps } from "../domain/rol";
import type { RoleRepository } from "../infrastructure/role-repository";
import type { MembershipCreator } from "../../../shared/contracts/membership-creator";
import { GLOBAL_TENANT_ID } from "../../../shared/constants/tenant";

export type CreateRolInput = {
  empresaId?: string | null;
  tipo: "GLOBAL" | "TENANT";
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
};

export type UpdateRolInput = {
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
};

export type CreatePermisoInput = {
  nombre: string;
  slug: string;
  descripcion?: string | null;
  activo?: boolean;
};

export type UpdatePermisoInput = {
  nombre?: string;
  slug?: string;
  descripcion?: string | null;
  activo?: boolean;
};

export class RoleService {
  constructor(private readonly roleRepository: RoleRepository, private readonly membershipCreator: MembershipCreator) {}

  async crearRol(input: CreateRolInput): Promise<RolProps> {
    const rol = new Rol({
      id: generateUuid(),
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

  async listarRoles(): Promise<RolProps[]> {
    return this.roleRepository.findAll();
  }

  async obtenerRolPorId(id: string): Promise<RolProps | null> {
    return this.roleRepository.findById(id);
  }

  async listarRolesPorEmpresa(empresaId: string): Promise<RolProps[]> {
    return this.roleRepository.findByEmpresaId(empresaId);
  }

  async actualizarRol(id: string, input: UpdateRolInput): Promise<RolProps> {
    const existing = await this.roleRepository.findById(id);

    if (!existing) {
      throw new Error("Rol no encontrado");
    }

    const rol = new Rol(existing);

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
      } else {
        rol.desactivar();
      }
    }

    const updated = await this.roleRepository.updateRol(id, rol.toJSON());

    if (!updated) {
      throw new Error("No se pudo actualizar el rol");
    }

    return updated;
  }

  async activarRol(id: string): Promise<RolProps> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw new Error("Rol no encontrado");
    }

    const rol = new Rol(existing);
    rol.activar();

    const updated = await this.roleRepository.updateRol(id, rol.toJSON());
    if (!updated) {
      throw new Error("No se pudo activar el rol");
    }

    return updated;
  }

  async desactivarRol(id: string): Promise<RolProps> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw new Error("Rol no encontrado");
    }

    const rol = new Rol(existing);
    rol.desactivar();

    const updated = await this.roleRepository.updateRol(id, rol.toJSON());
    if (!updated) {
      throw new Error("No se pudo desactivar el rol");
    }

    return updated;
  }

  async crearPermiso(input: CreatePermisoInput): Promise<PermisoProps> {
    const permiso = new Permiso({
      id: generateUuid(),
      nombre: input.nombre,
      slug: input.slug,
      descripcion: input.descripcion ?? null,
      activo: input.activo ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.roleRepository.createPermiso(permiso.toJSON());
  }

  async listarPermisos(): Promise<PermisoProps[]> {
    return this.roleRepository.findAllPermisos();
  }

  async obtenerPermisoPorId(id: string): Promise<PermisoProps | null> {
    return this.roleRepository.findPermisoById(id);
  }

  async actualizarPermiso(id: string, input: UpdatePermisoInput): Promise<PermisoProps> {
    const existing = await this.roleRepository.findPermisoById(id);

    if (!existing) {
      throw new Error("Permiso no encontrado");
    }

    const permiso = new Permiso(existing);

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
      } else {
        permiso.desactivar();
      }
    }

    const updated = await this.roleRepository.updatePermiso(id, permiso.toJSON());

    if (!updated) {
      throw new Error("No se pudo actualizar el permiso");
    }

    return updated;
  }

  async activarPermiso(id: string): Promise<PermisoProps> {
    const existing = await this.roleRepository.findPermisoById(id);
    if (!existing) {
      throw new Error("Permiso no encontrado");
    }

    const permiso = new Permiso(existing);
    permiso.activar();

    const updated = await this.roleRepository.updatePermiso(id, permiso.toJSON());
    if (!updated) {
      throw new Error("No se pudo activar el permiso");
    }

    return updated;
  }

  async desactivarPermiso(id: string): Promise<PermisoProps> {
    const existing = await this.roleRepository.findPermisoById(id);
    if (!existing) {
      throw new Error("Permiso no encontrado");
    }

    const permiso = new Permiso(existing);
    permiso.desactivar();

    const updated = await this.roleRepository.updatePermiso(id, permiso.toJSON());
    if (!updated) {
      throw new Error("No se pudo desactivar el permiso");
    }

    return updated;
  }

  async asignarRolAUsuario(usuarioId: string, rolId: string): Promise<void> {
    const rol = await this.roleRepository.findById(rolId);

    if (!rol) {
      throw new Error("Rol no encontrado");
    }

    if (rol.tipo === "TENANT") {
      if (!rol.empresaId) {
        throw new Error("Rol TENANT sin empresaId");
      }
      await this.membershipCreator.crearMembership({ usuarioId, empresaId: rol.empresaId, rolId, activo: true });
      return;
    }

    await this.membershipCreator.crearMembership({ usuarioId, empresaId: GLOBAL_TENANT_ID, rolId, activo: true });
  }

  async removerRolDeUsuario(usuarioId: string, rolId: string): Promise<void> {
    await this.membershipCreator.eliminarMembership(usuarioId, rolId, null);
  }

  async asignarPermisoARol(rolId: string, permisoId: string): Promise<void> {
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

  async removerPermisoDeRol(rolId: string, permisoId: string): Promise<void> {
    await this.roleRepository.removePermissionFromRole(rolId, permisoId);
  }
}
