import { describe, it, expect, vi } from "vitest";
import { UsuarioService } from "../../src/modules/usuario/application/usuario-service";
import { UsuarioController } from "../../src/modules/usuario/presentation/usuario-controller";

describe("usuario module", () => {
  it("finds a user by email through the service", async () => {
    const usuario = {
      id: "user-1",
      nombre: "Admin",
      email: "admin@abiel.com",
      passwordHash: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const repository = {
      findByEmail: vi.fn().mockResolvedValue(usuario),
    };

    const service = new UsuarioService(repository as any);
    await expect(service.findByEmail("admin@abiel.com")).resolves.toEqual(usuario);
  });

  it("creates a user through the controller", async () => {
    const usuario = {
      id: "user-1",
      nombre: "Admin",
      email: "admin@abiel.com",
      passwordHash: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const service = { create: vi.fn().mockResolvedValue(usuario) };
    const controller = new UsuarioController(service as any);
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnValue({ ok: true }) };

    await controller.create({ body: usuario } as any, reply as any);

    expect(service.create).toHaveBeenCalledWith(usuario);
    expect(reply.status).toHaveBeenCalledWith(201);
  });
});
