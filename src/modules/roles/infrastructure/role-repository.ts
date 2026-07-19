import type { PermisoProps } from "../domain/permiso";
import type { RolProps } from "../domain/rol";

export interface RoleRepository {
  findById(id: string): Promise<RolProps | null>;
  findAll(): Promise<RolProps[]>;
  findByEmpresaId(empresaId: string): Promise<RolProps[]>;
  findByNameAndType(nombre: string, tipo: "GLOBAL" | "TENANT", empresaId?: string | null): Promise<RolProps | null>;
  findByNameAndTypeExcludingId(id: string, nombre: string, tipo: "GLOBAL" | "TENANT", empresaId?: string | null): Promise<RolProps | null>;
  createRol(rol: RolProps): Promise<RolProps>;
  updateRol(id: string, rol: Partial<RolProps>): Promise<RolProps | null>;
  findPermisoById(id: string): Promise<PermisoProps | null>;
  findAllPermisos(): Promise<PermisoProps[]>;
  createPermiso(permiso: PermisoProps): Promise<PermisoProps>;
  updatePermiso(id: string, permiso: Partial<PermisoProps>): Promise<PermisoProps | null>;
  // Membership operations are handled by the Usuario module (MembershipService)
  findRolPermisoByRolAndPermiso(rolId: string, permisoId: string): Promise<{ id: string } | null>;
  assignPermissionToRole(rolId: string, permisoId: string): Promise<void>;
  removePermissionFromRole(rolId: string, permisoId: string): Promise<void>;
}
