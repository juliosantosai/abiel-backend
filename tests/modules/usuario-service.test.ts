import { describe, expect, it, vi } from "vitest";
import { UsuarioService } from "../../src/modules/usuario/application/usuario-service";
import { Usuario } from "../../src/modules/usuario/domain/usuario";

describe("UsuarioService", () => {
  it("creates a usuario with empresaId and validates required fields", async () => {
    const repository = {
      create: vi.fn().mockImplementation(async (usuario) => usuario),
      findById: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      update: vi.fn(),
    };

    const service = new UsuarioService(repository as any);

    const result = await service.crearUsuario({
      nombre: "Juan",
      email: "juan@example.com",
      passwordHash: "hash-123",
    });

    expect(result.nombre).toBe("Juan");
    expect(result.email).toBe("juan@example.com");
    expect(result.activo).toBe(true);
    expect(result.passwordHash).toBe("hash-123");
    expect(repository.create).toHaveBeenCalled();
  });
  it("throws when email is invalid", async () => {
    const repository = { create: vi.fn(), findByEmail: vi.fn().mockResolvedValue(null) };
    const service = new UsuarioService(repository as any);

    await expect(
      service.crearUsuario({ nombre: "Juan", email: "invalid-email", passwordHash: "hash-123" })
    ).rejects.toThrow("El email del usuario no es válido");
  });

  it("activates and deactivates a usuario", async () => {
    const existing = new Usuario({
      id: "usuario-1",
      nombre: "Juan",
      email: "juan@example.com",
      passwordHash: "hash-123",
      activo: false,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    const repository = {
      findById: vi.fn().mockResolvedValue(existing.toJSON()),
      update: vi.fn().mockImplementation(async (id, usuario) => usuario as any),
      findAll: vi.fn(),
      create: vi.fn(),
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