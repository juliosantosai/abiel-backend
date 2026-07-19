import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import Fastify from "fastify";
import { PrismaSuscripcionRepository } from "../../src/modules/suscripcion/infrastructure/prisma-suscripcion-repository";
import { SuscripcionService } from "../../src/modules/suscripcion/application/suscripcion-service";
import { registerSuscripcionRoutes } from "../../src/modules/suscripcion/presentation/suscripcion-controller";
import { prisma } from "../../src/shared/database/prisma";
import { ensurePrismaSchema } from "../setup";

describe("Suscripcion HTTP endpoints", () => {
  const app = Fastify();
  const suscripcionRepository = new PrismaSuscripcionRepository();
  const empresaRepository = { findById: async (id: string) => prisma.empresa.findUnique({ where: { id } }) } as any;
  const planRepository = { findById: async (id: string) => prisma.plan.findUnique({ where: { id } }) } as any;
  const service = new SuscripcionService(suscripcionRepository, empresaRepository, planRepository);

  beforeAll(() => {
    ensurePrismaSchema();
  });

  registerSuscripcionRoutes(app, service);

  const createdIds: string[] = [];

  afterEach(async () => {
    if (createdIds.length) {
      await prisma.suscripcion.deleteMany({ where: { id: { in: createdIds } } });
      createdIds.length = 0;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  async function createEmpresaAndPlan() {
    const empresa = await prisma.empresa.create({
      data: {
        id: `empresa-suscripcion-endpoint-${Date.now()}`,
        nombre: "Empresa Suscripcion",
        plan: "starter",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const plan = await prisma.plan.create({
      data: {
        id: `plan-suscripcion-endpoint-${Date.now()}`,
        nombre: "Plan Suscripcion",
        slug: `plan-suscripcion-endpoint-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        descripcion: "Plan de prueba",
        precio: 49.9,
        intervalo: "MENSUAL",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { empresa, plan };
  }

  it("creates, lists, retrieves and updates subscriptions", async () => {
    const { empresa, plan } = await createEmpresaAndPlan();

    const createResponse = await app.inject({
      method: "POST",
      url: "/suscripciones",
      payload: {
        empresaId: empresa.id,
        planId: plan.id,
        fechaInicio: "2026-01-01T00:00:00.000Z",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json();
    createdIds.push(created.id);
    expect(created.empresaId).toBe(empresa.id);
    expect(created.planId).toBe(plan.id);

    const listResponse = await app.inject({ method: "GET", url: "/suscripciones" });
    expect(listResponse.statusCode).toBe(200);
    const list = listResponse.json();
    expect(Array.isArray(list)).toBe(true);

    const getResponse = await app.inject({ method: "GET", url: `/suscripciones/${created.id}` });
    expect(getResponse.statusCode).toBe(200);

    const byEmpresaResponse = await app.inject({ method: "GET", url: `/empresas/${empresa.id}/suscripciones` });
    expect(byEmpresaResponse.statusCode).toBe(200);

    const activateResponse = await app.inject({ method: "PATCH", url: `/suscripciones/${created.id}/activar` });
    expect(activateResponse.statusCode).toBe(200);
    expect(activateResponse.json().estado).toBe("ACTIVA");

    const cancelResponse = await app.inject({ method: "PATCH", url: `/suscripciones/${created.id}/cancelar` });
    expect(cancelResponse.statusCode).toBe(200);
    expect(cancelResponse.json().estado).toBe("CANCELADA");

    const expired = await app.inject({
      method: "POST",
      url: "/suscripciones",
      payload: {
        empresaId: empresa.id,
        planId: plan.id,
        fechaInicio: "2026-01-01T00:00:00.000Z",
      },
    });
    const expiredSubscription = expired.json();
    createdIds.push(expiredSubscription.id);
    const expireResponse = await app.inject({ method: "PATCH", url: `/suscripciones/${expiredSubscription.id}/expirar` });
    expect(expireResponse.statusCode).toBe(200);
    expect(expireResponse.json().estado).toBe("EXPIRADA");

    const changePlanResponse = await app.inject({
      method: "PATCH",
      url: `/suscripciones/${expiredSubscription.id}/cambiar-plan`,
      payload: { planId: plan.id },
    });
    expect(changePlanResponse.statusCode).toBe(200);
  });
});
