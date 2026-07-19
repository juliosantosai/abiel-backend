import { describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import { PlanService } from "../../src/modules/plan/application/plan-service";
import { registerPlanRoutes } from "../../src/modules/plan/presentation/plan-controller";
import { Plan } from "../../src/modules/plan/domain/plan";

describe("Plan module", () => {
  it("creates a plan and validates required fields", async () => {
    const repository = {
      findBySlug: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn().mockImplementation(async (plan) => plan),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const service = new PlanService(repository as any);

    const result = await service.crearPlan({
      nombre: "Starter",
      slug: "starter",
      descripcion: "Plan inicial",
      precio: 19.9,
      intervalo: "MENSUAL",
    });

    expect(result.nombre).toBe("Starter");
    expect(result.slug).toBe("starter");
    expect(result.descripcion).toBe("Plan inicial");
    expect(result.precio).toBe(19.9);
    expect(result.activo).toBe(true);
    expect(repository.create).toHaveBeenCalled();
  });

  it("throws when nombre is missing", async () => {
    const repository = { findBySlug: vi.fn().mockResolvedValue(null), create: vi.fn() };
    const service = new PlanService(repository as any);

    await expect(
      service.crearPlan({
        nombre: "",
        slug: "starter",
        descripcion: "Plan",
        precio: 9.9,
        intervalo: "MENSUAL",
      })
    ).rejects.toThrow("El nombre del plan es obligatorio");
  });

  it("throws when precio is negative", async () => {
    const repository = { findBySlug: vi.fn().mockResolvedValue(null), create: vi.fn() };
    const service = new PlanService(repository as any);

    await expect(
      service.crearPlan({
        nombre: "Starter",
        slug: "starter",
        descripcion: "Plan",
        precio: -1,
        intervalo: "MENSUAL",
      })
    ).rejects.toThrow("El precio del plan no puede ser negativo");
  });

  it("updates and toggles active state on Plan entity", () => {
    const plan = new Plan({
      id: "plan-1",
      nombre: "Starter",
      slug: "starter",
      descripcion: "Plan inicial",
      precio: 19.9,
      intervalo: "MENSUAL",
      activo: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    plan.cambiarNombre("Enterprise");
    expect(plan.nombre).toBe("Enterprise");

    plan.cambiarPrecio(49.9);
    expect(plan.precio).toBe(49.9);

    plan.desactivar();
    expect(plan.activo).toBe(false);

    plan.activar();
    expect(plan.activo).toBe(true);
  });

  it("exposes HTTP endpoints for plans", async () => {
    const service = {
      listarPlanes: vi.fn().mockResolvedValue([]),
      obtenerPlanPorId: vi.fn().mockResolvedValue({
        id: "plan-1",
        nombre: "Starter",
        slug: "starter",
        descripcion: "Plan inicial",
        precio: 19.9,
        intervalo: "MENSUAL",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      crearPlan: vi.fn().mockImplementation(async (input) => ({
        id: "plan-2",
        nombre: input.nombre,
        slug: input.slug,
        descripcion: input.descripcion ?? "",
        precio: input.precio,
        intervalo: input.intervalo,
        activo: input.activo ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      actualizarPlan: vi.fn().mockImplementation(async (id, input) => ({
        id,
        nombre: input.nombre ?? "Starter",
        slug: input.slug ?? "starter",
        descripcion: input.descripcion ?? "Plan inicial",
        precio: input.precio ?? 19.9,
        intervalo: input.intervalo ?? "MENSUAL",
        activo: input.activo ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      activarPlan: vi.fn().mockImplementation(async (id) => ({
        id,
        nombre: "Starter",
        slug: "starter",
        descripcion: "Plan inicial",
        precio: 19.9,
        intervalo: "MENSUAL",
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      desactivarPlan: vi.fn().mockImplementation(async (id) => ({
        id,
        nombre: "Starter",
        slug: "starter",
        descripcion: "Plan inicial",
        precio: 19.9,
        intervalo: "MENSUAL",
        activo: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      eliminarPlan: vi.fn().mockResolvedValue(undefined),
    };

    const app = Fastify();
    registerPlanRoutes(app, service as any);

    const createResponse = await app.inject({
      method: "POST",
      url: "/planes",
      payload: { nombre: "Starter", slug: "starter", descripcion: "Plan inicial", precio: 19.9, intervalo: "MENSUAL" },
    });
    expect(createResponse.statusCode).toBe(201);

    const listResponse = await app.inject({ method: "GET", url: "/planes" });
    expect(listResponse.statusCode).toBe(200);

    const getResponse = await app.inject({ method: "GET", url: "/planes/plan-1" });
    expect(getResponse.statusCode).toBe(200);

    const updateResponse = await app.inject({
      method: "PUT",
      url: "/planes/plan-1",
      payload: { precio: 29.9 },
    });
    expect(updateResponse.statusCode).toBe(200);

    const activateResponse = await app.inject({ method: "PATCH", url: "/planes/plan-1/activar" });
    expect(activateResponse.statusCode).toBe(200);

    const deactivateResponse = await app.inject({ method: "PATCH", url: "/planes/plan-1/desactivar" });
    expect(deactivateResponse.statusCode).toBe(200);

    const deleteResponse = await app.inject({ method: "DELETE", url: "/planes/plan-1" });
    expect(deleteResponse.statusCode).toBe(204);

    await app.close();
  });
});
