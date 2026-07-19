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
      findByNameAndType: vi.fn().mockResolvedValue(null),
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

  it("creates a tenant role", async () => {
    const repository = {
      createRol: vi.fn().mockResolvedValue({
        id: "rol-2",
        empresaId: "empresa-a",
        tipo: "TENANT",
        nombre: "ADMIN",
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findAll: vi.fn(),
      findById: vi.fn(),
      findByEmpresaId: vi.fn(),
      findByNameAndType: vi.fn().mockResolvedValue(null),
      findByNameAndTypeExcludingId: vi.fn().mockResolvedValue(null),
      updateRol: vi.fn(),
      findPermisoById: vi.fn(),
      findAllPermisos: vi.fn(),
      createPermiso: vi.fn(),
      updatePermiso: vi.fn(),
      assignRoleToUser: vi.fn(),
      removeRoleFromUser: vi.fn(),
      assignPermissionToRole: vi.fn(),
      removePermissionFromRole: vi.fn(),
      findUsuarioById: vi.fn(),
      findRolPermisoByRolAndPermiso: vi.fn(),
    };

    const service = new RoleService(repository as any);
    const rol = await service.crearRol({ tipo: "TENANT", nombre: "ADMIN", empresaId: "empresa-a" });

    expect(rol.tipo).toBe("TENANT");
    expect(rol.empresaId).toBe("empresa-a");
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
      findByNameAndType: vi.fn(),
      findByNameAndTypeExcludingId: vi.fn(),
      createRol: vi.fn(),
      updateRol: vi.fn(),
      findPermisoById: vi.fn(),
      findAllPermisos: vi.fn(),
      updatePermiso: vi.fn(),
      assignRoleToUser: vi.fn(),
      removeRoleFromUser: vi.fn(),
      assignPermissionToRole: vi.fn(),
      removePermissionFromRole: vi.fn(),
      findUsuarioById: vi.fn(),
      findRolPermisoByRolAndPermiso: vi.fn(),
    };

    const service = new RoleService(repository as any);
    const permiso = await service.crearPermiso({ nombre: "Ver dashboard", slug: "dashboard.ver" });

    expect(permiso.slug).toBe("dashboard.ver");
  });

  it("rejects global roles with company id", async () => {
    const repository = {
      findByNameAndType: vi.fn(),
      findByNameAndTypeExcludingId: vi.fn(),
      createRol: vi.fn(),
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
      findUsuarioById: vi.fn(),
      findRolPermisoByRolAndPermiso: vi.fn(),
    };

    const service = new RoleService(repository as any);

    await expect(service.crearRol({ tipo: "GLOBAL", nombre: "SUPER_ADMIN", empresaId: "empresa-a" })).rejects.toThrow(
      "Los roles GLOBAL no deben tener empresaId"
    );
  });

  it("rejects tenant roles without company id", async () => {
    const repository = {
      findByNameAndType: vi.fn(),
      findByNameAndTypeExcludingId: vi.fn(),
      createRol: vi.fn(),
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
      findUsuarioById: vi.fn(),
      findRolPermisoByRolAndPermiso: vi.fn(),
    };

    const service = new RoleService(repository as any);

    await expect(service.crearRol({ tipo: "TENANT", nombre: "ADMIN" })).rejects.toThrow(
      "El empresaId es obligatorio para roles TENANT"
    );
  });

  it("rejects duplicate tenant roles within the same company", async () => {
    const repository = {
      findByNameAndType: vi.fn().mockResolvedValue({ id: "rol-existing" }),
      findByNameAndTypeExcludingId: vi.fn().mockResolvedValue({ id: "rol-existing" }),
      createRol: vi.fn(),
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
      findUsuarioById: vi.fn(),
      findRolPermisoByRolAndPermiso: vi.fn(),
    };

    const service = new RoleService(repository as any);

    await expect(service.crearRol({ tipo: "TENANT", nombre: "ADMIN", empresaId: "empresa-a" })).rejects.toThrow(
      "Ya existe un rol TENANT con ese nombre en la empresa"
    );
  });

  it("allows the same tenant role name in different companies", async () => {
    const repository = {
      findByNameAndType: vi.fn().mockResolvedValue(null),
      findByNameAndTypeExcludingId: vi.fn().mockResolvedValue(null),
      createRol: vi.fn().mockResolvedValue({
        id: "rol-3",
        empresaId: "empresa-b",
        tipo: "TENANT",
        nombre: "ADMIN",
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
      findUsuarioById: vi.fn(),
      findRolPermisoByRolAndPermiso: vi.fn(),
    };

    const service = new RoleService(repository as any);

    const rol = await service.crearRol({ tipo: "TENANT", nombre: "ADMIN", empresaId: "empresa-b" });

    expect(rol.empresaId).toBe("empresa-b");
  });

  it("rejects duplicate global roles", async () => {
    const repository = {
      findByNameAndType: vi.fn().mockResolvedValue({ id: "rol-existing" }),
      findByNameAndTypeExcludingId: vi.fn().mockResolvedValue({ id: "rol-existing" }),
      createRol: vi.fn(),
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
      findUsuarioById: vi.fn(),
      findRolPermisoByRolAndPermiso: vi.fn(),
    };

    const service = new RoleService(repository as any);

    await expect(service.crearRol({ tipo: "GLOBAL", nombre: "SUPER_ADMIN" })).rejects.toThrow(
      "Ya existe un rol GLOBAL con ese nombre"
    );
  });

  it("rejects duplicate role names when updating an existing role", async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue({
        id: "rol-1",
        empresaId: "empresa-a",
        tipo: "TENANT",
        nombre: "ADMIN",
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findByNameAndType: vi.fn(),
      findByNameAndTypeExcludingId: vi.fn().mockResolvedValue({ id: "rol-2" }),
      createRol: vi.fn(),
      updateRol: vi.fn(),
      findPermisoById: vi.fn(),
      findAllPermisos: vi.fn(),
      createPermiso: vi.fn(),
      updatePermiso: vi.fn(),
      assignRoleToUser: vi.fn(),
      removeRoleFromUser: vi.fn(),
      assignPermissionToRole: vi.fn(),
      removePermissionFromRole: vi.fn(),
      findUsuarioById: vi.fn(),
      findRolPermisoByRolAndPermiso: vi.fn(),
      findAll: vi.fn(),
      findByEmpresaId: vi.fn(),
    };

    const service = new RoleService(repository as any);

    await expect(service.actualizarRol("rol-1", { nombre: "ADMIN" })).rejects.toThrow(
      "Ya existe un rol TENANT con ese nombre en la empresa"
    );
  });

  it("rejects duplicate permission associations", async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue({
        id: "rol-1",
        empresaId: null,
        tipo: "GLOBAL",
        nombre: "SUPER_ADMIN",
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findPermisoById: vi.fn().mockResolvedValue({
        id: "permiso-1",
        nombre: "Ver dashboard",
        slug: "dashboard.ver",
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findRolPermisoByRolAndPermiso: vi.fn().mockResolvedValue({ id: "existing-association" }),
      assignPermissionToRole: vi.fn(),
      findByNameAndType: vi.fn(),
      findByNameAndTypeExcludingId: vi.fn(),
      createRol: vi.fn(),
      updateRol: vi.fn(),
      findAllPermisos: vi.fn(),
      createPermiso: vi.fn(),
      updatePermiso: vi.fn(),
      assignRoleToUser: vi.fn(),
      removeRoleFromUser: vi.fn(),
      removePermissionFromRole: vi.fn(),
      findUsuarioById: vi.fn(),
      findAll: vi.fn(),
      findByEmpresaId: vi.fn(),
    };

    const service = new RoleService(repository as any);

    await expect(service.asignarPermisoARol("rol-1", "permiso-1")).rejects.toThrow(
      "La asociación entre el rol y el permiso ya existe"
    );
  });

  it("rejects role assignment for users from another tenant", async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue({
        id: "rol-10",
        empresaId: "empresa-b",
        tipo: "TENANT",
        nombre: "soporte",
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findUsuarioById: vi.fn().mockResolvedValue({ id: "usuario-1" }),
      findByNameAndType: vi.fn(),
      findByNameAndTypeExcludingId: vi.fn(),
      createRol: vi.fn(),
      findAll: vi.fn(),
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
      findRolPermisoByRolAndPermiso: vi.fn(),
    };

    const membershipCreator = {
      crearMembership: vi.fn().mockRejectedValue(new Error("El usuario y el rol deben pertenecer al mismo tenant")),
      eliminarMembership: vi.fn(),
    };

    const service = new RoleService(repository as any, membershipCreator as any);

    await expect(service.asignarRolAUsuario("usuario-1", "rol-10")).rejects.toThrow(
      "El usuario y el rol deben pertenecer al mismo tenant"
    );
  });
});
