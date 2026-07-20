import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import Fastify from "fastify";
import { PrismaEmpresaRepository } from "../../src/modules/empresa/infrastructure/prisma-empresa-repository";
import { EmpresaService } from "../../src/modules/empresa/application/empresa-service";
import { registerEmpresaRoutes } from "../../src/modules/empresa/presentation/empresa-controller";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

describe("Empresa HTTP endpoints", () => {
  const app = Fastify();
  const repository = new PrismaEmpresaRepository();
  const service = new EmpresaService(repository);

  beforeAll(() => {
    ensurePrismaSchema();
  });

  registerEmpresaRoutes(app, service);

  afterEach(async () => {
    await prisma.empresa.deleteMany({
      where: {
        id: {
          startsWith: "empresa-endpoint-",
        },
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates, lists, retrieves, updates and deletes an empresa", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/empresas",
      payload: {
        nombre: "Empresa Endpoint Test",
        plan: "starter",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json();
    expect(created).toHaveProperty("id");
    expect(created.nombre).toBe("Empresa Endpoint Test");
    expect(created.plan).toBe("starter");
    expect(created.activo).toBe(true);

    const listResponse = await app.inject({ method: "GET", url: "/empresas" });
    expect(listResponse.statusCode).toBe(200);
    const empresas = listResponse.json();
    expect(Array.isArray(empresas)).toBe(true);
    expect(empresas.some((item: any) => item.id === created.id)).toBe(true);

    const getResponse = await app.inject({ method: "GET", url: `/empresas/${created.id}` });
    expect(getResponse.statusCode).toBe(200);
    const found = getResponse.json();
    expect(found.id).toBe(created.id);
    expect(found.nombre).toBe("Empresa Endpoint Test");

    const updateResponse = await app.inject({
      method: "PUT",
      url: `/empresas/${created.id}`,
      payload: {
        plan: "enterprise",
        activo: false,
      },
    });
    expect(updateResponse.statusCode).toBe(200);
    const updated = updateResponse.json();
    expect(updated.plan).toBe("enterprise");
    expect(updated.activo).toBe(false);

    const deleteResponse = await app.inject({ method: "DELETE", url: `/empresas/${created.id}` });
    expect(deleteResponse.statusCode).toBe(204);

    const deletedGetResponse = await app.inject({ method: "GET", url: `/empresas/${created.id}` });
    expect(deletedGetResponse.statusCode).toBe(404);
  });
});
