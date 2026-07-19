import { describe, expect, it, vi } from "vitest";
import { RoleService } from "../../src/modules/roles/application/role-service";

describe("roles service", () => {
  it("creates a global role", async () => {
    const repository = {
      createRol: vi.fn().mockResolvedValue({
        id: "rol-1",
        empresaId: null,
        tipo: "GLOBAL",
        nombre: "SUPER_ADMIN",
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmpresaId: vi.fn(),
      updateRol: vi.fn(),
      findPermisoById: vi.fn(),
      findAllPermisos: vi.fn(),
      createPermiso: vi.fn(),
      updatePermiso: vi.fn(),
      assignRoleToUser: vi.fn(),
      removeRoleFromUser: vi.fn(),
      assignPermissionToRole: vi.fn(),
      removePermissionFromRole: vi.fn(),
    };

    const service = new RoleService(repository as any);
    const rol = await service.crearRol({ tipo: "GLOBAL", nombre: "SUPER_ADMIN" });

    expect(rol.tipo).toBe("GLOBAL");
    expect(rol.empresaId).toBeNull();
  });

  it("creates a permission", async () => {
    const repository = {
      createPermiso: vi.fn().mockResolvedValue({
        id: "permiso-1",
        nombre: "Ver dashboard",
        slug: "dashboard.ver",
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmpresaId: vi.fn(),
      createRol: vi.fn(),
      updateRol: vi.fn(),
      findPermisoById: vi.fn(),
      findAllPermisos: vi.fn(),
      updatePermiso: vi.fn(),
      assignRoleToUser: vi.fn(),
      removeRoleFromUser: vi.fn(),
      assignPermissionToRole: vi.fn(),
      removePermissionFromRole: vi.fn(),
    };

    const service = new RoleService(repository as any);
    const permiso = await service.crearPermiso({ nombre: "Ver dashboard", slug: "dashboard.ver" });

    expect(permiso.slug).toBe("dashboard.ver");
  });
});
