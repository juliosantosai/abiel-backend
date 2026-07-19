import { describe, it, expect, vi } from "vitest";
import Fastify from "fastify";
import { Usuario } from "../../src/modules/usuario/domain/usuario";
import { UsuarioService } from "../../src/modules/usuario/application/usuario-service";
import { registerUsuarioRoutes } from "../../src/modules/usuario/presentation/usuario-controller";

describe("usuario module", () => {
  it("creates a usuario and validates required fields", async () => {
    const repository = {
      create: vi.fn().mockImplementation(async (usuario) => usuario),
      findByEmail: vi.fn().mockResolvedValue(null),
    };

    const service = new UsuarioService(repository as any);

    const result = await service.crearUsuario({
      nombre: "Juan",
      email: "juan@example.com",
      passwordHash: "hash-123",
    });

    expect(result.nombre).toBe("Juan");
    expect(result.email).toBe("juan@example.com");
    expect(result.passwordHash).toBe("hash-123");
    expect(result.activo).toBe(true);
    expect(repository.create).toHaveBeenCalled();
  });

  it("throws when email is invalid", async () => {
    const repository = { create: vi.fn(), findByEmail: vi.fn().mockResolvedValue(null) };
    const service = new UsuarioService(repository as any);

    await expect(
      service.crearUsuario({ nombre: "Juan", email: "invalid-email", passwordHash: "hash-123" })
    ).rejects.toThrow("El email del usuario no es válido");
  });

  it("changes nombre and email on Usuario entity", () => {
    const usuario = new Usuario({
      id: "usuario-1",
      nombre: "Juan",
      email: "juan@example.com",
      passwordHash: "hash-123",
      activo: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    usuario.cambiarNombre("Pedro");
    expect(usuario.nombre).toBe("Pedro");

    usuario.cambiarEmail("pedro@example.com");
    expect(usuario.email).toBe("pedro@example.com");

    usuario.desactivar();
    expect(usuario.activo).toBe(false);
  });

  it("exposes HTTP endpoints for usuarios", async () => {
    const service = {
      obtenerUsuarios: vi.fn().mockResolvedValue([]),
      obtenerUsuarioPorId: vi.fn().mockResolvedValue({
        id: "usuario-1",
        nombre: "Juan",
        email: "juan@example.com",
        passwordHash: "hash-123",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      crearUsuario: vi.fn().mockImplementation(async (input) => ({
        id: "usuario-2",
        nombre: input.nombre,
        email: input.email,
        passwordHash: input.passwordHash,
        activo: input.activo ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      actualizarUsuario: vi.fn().mockImplementation(async (id, input) => ({
        id,
        nombre: input.nombre ?? "Juan",
        email: input.email ?? "juan@example.com",
        passwordHash: "hash-123",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      activarUsuario: vi.fn().mockImplementation(async (id) => ({
        id,
        nombre: "Juan",
        email: "juan@example.com",
        passwordHash: "hash-123",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      desactivarUsuario: vi.fn().mockImplementation(async (id) => ({
        id,
        nombre: "Juan",
        email: "juan@example.com",
        passwordHash: "hash-123",
        activo: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };

    const app = Fastify();
    registerUsuarioRoutes(app, service as any);

    const createResponse = await app.inject({
      method: "POST",
      url: "/usuarios",
      payload: { nombre: "Juan", email: "juan@example.com", passwordHash: "hash-123" },
    });
    expect(createResponse.statusCode).toBe(201);

    const listResponse = await app.inject({ method: "GET", url: "/usuarios" });
    expect(listResponse.statusCode).toBe(200);

    const getResponse = await app.inject({ method: "GET", url: "/usuarios/usuario-1" });
    expect(getResponse.statusCode).toBe(200);

    const updateResponse = await app.inject({
      method: "PUT",
      url: "/usuarios/usuario-1",
      payload: { email: "pedro@example.com" },
    });
    expect(updateResponse.statusCode).toBe(200);

    const activateResponse = await app.inject({ method: "PATCH", url: "/usuarios/usuario-1/activar" });
    expect(activateResponse.statusCode).toBe(200);

    const deactivateResponse = await app.inject({ method: "PATCH", url: "/usuarios/usuario-1/desactivar" });
    expect(deactivateResponse.statusCode).toBe(200);

    await app.close();
  });
});
