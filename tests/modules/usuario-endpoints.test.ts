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
        id: {
          startsWith: "usuario-endpoint-",
        },
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates, lists, retrieves, updates and deletes a usuario", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/usuarios",
      payload: {
        nombre: "Usuario Endpoint Test",
        email: "endpoint@example.com",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json();
    expect(created).toHaveProperty("id");
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
        activo: false,
      },
    });
    expect(updateResponse.statusCode).toBe(200);
    const updated = updateResponse.json();
    expect(updated.email).toBe("updated@example.com");
    expect(updated.activo).toBe(false);

    const deleteResponse = await app.inject({ method: "DELETE", url: `/usuarios/${created.id}` });
    expect(deleteResponse.statusCode).toBe(204);

    const deletedGetResponse = await app.inject({ method: "GET", url: `/usuarios/${created.id}` });
    expect(deletedGetResponse.statusCode).toBe(404);
  });
});
