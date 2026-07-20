import { afterAll, afterEach, describe, expect, it } from "vitest";
import Fastify from "fastify";
import { PrismaPlanRepository } from "../../src/modules/plan/infrastructure/prisma-plan-repository";
import { PlanService } from "../../src/modules/plan/application/plan-service";
import { registerPlanRoutes } from "../../src/modules/plan/presentation/plan-controller";
import { prisma } from "../../src/shared/database/prisma";

describe("Plan HTTP endpoints", () => {
  const app = Fastify();
  const repository = new PrismaPlanRepository();
  const service = new PlanService(repository);
  const baseSlug = `plan-endpoint-test-${Date.now()}`;
  const createdPlanIds: string[] = [];

  registerPlanRoutes(app, service);

  async function createPlan() {
    const slug = `${baseSlug}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const response = await app.inject({
      method: "POST",
      url: "/planes",
      payload: {
        nombre: "Plan Endpoint Test",
        slug,
        descripcion: "Plan de prueba para endpoints",
        precio: 29.9,
        intervalo: "MENSUAL",
      },
    });

    expect(response.statusCode).toBe(201);
    const plan = response.json();
    expect(plan).toHaveProperty("id");
    createdPlanIds.push(plan.id);
    return plan;
  }

  afterEach(async () => {
    if (createdPlanIds.length) {
      await prisma.plan.deleteMany({ where: { id: { in: createdPlanIds } } });
      createdPlanIds.length = 0;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it("creates a plan", async () => {
    const plan = await createPlan();

    expect(plan.nombre).toBe("Plan Endpoint Test");
    expect(plan.precio).toBe(29.9);
    expect(plan.intervalo).toBe("MENSUAL");
    expect(plan.activo).toBe(true);
  });

  it("lists plans", async () => {
    await createPlan();

    const response = await app.inject({ method: "GET", url: "/planes" });
    expect(response.statusCode).toBe(200);
    const plans = response.json();
    expect(Array.isArray(plans)).toBe(true);
    expect(plans.length).toBeGreaterThan(0);
  });

  it("returns 404 for missing plan and gets a plan by id", async () => {
    const missing = await app.inject({ method: "GET", url: "/planes/nonexistent" });
    expect(missing.statusCode).toBe(404);

    const plan = await createPlan();
    const response = await app.inject({ method: "GET", url: `/planes/${plan.id}` });
    expect(response.statusCode).toBe(200);
    const found = response.json();
    expect(found.id).toBe(plan.id);
    expect(found.slug).toBe(plan.slug);
  });

  it("updates a plan", async () => {
    const plan = await createPlan();

    const response = await app.inject({
      method: "PUT",
      url: `/planes/${plan.id}`,
      payload: {
        nombre: "Plan Endpoint Updated",
        precio: 39.9,
        intervalo: "ANUAL",
      },
    });

    expect(response.statusCode).toBe(200);
    const updated = response.json();
    expect(updated.nombre).toBe("Plan Endpoint Updated");
    expect(updated.precio).toBe(39.9);
    expect(updated.intervalo).toBe("ANUAL");
  });

  it("activates and deactivates a plan", async () => {
    const plan = await createPlan();

    const deactivateResponse = await app.inject({ method: "PATCH", url: `/planes/${plan.id}/desactivar` });
    expect(deactivateResponse.statusCode).toBe(200);
    expect(deactivateResponse.json().activo).toBe(false);

    const activateResponse = await app.inject({ method: "PATCH", url: `/planes/${plan.id}/activar` });
    expect(activateResponse.statusCode).toBe(200);
    expect(activateResponse.json().activo).toBe(true);
  });
});
