import { describe, expect, it, vi } from "vitest";
import { UsuarioService } from "../../src/modules/usuario/application/usuario-service";
import { Usuario } from "../../src/modules/usuario/domain/usuario";

describe("UsuarioService", () => {
  it("creates a usuario with empresaId and validates required fields", async () => {
    const repository = {
      create: vi.fn().mockImplementation(async (usuario) => usuario),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      findByEmpresaId: vi.fn(),
      findByIdAndEmpresaId: vi.fn(),
    };

    const service = new UsuarioService(repository as any);

    const result = await service.crearUsuario({
      empresaId: "empresa-1",
      nombre: "Juan",
      email: "juan@example.com",
    });

    expect(result.empresaId).toBe("empresa-1");
    expect(result.nombre).toBe("Juan");
    expect(result.email).toBe("juan@example.com");
    expect(result.activo).toBe(true);
    expect(repository.create).toHaveBeenCalled();
  });

  it("throws when empresaId is missing", async () => {
    const repository = { create: vi.fn() };
    const service = new UsuarioService(repository as any);

    await expect(
      service.crearUsuario({ nombre: "Juan", email: "juan@example.com", empresaId: "" })
    ).rejects.toThrow("El empresaId del usuario es obligatorio");
  });

  it("throws when email is invalid", async () => {
    const repository = { create: vi.fn() };
    const service = new UsuarioService(repository as any);

    await expect(
      service.crearUsuario({ empresaId: "empresa-1", nombre: "Juan", email: "invalid-email" })
    ).rejects.toThrow("El email del usuario no es válido");
  });

  it("activates and deactivates a usuario", async () => {
    const existing = new Usuario({
      id: "usuario-1",
      empresaId: "empresa-1",
      nombre: "Juan",
      email: "juan@example.com",
      activo: false,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    const repository = {
      findById: vi.fn().mockResolvedValue(existing.toJSON()),
      update: vi.fn().mockImplementation(async (id, usuario) => usuario as any),
      findAll: vi.fn(),
      create: vi.fn(),
      findByEmpresaId: vi.fn(),
      findByIdAndEmpresaId: vi.fn(),
    };

    const service = new UsuarioService(repository as any);

    const activated = await service.activarUsuario("usuario-1");
    expect(activated.activo).toBe(true);
    expect(repository.update).toHaveBeenCalled();

    const deactivated = await service.desactivarUsuario("usuario-1");
    expect(deactivated.activo).toBe(false);
    expect(repository.update).toHaveBeenCalledTimes(2);
  });
});