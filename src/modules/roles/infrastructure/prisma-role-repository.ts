import { prisma } from "../../../shared/database/prisma";
import type { PermisoProps } from "../domain/permiso";
import type { RolProps } from "../domain/rol";
import type { RoleRepository } from "./role-repository";

export class PrismaRoleRepository implements RoleRepository {
  async findById(id: string): Promise<RolProps | null> {
    return prisma.rol.findUnique({ where: { id } });
  }

  async findAll(): Promise<RolProps[]> {
    return prisma.rol.findMany();
  }

  async findByEmpresaId(empresaId: string): Promise<RolProps[]> {
    return prisma.rol.findMany({ where: { empresaId } });
  }

  async findByNameAndType(nombre: string, tipo: "GLOBAL" | "TENANT", empresaId?: string | null): Promise<RolProps | null> {
    return prisma.rol.findFirst({
      where: {
        nombre,
        tipo,
        ...(empresaId === null ? { empresaId: null } : empresaId ? { empresaId } : {}),
      },
    });
  }

  async findByNameAndTypeExcludingId(id: string, nombre: string, tipo: "GLOBAL" | "TENANT", empresaId?: string | null): Promise<RolProps | null> {
    return prisma.rol.findFirst({
      where: {
        id: { not: id },
        nombre,
        tipo,
        ...(empresaId === null ? { empresaId: null } : empresaId ? { empresaId } : {}),
      },
    });
  }

  async createRol(rol: RolProps): Promise<RolProps> {
    return prisma.rol.create({ data: rol });
  }

  async updateRol(id: string, rol: Partial<RolProps>): Promise<RolProps | null> {
    return prisma.rol.update({ where: { id }, data: rol });
  }

  async findPermisoById(id: string): Promise<PermisoProps | null> {
    return prisma.permiso.findUnique({ where: { id } });
  }

  async findAllPermisos(): Promise<PermisoProps[]> {
    return prisma.permiso.findMany();
  }

  async createPermiso(permiso: PermisoProps): Promise<PermisoProps> {
    return prisma.permiso.create({ data: permiso });
  }

  async updatePermiso(id: string, permiso: Partial<PermisoProps>): Promise<PermisoProps | null> {
    return prisma.permiso.update({ where: { id }, data: permiso });
  }

  async findUsuarioById(id: string): Promise<{ id: string; empresaId: string } | null> {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    return usuario ? { id: usuario.id, empresaId: usuario.empresaId } : null;
  }

  async assignRoleToUser(usuarioId: string, rolId: string): Promise<void> {
    await prisma.usuarioRol.create({ data: { id: `${usuarioId}-${rolId}`, usuarioId, rolId, activo: true, createdAt: new Date(), updatedAt: new Date() } });
  }

  async removeRoleFromUser(usuarioId: string, rolId: string): Promise<void> {
    await prisma.usuarioRol.deleteMany({ where: { usuarioId, rolId } });
  }

  async findRolPermisoByRolAndPermiso(rolId: string, permisoId: string): Promise<{ id: string } | null> {
    const existing = await prisma.rolPermiso.findFirst({ where: { rolId, permisoId } });
    return existing ? { id: existing.id } : null;
  }

  async assignPermissionToRole(rolId: string, permisoId: string): Promise<void> {
    await prisma.rolPermiso.create({ data: { id: `${rolId}-${permisoId}`, rolId, permisoId, activo: true, createdAt: new Date(), updatedAt: new Date() } });
  }

  async removePermissionFromRole(rolId: string, permisoId: string): Promise<void> {
    await prisma.rolPermiso.deleteMany({ where: { rolId, permisoId } });
  }
}
