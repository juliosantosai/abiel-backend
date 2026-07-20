import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import Fastify from "fastify";
import { PrismaConfiguracionRepository } from "../../src/modules/configuracion/infrastructure/prisma-configuracion-repository";
import { ConfiguracionService } from "../../src/modules/configuracion/application/configuracion-service";
import { registerConfiguracionRoutes } from "../../src/modules/configuracion/presentation/configuracion-controller";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

describe("Configuracion HTTP endpoints", () => {
  const app = Fastify();
  const configuracionRepository = new PrismaConfiguracionRepository();
  const empresaRepository = { findById: async (id: string) => prisma.empresa.findUnique({ where: { id } }) } as any;
  const service = new ConfiguracionService(configuracionRepository, empresaRepository);

  beforeAll(() => {
    ensurePrismaSchema();
  });

  registerConfiguracionRoutes(app, service);

  const createdIds: string[] = [];

  afterEach(async () => {
    if (createdIds.length) {
      await prisma.configuracion.deleteMany({ where: { id: { in: createdIds } } });
      createdIds.length = 0;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates, lists, retrieves and updates configuration", async () => {
    const empresa = await prisma.empresa.create({
      data: {
        id: `empresa-config-endpoint-${Date.now()}`,
        nombre: "Empresa Config",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const createResponse = await app.inject({
      method: "POST",
      url: "/configuraciones",
      payload: {
        empresaId: empresa.id,
        idioma: "ES",
        zonaHoraria: "UTC",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json();
    createdIds.push(created.id);
    expect(created.empresaId).toBe(empresa.id);
    expect(created.idioma).toBe("ES");

    const listResponse = await app.inject({ method: "GET", url: "/configuraciones" });
    expect(listResponse.statusCode).toBe(200);

    const getResponse = await app.inject({ method: "GET", url: `/configuraciones/${created.id}` });
    expect(getResponse.statusCode).toBe(200);

    const byEmpresaResponse = await app.inject({ method: "GET", url: `/empresas/${empresa.id}/configuracion` });
    expect(byEmpresaResponse.statusCode).toBe(200);

    const updateResponse = await app.inject({
      method: "PUT",
      url: `/configuraciones/${created.id}`,
      payload: { idioma: "EN", zonaHoraria: "America/Bogota" },
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().idioma).toBe("EN");

    const activateResponse = await app.inject({ method: "PATCH", url: `/configuraciones/${created.id}/activar` });
    expect(activateResponse.statusCode).toBe(200);

    const deactivateResponse = await app.inject({ method: "PATCH", url: `/configuraciones/${created.id}/desactivar` });
    expect(deactivateResponse.statusCode).toBe(200);
  });
});
