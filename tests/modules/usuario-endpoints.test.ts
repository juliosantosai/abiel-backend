import { afterAll, afterEach, describe, expect, it } from "vitest";
import Fastify from "fastify";
import { PrismaUsuarioRepository } from "../../src/modules/usuario/infrastructure/prisma-usuario-repository";
import { UsuarioService } from "../../src/modules/usuario/application/usuario-service";
import { registerUsuarioRoutes } from "../../src/modules/usuario/presentation/usuario-controller";
import { prisma } from "../../src/shared/database/prisma";

describe("Usuario HTTP endpoints", () => {
  const app = Fastify();
  const repository = new PrismaUsuarioRepository();
  const service = new UsuarioService(repository);

  registerUsuarioRoutes(app, service);

  afterEach(async () => {
    await prisma.usuario.deleteMany({
      where: {
        empresaId: "empresa-endpoint-1",
      },
    });
    await prisma.empresa.deleteMany({ where: { id: "empresa-endpoint-1" } });
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates, lists, retrieves, updates and deletes a usuario", async () => {
    await prisma.empresa.create({
      data: {
        id: "empresa-endpoint-1",
        nombre: "Empresa Endpoint Test",
        plan: "STARTER",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const createResponse = await app.inject({
      method: "POST",
      url: "/usuarios",
      payload: {
        empresaId: "empresa-endpoint-1",
        nombre: "Usuario Endpoint Test",
        email: "endpoint@example.com",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json();
    expect(created).toHaveProperty("id");
    expect(created.empresaId).toBe("empresa-endpoint-1");
    expect(created.nombre).toBe("Usuario Endpoint Test");
    expect(created.email).toBe("endpoint@example.com");
    expect(created.activo).toBe(true);

    const listResponse = await app.inject({ method: "GET", url: "/usuarios" });
    expect(listResponse.statusCode).toBe(200);
    const usuarios = listResponse.json();
    expect(Array.isArray(usuarios)).toBe(true);
    expect(usuarios.some((item: any) => item.id === created.id)).toBe(true);

    const getResponse = await app.inject({ method: "GET", url: `/usuarios/${created.id}` });
    expect(getResponse.statusCode).toBe(200);
    const found = getResponse.json();
    expect(found.id).toBe(created.id);
    expect(found.nombre).toBe("Usuario Endpoint Test");

    const updateResponse = await app.inject({
      method: "PUT",
      url: `/usuarios/${created.id}`,
      payload: {
        email: "updated@example.com",
      },
    });
    expect(updateResponse.statusCode).toBe(200);
    const updated = updateResponse.json();
    expect(updated.email).toBe("updated@example.com");

    const activateResponse = await app.inject({ method: "PATCH", url: `/usuarios/${created.id}/activar` });
    expect(activateResponse.statusCode).toBe(200);
    const activated = activateResponse.json();
    expect(activated.activo).toBe(true);

    const deactivateResponse = await app.inject({ method: "PATCH", url: `/usuarios/${created.id}/desactivar` });
    expect(deactivateResponse.statusCode).toBe(200);
    const deactivated = deactivateResponse.json();
    expect(deactivated.activo).toBe(false);
  });
});
