import { describe, expect, it } from "vitest";
import { Rol } from "../../src/modules/roles/domain/rol";
import { Permiso } from "../../src/modules/roles/domain/permiso";

describe("roles domain", () => {
  it("creates a global role with no empresaId", () => {
    const rol = new Rol({
      id: "rol-1",
      empresaId: null,
      tipo: "GLOBAL",
      nombre: "SUPER_ADMIN",
      descripcion: "Super admin",
      activo: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    expect(rol.tipo).toBe("GLOBAL");
    expect(rol.empresaId).toBeNull();
    expect(rol.nombre).toBe("SUPER_ADMIN");
  });

  it("creates a tenant role only when empresaId is provided", () => {
    const rol = new Rol({
      id: "rol-2",
      empresaId: "empresa-1",
      tipo: "TENANT",
      nombre: "vendedor",
      descripcion: "Vendedor",
      activo: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    expect(rol.empresaId).toBe("empresa-1");
  });

  it("throws when tenant role lacks empresaId", () => {
    expect(
      () =>
        new Rol({
          id: "rol-3",
          empresaId: null,
          tipo: "TENANT",
          nombre: "soporte",
          descripcion: "Soporte",
          activo: true,
          createdAt: new Date("2026-01-01T00:00:00Z"),
          updatedAt: new Date("2026-01-01T00:00:00Z"),
        })
    ).toThrow("El empresaId es obligatorio para roles TENANT");
  });

  it("creates a permission with a valid slug", () => {
    const permiso = new Permiso({
      id: "permiso-1",
      nombre: "Ver dashboard",
      slug: "dashboard.ver",
      descripcion: "Permiso para ver dashboard",
      activo: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    expect(permiso.slug).toBe("dashboard.ver");
  });

  it("throws when permission slug is empty", () => {
    expect(
      () =>
        new Permiso({
          id: "permiso-2",
          nombre: "Permiso inválido",
          slug: "",
          descripcion: "",
          activo: true,
          createdAt: new Date("2026-01-01T00:00:00Z"),
          updatedAt: new Date("2026-01-01T00:00:00Z"),
        })
    ).toThrow("El slug del permiso es obligatorio");
  });
});
